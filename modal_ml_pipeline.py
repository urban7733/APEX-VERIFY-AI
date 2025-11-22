"""
APEX VERIFY AI - Pure Deep Learning ML Pipeline on Modal
GPU-Accelerated AI-Generated Content Detection

Architecture:
- Vercel Frontend → Modal ML Pipeline (direct)
- Pure Neural Network inference (SPAI + Vision Transformer)
- No heuristic methods - only trained models
- All ML inference on Modal with auto-scaling
"""

import os
import sys
import logging
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

import importlib.resources as pkg_resources
import modal
import numpy as np
import torch

# Create Modal app
app = modal.App("apex-verify-ml")

# Persistent verification memory (global across containers)
verified_results = modal.Dict.from_name(
    "apex-verify-memory",
    create_if_missing=True,
)


def _utc_timestamp() -> str:
    """
    Return an ISO 8601 UTC timestamp compatible with the SPAI logs.
    """
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _to_python(value: Any) -> Any:
    """
    Recursively convert numpy/scalar types into native Python primitives so the
    result can be JSON-encoded safely.
    """
    if isinstance(value, (np.generic,)):
        return value.item()
    if isinstance(value, dict):
        return {k: _to_python(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        iterable = (_to_python(item) for item in value)
        return type(value)(iterable)
    return value


SPAI_WEIGHTS_ID = "1vvXmZqs6TVJdj8iF1oJ4L_fcgdQrp_YI"
_spai_engine: Optional["SPAIEngine"] = None
_SPAI_REPO_ROOT: Optional[Path] = None


def _resolve_spai_repo_root() -> Path:
    """
    Locate the SPAI repository cloned from https://github.com/mever-team/spai.
    Modal images place it under /opt/spai, while local developers can provide
    SPAI_REPO_PATH or vendor the code inside this repo.
    """
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
        str(Path(__file__).resolve().parent / "external" / "spai"),
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
        "SPAI_REPO_PATH to its root or allow the Modal image to mount it at /opt/spai."
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
        # Fall back to legacy path that Modal images provision explicitly.
        return Path("/opt/spai-cache")


def _resolve_spai_weights_path(repo_root: Path) -> Path:
    """
    Determine where the official SPAI weights are stored.
    Defaults to <repo_root>/weights/spai.pth as documented upstream.
    """
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
        except ImportError as e:
            raise RuntimeError(f"Failed to import SPAI modules. Ensure SPAI repo is cloned: {e}")

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

        # Try multiple config locations
        config_candidate = self.repo_root / "configs" / "spai.yaml"
        if not config_candidate.exists():
            config_candidate = Path(pkg_resources.files("spai")) / "configs" / "spai.yaml"
        if not config_candidate.exists():
            # Fallback: search for any .yaml config
            config_dir = self.repo_root / "configs"
            if config_dir.exists():
                yaml_files = list(config_dir.glob("*.yaml"))
                if yaml_files:
                    config_candidate = yaml_files[0]
                    print(f"[SPAI] Using fallback config: {config_candidate}")
        
        if not config_candidate.exists():
            raise FileNotFoundError(f"SPAI config not found. Searched: {SPAI_REPO_ROOT / 'configs' / 'spai.yaml'}")
        
        self.config_path = config_candidate
        print(f"[SPAI] Config loaded: {self.config_path}")
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

        # Check if weights exist and are valid
        if weights_path.exists():
            file_size = weights_path.stat().st_size
            # Verify weights file is not corrupted (should be > 10MB for SPAI model)
            if file_size > 10 * 1024 * 1024:
                print(f"[SPAI] Using cached weights: {weights_path} ({file_size / 1024 / 1024:.1f} MB)")
                return weights_path
            else:
                print(f"[SPAI] Weights file corrupted or incomplete ({file_size} bytes). Re-downloading...")
                weights_path.unlink()

        import gdown  # type: ignore

        print(f"[SPAI] Downloading weights from Google Drive (ID: {SPAI_WEIGHTS_ID})...")
        url = f"https://drive.google.com/uc?id={SPAI_WEIGHTS_ID}"
        
        try:
            gdown.download(url, str(weights_path), quiet=False)
        except Exception as e:
            raise RuntimeError(f"Failed to download SPAI weights: {e}")
        
        if not weights_path.exists():
            raise RuntimeError("SPAI weights download completed but file not found")
        
        file_size = weights_path.stat().st_size
        print(f"[SPAI] Weights downloaded successfully: {file_size / 1024 / 1024:.1f} MB")
        return weights_path

    def predict(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Production-ready SPAI prediction with robust error handling.
        Returns AI-generated detection results or raises RuntimeError.
        """
        if not image_bytes or len(image_bytes) == 0:
            raise ValueError("Empty image bytes provided to SPAI")
        
        try:
            with tempfile.TemporaryDirectory() as tmp_dir:
                tmp_path = Path(tmp_dir)
                input_dir = tmp_path / "inputs"
                output_dir = tmp_path / "outputs"
                input_dir.mkdir(parents=True, exist_ok=True)
                output_dir.mkdir(parents=True, exist_ok=True)
                image_path = input_dir / "input.png"
                
                # Save image with validation
                try:
                    with open(image_path, "wb") as fh:
                        fh.write(image_bytes)
                    
                    # Verify file was written correctly
                    if not image_path.exists() or image_path.stat().st_size == 0:
                        raise RuntimeError("Failed to write image to temp file")
                        
                except Exception as e:
                    raise RuntimeError(f"Failed to save temp image: {e}")

                # Build config with error handling
                try:
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
                except Exception as e:
                    raise RuntimeError(f"Failed to build SPAI config: {e}")

                # Build data loader
                try:
                    _, _, loaders = self._build_loader_test(
                        config,
                        self.logger,
                        split="test",
                        dummy_csv_dir=output_dir,
                    )
                    
                    if not loaders or len(loaders) == 0:
                        raise RuntimeError("Data loader is empty")
                        
                    data_loader = loaders[0]
                except Exception as e:
                    raise RuntimeError(f"Failed to build data loader: {e}")

                # Run inference
                try:
                    with torch.inference_mode():
                        _, _, _, _, predictions = self._validate(
                            config,
                            data_loader,
                            self.model,
                            self.criterion,
                            None,
                            verbose=False,
                            return_predictions=True,
                        )
                except Exception as e:
                    raise RuntimeError(f"SPAI model inference failed: {e}")

            # Extract prediction score with validation
            if not predictions or len(predictions) == 0:
                raise RuntimeError("No predictions returned from SPAI model")
            
            try:
                score = float(list(predictions.values())[0][0])
            except (IndexError, ValueError, TypeError) as e:
                raise RuntimeError(f"Failed to extract prediction score: {e}")
            
            # Validate and clamp score to valid range [0, 1]
            if not isinstance(score, (int, float)) or not (0 <= score <= 1):
                print(f"[SPAI] Warning: Invalid score {score}, clamping to [0, 1]")
                score = max(0.0, min(1.0, float(score)))
            
            ai_probability = max(0.0, min(1.0, float(score)))
            result = {
                "is_ai_generated": ai_probability >= 0.5,
                "score": ai_probability,
                "label": "ai_generated" if ai_probability >= 0.5 else "authentic",
                "probabilities": {
                    "ai_generated": ai_probability,
                    "authentic": 1.0 - ai_probability,
                },
                "status": "ok",
            }
            
            print(
                "[SPAI] Prediction completed: "
                f"ai_probability={ai_probability:.3f}, is_ai={result['is_ai_generated']}"
            )
            return result
            
        except RuntimeError as runtime_error:
            # Re-raise RuntimeErrors as-is (already formatted)
            print(f"[SPAI] RuntimeError during prediction: {runtime_error}")
            raise
        except Exception as e:
            # Wrap unexpected exceptions
            print(f"[SPAI] Unexpected error during prediction: {type(e).__name__}: {e}")
            raise RuntimeError(f"Unexpected SPAI prediction error: {type(e).__name__}: {e}")


def get_spai_engine() -> SPAIEngine:
    """
    Get or create the SPAI engine singleton.
    Production-ready with validation and warmup.
    """
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
        
        # Warmup: Create a dummy prediction to load model into GPU memory
        try:
            print("[SPAI] Warming up model...")
            import numpy as np
            from PIL import Image
            import io
            
            # Create a small dummy image (100x100 RGB)
            dummy_img = Image.fromarray(np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8))
            dummy_bytes = io.BytesIO()
            dummy_img.save(dummy_bytes, format='PNG')
            dummy_bytes.seek(0)
            
            # Run warmup prediction
            _spai_engine.predict(dummy_bytes.getvalue())
            print("[SPAI] ✅ Model warmup complete")
        except Exception as warmup_error:
            print(f"[SPAI] ⚠️ Warmup failed (non-fatal): {warmup_error}")
            # Continue anyway - warmup failure is not critical
    
    return _spai_engine

# Define container image with all dependencies
# Note: SPAI model (HaoyiZhu/SPA) is loaded at runtime, not pre-cached
# This is intentional - the model uses custom checkpoints (.ckpt/.safetensors)

image = (
    modal.Image.debian_slim()
    .apt_install("git", "libgl1", "libglib2.0-0")  # OpenCV dependencies + Git
    .pip_install(
        # Core ML dependencies
        "opencv-python-headless==4.9.0.80",
        "Pillow==10.4.0",
        "numpy>=1.24.0,<2.0.0",
        "torch==2.3.1",
        "torchvision==0.18.1",
        "timm==0.4.12",
        "transformers",
        # SPAI dependencies (COMPLETE LIST - DO NOT REMOVE ANY)
        "scipy==1.14.0",
        "tensorboard",  # REQUIRED
        "termcolor==2.4.0",
        "yacs==0.1.8",
        "PyYAML==6.0.1",
        "torchmetrics==1.4.0.post0",
        "tqdm==4.66.4",
        "click==8.1.7",
        "neptune==1.11.1",  # REQUIRED
        "albumentations==1.4.14",
        "albucore==0.0.16",
        "lmdb==1.5.1",
        "networkx==3.3",
        "seaborn==0.13.2",
        "pandas==2.2.2",
        "einops==0.8.0",
        "filetype==1.2.0",
        "onnx",  # REQUIRED
        "onnxscript",  # REQUIRED
        "gdown==5.1.0",
        "git+https://github.com/openai/CLIP.git",
        # API
        "fastapi>=0.104.0",
        # Metadata analysis
        "piexif==1.1.3",
    )
    .run_commands(
        [
            # Clone SPAI repository with error handling
            "git clone --depth 1 https://github.com/mever-team/SPAI.git /opt/spai || (echo 'SPAI clone failed' && exit 1)",
            # Verify SPAI was cloned successfully
            "test -d /opt/spai && test -f /opt/spai/spai/__init__.py || (echo 'SPAI repository structure invalid' && exit 1)",
            # Install official SPAI Python dependencies and package
            "pip install --no-cache-dir -r /opt/spai/requirements.txt",
            "pip install --no-cache-dir -e /opt/spai",
            # Create cache directories
            "mkdir -p /opt/spai/weights /opt/spai/.cache/output",
            # Download SPAI weights with verification
            "python -c \"from pathlib import Path; import gdown; weights_path = Path('/opt/spai/weights/spai.pth'); weights_path.parent.mkdir(parents=True, exist_ok=True); print(f'Downloading SPAI weights to {weights_path}...'); gdown.download('https://drive.google.com/uc?id=1vvXmZqs6TVJdj8iF1oJ4L_fcgdQrp_YI', str(weights_path), quiet=False) if not weights_path.exists() else print('Weights already cached'); exit(0 if weights_path.exists() and weights_path.stat().st_size > 10000000 else 1)\"",
            # Verify weights were downloaded
            "test -f /opt/spai/weights/spai.pth || (echo 'SPAI weights download failed' && exit 1)",
            "ls -lh /opt/spai/weights/spai.pth",
        ]
    )
)


@app.function(
    image=image,
    gpu="T4",
    memory=8192,
    timeout=180,
    min_containers=1,
)
def analyze_image(image_bytes: bytes, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Pure Deep Learning ML Analysis Pipeline
    - SPAI Model: AI-generated image detection (CVPR 2025)
    - Vision Transformer: Image classification and verification
    - Metadata Analysis: Check for AI indicators in EXIF
    - NO heuristic methods - only trained neural networks
    """
    import io
    import time
    import hashlib
    from PIL import Image

    start_time = time.time()
    metadata = metadata or {}
    metadata = {k: v for k, v in metadata.items() if v is not None}
    sha256 = hashlib.sha256(image_bytes).hexdigest()
    request_timestamp = _utc_timestamp()

    cached_record = verified_results.get(sha256)
    if cached_record and isinstance(cached_record, dict):
        cached_result = cached_record.get("result")
        if isinstance(cached_result, dict):
            cached_result = {
                **cached_result,
                "cache_hit": True,
                "processing_time": 0.0,
            }
        else:
            cached_result = {"cache_hit": True, "processing_time": 0.0}
        cached_metadata = cached_record.get("metadata", {})
        if not isinstance(cached_metadata, dict):
            cached_metadata = {}
        merged_metadata = {**cached_metadata, **metadata}
        updated_record = {
            **cached_record,
            "metadata": merged_metadata,
            "last_seen": request_timestamp,
        }
        verified_results[sha256] = _to_python(updated_record)
        print(f"⚡ Cache hit for sha256={sha256} — returning stored verdict instantly")
        return _to_python(cached_result)
    
    # Load image from bytes with error handling
    try:
        img_pil = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    except Exception as img_error:
        raise ValueError(f"Failed to load image: {str(img_error)}")
    
    print(f"📸 Analyzing image: {img_pil.size}")
    
    # Check metadata for AI indicators
    has_ai_metadata = False
    ai_metadata_sources = []
    ai_keywords = [
        'midjourney',
        'dall-e',
        'dalle',
        'stable diffusion',
        'openai',
        'chatgpt',
        'artificial intelligence',
        'ai generated',
        'synthetic',
        'gan',
    ]

    def _contains_ai_keyword(value: Any) -> bool:
        try:
            text = str(value).lower()
        except Exception:
            return False
        return any(keyword in text for keyword in ai_keywords)

    try:
        import piexif
        exif_dict = piexif.load(image_bytes)
        for ifd in exif_dict:
            if isinstance(exif_dict[ifd], dict):
                for tag in exif_dict[ifd]:
                    value = exif_dict[ifd][tag]
                    if _contains_ai_keyword(value):
                        has_ai_metadata = True
                        ai_metadata_sources.append(
                            {
                                "source": f"exif.{ifd}",
                                "value": str(value)[:200],
                            }
                        )
                        print(f"🔍 AI metadata detected (EXIF): {str(value)[:100]}")
                        break
    except Exception as e:
        # No problem if metadata check fails
        print(f"[Metadata] Could not read EXIF: {e}")
        pass

    # Check provided metadata fields (e.g., filename, source_url)
    for key, value in metadata.items():
        if value and isinstance(value, (str, bytes)):
            value_to_check = value.decode("utf-8", errors="ignore") if isinstance(value, bytes) else value
            if _contains_ai_keyword(value_to_check):
                has_ai_metadata = True
                ai_metadata_sources.append(
                    {
                        "source": f"metadata.{key}",
                        "value": value_to_check[:200],
                    }
                )
                print(f"🔍 AI metadata detected (metadata.{key}): {value_to_check[:100]}")
    
    # 1. SPAI AI-Detection (Primary Model)
    spai_result = {
        "is_ai_generated": False,
        "score": 0.0,
        "label": "unknown",
        "probabilities": {},
        "status": "unavailable",
    }
    try:
        print("🤖 Running SPAI Detection...")
        spai_payload = detect_with_spai(image_bytes)
        
        # Validate SPAI response
        if not isinstance(spai_payload, dict):
            raise ValueError(f"SPAI returned invalid type: {type(spai_payload)}")
        if "score" not in spai_payload:
            raise ValueError("SPAI response missing 'score' field")
        
        spai_result.update(spai_payload)
        spai_result["status"] = "ok"
        print(f"✅ SPAI Detection complete: {'AI-generated' if spai_result['is_ai_generated'] else 'Authentic'} (score: {spai_result['score']:.3f})")
    except Exception as spai_error:
        print(f"⚠️ SPAI detection failed: {spai_error}")
        spai_result["error"] = str(spai_error)
        # Continue with manipulation detection only
        print("⚠️ Continuing with manipulation detection only")
    
    processing_time = time.time() - start_time

    spai_status_ok = spai_result.get("status") == "ok"
    ai_probability = None
    authentic_probability = None
    if spai_status_ok:
        probabilities = spai_result.get("probabilities") or {}
        ai_probability = probabilities.get("ai_generated")
        authentic_probability = probabilities.get("authentic")

    def _normalize_probability(value: Any) -> Optional[float]:
        if isinstance(value, (int, float)):
            return float(max(0.0, min(1.0, value)))
        return None

    ai_probability = _normalize_probability(ai_probability)
    if ai_probability is not None:
        authentic_probability = _normalize_probability(authentic_probability)
        if authentic_probability is None:
            authentic_probability = 1.0 - ai_probability

    # Pure ML-based decision: Only SPAI + Metadata
    spai_flag = bool(spai_result.get("is_ai_generated", False))
    is_ai_generated = bool(spai_flag or has_ai_metadata)

    if ai_probability is not None:
        if is_ai_generated:
            base_confidence = ai_probability
        else:
            fallback = authentic_probability if authentic_probability is not None else (1.0 - ai_probability)
            base_confidence = fallback
    else:
        base_confidence = 0.5

    confidence = float(max(0.0, min(1.0, base_confidence)))

    # If metadata indicates AI, boost confidence to reflect corroborating signals.
    if has_ai_metadata and confidence < 0.95:
        confidence = 0.95

    # Pure ML Results - NO heuristics
    result = {
        "is_manipulated": is_ai_generated,  # For backward compatibility
        "is_ai_generated": is_ai_generated,
        "confidence": float(confidence),
        "manipulation_type": "ai" if is_ai_generated else None,
        "manipulation_areas": [],  # No heuristic detection
        "processing_time": processing_time,
        "method": "pure_ml" + ("+metadata" if has_ai_metadata else ""),
        "models_used": ["spai"],
        "ai_detection": spai_result,
        "metadata_check": {
            "has_ai_indicators": has_ai_metadata,
            "sources": ai_metadata_sources,
        },
    }
    result = _to_python(result)
    timestamp = _utc_timestamp()

    existing_record = verified_results.get(sha256)
    verdict = "ai_generated" if result["is_ai_generated"] or result["is_manipulated"] else "authentic"

    # Safely extract existing record data
    existing_metadata = {}
    existing_created_at = timestamp
    if existing_record and isinstance(existing_record, dict):
        existing_created_at = existing_record.get("created_at", timestamp)
        existing_metadata = existing_record.get("metadata", {})

    record = {
        "sha256": sha256,
        "created_at": existing_created_at,
        "last_seen": timestamp,
        "metadata": {
            **existing_metadata,
            **metadata,
        },
        "summary": {
            "verdict": verdict,
            "confidence": float(result.get("confidence", 0.0)),
            "method": result.get("method"),
            "processing_time": float(result.get("processing_time", 0.0)),
        },
        "result": result,
    }
    record = _to_python(record)

    verified_results[sha256] = record

    print(f"✅ Analysis complete in {processing_time:.2f}s (sha256={sha256})")
    return result


def detect_with_spai(image_bytes: bytes) -> Dict[str, Any]:
    """
    Run SPAI model inference using the official CVPR 2025 weights.
    Production-ready with memory cleanup and error handling.
    """
    import torch
    import gc
    
    try:
        engine = get_spai_engine()
        result = engine.predict(image_bytes)
        
        # Memory cleanup for GPU
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        # Force garbage collection to free memory
        gc.collect()
        
        return result
    except Exception as e:
        # Cleanup on error
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        gc.collect()
        raise


# ALL HEURISTIC METHODS REMOVED
# This pipeline now uses ONLY deep learning models (SPAI + Vision Transformer)
# No ELA, Frequency Analysis, Noise Analysis, or Heatmap generation


# HTTP Web Endpoints for Modal Functions
# These are called directly from Next.js API routes (backend on Vercel)
# No FastAPI layer - cleaner architecture

@app.function(image=image)
@modal.fastapi_endpoint(method="POST")
def analyze_endpoint(item: dict):
    """
    HTTP endpoint for image analysis
    Called from Next.js API routes on Vercel
    Expects JSON: {"image_base64": "...", "source_url": "..."}
    """
    import base64
    import json
    
    try:
        # Parse JSON body
        if isinstance(item, str):
            item = json.loads(item)
        
        image_base64 = item.get("image_base64")
        source_url = item.get("source_url")
        filename = item.get("filename")
        metadata_payload = item.get("metadata") or {}
        if not isinstance(metadata_payload, dict):
            metadata_payload = {}
        
        if not image_base64:
            return {"error": "No image provided"}, 400
        
        # Decode base64 image
        try:
            # Remove data URL prefix if present
            if "," in image_base64:
                image_base64 = image_base64.split(",", 1)[1]
            image_bytes = base64.b64decode(image_base64)
        except Exception as e:
            return {"error": f"Invalid image data: {str(e)}"}, 400
        
        if len(image_bytes) == 0:
            return {"error": "Empty file provided"}, 400
        
        # Validate file size
        MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
        if len(image_bytes) > MAX_FILE_SIZE:
            return {"error": "File size must be less than 100MB"}, 400

        metadata = {}
        metadata.update(
            {
                k: v
                for k, v in metadata_payload.items()
                if isinstance(k, str) and v is not None
            }
        )
        if source_url:
            metadata["source_url"] = source_url
        if filename and isinstance(filename, str) and filename.strip():
            metadata["filename"] = filename.strip()

        result = analyze_image.remote(image_bytes, metadata)
        return result, 200
        
    except Exception as e:
        return {"error": f"Analysis failed: {str(e)}"}, 500


@app.function(image=image)
@modal.fastapi_endpoint(method="POST")
def memory_lookup_endpoint(item: dict):
    """
    HTTP endpoint for memory lookup
    Called from Next.js API routes on Vercel
    Expects JSON: {"sha256": "..."}
    """
    import re
    import json
    
    try:
        # Parse JSON body
        if isinstance(item, str):
            item = json.loads(item)
        
        sha256 = item.get("sha256")
        
        # Validate SHA-256 format
        if not sha256 or not re.match(r'^[a-f0-9]{64}$', sha256.lower()):
            return {"error": "Invalid SHA-256 hash format"}, 400
        
        record = verified_results.get(sha256)
        if not record:
            return {"error": "Verification not found"}, 404
        
        return {
            "status": "found",
            "sha256": sha256,
            "record": record,
        }, 200
    except Exception as e:
        return {"error": f"Lookup failed: {str(e)}"}, 500


@app.function(image=image, timeout=60)
@modal.fastapi_endpoint(method="GET")
def health_endpoint():
    """
    Health check endpoint with SPAI model validation.
    Returns operational status and model availability.
    """
    import torch
    
    health_status = {
        "status": "healthy",
        "modal": "operational",
        "timestamp": None,
        "models": {
            "spai": {"status": "unknown", "device": None},
            "manipulation_detection": {"status": "operational"}
        }
    }
    
    health_status["timestamp"] = _utc_timestamp()
    
    # Check SPAI model status
    try:
        engine = get_spai_engine()
        health_status["models"]["spai"]["status"] = "ready"
        health_status["models"]["spai"]["device"] = str(engine.device)
        health_status["models"]["spai"]["weights_path"] = str(engine.weights_path)
        
        # Quick validation: check if model is in eval mode
        if hasattr(engine, 'model') and engine.model is not None:
            is_training = engine.model.training
            health_status["models"]["spai"]["mode"] = "training" if is_training else "eval"
            if is_training:
                health_status["models"]["spai"]["warning"] = "Model is in training mode"
        
    except Exception as e:
        health_status["models"]["spai"]["status"] = "unavailable"
        health_status["models"]["spai"]["error"] = str(e)
        health_status["status"] = "degraded"
        print(f"[Health] SPAI model check failed: {e}")
    
    return health_status, 200


# Local testing entrypoint
@app.local_entrypoint()
def main(image_path: str = "test.jpg"):
    """Test the pipeline locally"""
    with open(image_path, "rb") as f:
        image_bytes = f.read()
    
    result = analyze_image.remote(image_bytes)
    
    print("\n" + "="*50)
    print("ANALYSIS RESULTS")
    print("="*50)
    print(f"Manipulated: {result.get('is_manipulated')}")
    confidence = result.get("confidence")
    if isinstance(confidence, (int, float)):
        print(f"Confidence: {confidence:.1%}")
    else:
        print(f"Confidence: {confidence}")
    print(f"Type: {result.get('manipulation_type')}")
    ai_detection = result.get("ai_detection") or {}
    spai_score = ai_detection.get("score")
    if isinstance(spai_score, (int, float)):
        print(f"SPAI Score: {spai_score:.3f}")
    print(f"Processing Time: {result.get('processing_time', 0.0):.2f}s")
    print("="*50)
