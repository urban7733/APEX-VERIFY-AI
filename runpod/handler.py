"""
RunPod Serverless handler that hosts the SPAI (CVPR 2025) detector on GPU.
This module focuses solely on ML inference. Metadata analysis and caching
are handled in the Vercel backend (CPU) to keep GPU time minimal.
"""

from __future__ import annotations

import base64
import importlib.resources as pkg_resources
import io
import logging
import os
import sys
import tempfile
from pathlib import Path
from typing import Any, Dict, Optional

import numpy as np
import runpod
import torch

SPAI_WEIGHTS_ID = "1vvXmZqs6TVJdj8iF1oJ4L_fcgdQrp_YI"
_spai_engine: Optional["SPAIEngine"] = None
_SPAI_REPO_ROOT: Optional[Path] = None


def _to_python(value: Any) -> Any:
    if isinstance(value, (np.generic,)):
        return value.item()
    if isinstance(value, dict):
        return {k: _to_python(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        iterable = (_to_python(item) for item in value)
        return type(value)(iterable)
    return value


def _resolve_spai_repo_root() -> Path:
    global _SPAI_REPO_ROOT
    if (
        _SPAI_REPO_ROOT is not None
        and (_SPAI_REPO_ROOT / "spai" / "__init__.py").exists()
    ):
        return _SPAI_REPO_ROOT

    candidate_strings = [
        os.environ.get("SPAI_REPO_PATH"),
        "/opt/spai",
        str(Path(__file__).resolve().parent / "spai"),
    ]

    for candidate in candidate_strings:
        if not candidate:
            continue
        path = Path(candidate).expanduser()
        if (path / "spai" / "__init__.py").exists():
            if str(path) not in sys.path:
                sys.path.append(str(path))
            _SPAI_REPO_ROOT = path
            return _SPAI_REPO_ROOT

    raise RuntimeError(
        "SPAI repository not found. Clone https://github.com/mever-team/spai and set "
        "SPAI_REPO_PATH to its root or mount it at /opt/spai."
    )


def _resolve_spai_cache_root() -> Path:
    custom = os.environ.get("SPAI_CACHE_DIR")
    if custom:
        return Path(custom).expanduser()

    if _SPAI_REPO_ROOT is not None:
        return (_SPAI_REPO_ROOT / ".cache").expanduser()

    try:
        repo_root = _resolve_spai_repo_root()
        return (repo_root / ".cache").expanduser()
    except RuntimeError:
        return Path("/tmp/spai-cache")


def _resolve_spai_weights_path(repo_root: Path) -> Path:
    custom = os.environ.get("SPAI_WEIGHTS_PATH")
    if custom:
        return Path(custom).expanduser()
    return (repo_root / "weights" / "spai.pth").expanduser()


class SPAIEngine:
    def __init__(self) -> None:
        self.repo_root = _resolve_spai_repo_root()
        self.cache_dir = _resolve_spai_cache_root()
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.output_dir = self.cache_dir / "output"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.weights_path = self._ensure_weights()

        try:
            from spai.config import get_config  # type: ignore
            from spai.models import build_cls_model  # type: ignore
            from spai.models.losses import build_loss  # type: ignore
            from spai.utils import load_pretrained  # type: ignore
            from spai.data import build_loader_test  # type: ignore
            from spai.__main__ import validate  # type: ignore
        except ImportError as exc:
            raise RuntimeError(
                "Failed to import SPAI modules. Ensure SPAI repo is cloned"
            ) from exc

        self._get_config = get_config
        self._build_cls_model = build_cls_model
        self._load_pretrained = load_pretrained
        self._build_loader_test = build_loader_test
        self._validate = validate
        self._build_loss = build_loss

        self.logger = logging.getLogger("spai")
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            handler.setFormatter(logging.Formatter("[SPAI] %(message)s"))
            self.logger.addHandler(handler)
        self.logger.setLevel(logging.WARNING)

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[SPAI] Using device: {self.device}")
        print(f"[SPAI] Weights loaded: {self.weights_path}")

        config_candidate = self.repo_root / "configs" / "spai.yaml"
        if not config_candidate.exists():
            config_candidate = Path(pkg_resources.files("spai")) / "configs" / "spai.yaml"
        if not config_candidate.exists():
            config_dir = self.repo_root / "configs"
            if config_dir.exists():
                yaml_files = list(config_dir.glob("*.yaml"))
                if yaml_files:
                    config_candidate = yaml_files[0]
                    print(f"[SPAI] Using fallback config: {config_candidate}")

        if not config_candidate.exists():
            raise FileNotFoundError(
                "SPAI config not found. Ensure configs/spai.yaml exists."
            )

        self.config_path = config_candidate
        self._opts = [
            ("DATA.NUM_WORKERS", "0"),
            ("DATA.PIN_MEMORY", "False"),
            ("DATA.TEST_PREFETCH_FACTOR", "None"),
            ("DATA.PREFETCH_FACTOR", "None"),
            ("DATA.VAL_PREFETCH_FACTOR", "None"),
            ("DATA.BATCH_SIZE", "1"),
            ("DATA.TEST_BATCH_SIZE", "1"),
        ]
        self._opts_signature = tuple(self._opts)

        base_args = {
            "cfg": str(self.config_path),
            "batch_size": 1,
            "output": str(self.output_dir),
            "tag": "apex-verify",
            "pretrained": str(self.weights_path),
            "opts": self._opts,
        }
        self.base_config = self._get_config(base_args)
        self.model = self._build_cls_model(self.base_config).to(self.device)
        self._load_pretrained(
            self.base_config,
            self.model,
            self.logger,
            checkpoint_path=self.weights_path,
            verbose=False,
        )
        self.model.eval()
        self.criterion = self._build_loss(self.base_config).to(self.device)

    def _ensure_weights(self) -> Path:
        weights_path = _resolve_spai_weights_path(self.repo_root)
        weights_path.parent.mkdir(parents=True, exist_ok=True)

        if weights_path.exists():
            if weights_path.stat().st_size > 10 * 1024 * 1024:
                return weights_path
            weights_path.unlink()

        import gdown  # type: ignore

        print(f"[SPAI] Downloading weights (ID: {SPAI_WEIGHTS_ID})...")
        url = f"https://drive.google.com/uc?id={SPAI_WEIGHTS_ID}"
        gdown.download(url, str(weights_path), quiet=False)

        if not weights_path.exists():
            raise RuntimeError("Weights download completed but file missing")
        return weights_path

    def predict(self, image_bytes: bytes) -> Dict[str, Any]:
        if not image_bytes:
            raise ValueError("Empty image payload")

        import torch

        try:
            with tempfile.TemporaryDirectory() as tmp_dir:
                tmp_path = Path(tmp_dir)
                input_dir = tmp_path / "inputs"
                output_dir = tmp_path / "outputs"
                input_dir.mkdir(parents=True, exist_ok=True)
                output_dir.mkdir(parents=True, exist_ok=True)
                image_path = input_dir / "input.png"

                with open(image_path, "wb") as fh:
                    fh.write(image_bytes)

                config = self._get_config(
                    {
                        "cfg": str(self.config_path),
                        "batch_size": 1,
                        "output": str(output_dir),
                        "tag": "apex-verify",
                        "pretrained": str(self.weights_path),
                        "test_csv": [str(input_dir)],
                        "opts": self._opts,
                    }
                )

                _, _, loaders = self._build_loader_test(
                    config,
                    self.logger,
                    split="test",
                    dummy_csv_dir=output_dir,
                )
                if not loaders:
                    raise RuntimeError("SPAI data loader is empty")

                data_loader = loaders[0]
                with torch.inference_mode():
                    (
                        _,
                        _,
                        _,
                        _,
                        predictions,
                    ) = self._validate(
                        config,
                        data_loader,
                        self.model,
                        self.criterion,
                        None,
                        verbose=False,
                        return_predictions=True,
                    )

            if not predictions:
                raise RuntimeError("SPAI returned no predictions")

            score = float(list(predictions.values())[0][0])
            if not 0 <= score <= 1:
                score = max(0.0, min(1.0, score))

            result = {
                "is_ai_generated": score >= 0.5,
                "score": float(score),
                "label": "ai_generated" if score >= 0.5 else "authentic",
                "probabilities": {
                    "ai_generated": float(score),
                    "authentic": float(1.0 - score),
                },
                "status": "ok",
            }
            print(
                "[SPAI] Prediction completed: "
                f"ai_probability={score:.3f}, is_ai={result['is_ai_generated']}"
            )
            return result
        except Exception:
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            raise


def get_spai_engine() -> SPAIEngine:
    global _spai_engine
    expected_signature = tuple(
        [
            ("DATA.NUM_WORKERS", "0"),
            ("DATA.PIN_MEMORY", "False"),
            ("DATA.TEST_PREFETCH_FACTOR", "None"),
            ("DATA.PREFETCH_FACTOR", "None"),
            ("DATA.VAL_PREFETCH_FACTOR", "None"),
            ("DATA.BATCH_SIZE", "1"),
            ("DATA.TEST_BATCH_SIZE", "1"),
        ]
    )
    needs_reload = (
        _spai_engine is None
        or not getattr(_spai_engine, "config_path", Path()).exists()
        or getattr(_spai_engine, "_opts_signature", None) != expected_signature
    )
    if needs_reload:
        print("[SPAI] Initializing SPAI engine...")
        _spai_engine = SPAIEngine()
        print("[SPAI] Engine initialized successfully")
    return _spai_engine


def _decode_image_from_base64(image_base64: str) -> bytes:
    try:
        return base64.b64decode(image_base64, validate=True)
    except Exception as exc:
        raise ValueError("Invalid base64 payload") from exc


def handler(event: Dict[str, Any]) -> Dict[str, Any]:
    request = event.get("input") or {}

    if request.get("health_check"):
        return {"status": "ok", "message": "spai-ready"}

    image_base64 = request.get("image_base64")
    if not image_base64 or not isinstance(image_base64, str):
        raise ValueError("image_base64 is required")

    # Clear GPU memory before each inference to prevent OOM
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.synchronize()

    image_bytes = _decode_image_from_base64(image_base64)
    engine = get_spai_engine()
    
    try:
        result = engine.predict(image_bytes)
    finally:
        # Always clean up GPU memory after inference
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    
    return {
        "status": "ok",
        "result": _to_python(result),
    }


runpod.serverless.start({"handler": handler})
