"""
APEX VERIFY AI - Complete ML Pipeline on Modal
GPU-Accelerated AI-Generated Content Detection

Architecture:
- Vercel Frontend → Modal ML Pipeline (direct)
- No intermediate backend needed
- All ML inference on Modal with auto-scaling
"""

import os
import logging
import tempfile
from pathlib import Path
import importlib.resources as pkg_resources

import modal
import numpy as np
import torch
from typing import Dict, Any, Optional
import sys

# Create Modal app
app = modal.App("apex-verify-ml")

# Persistent verification memory (global across containers)
verified_results = modal.Dict.from_name(
    "apex-verify-memory",
    create_if_missing=True,
)


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
SPAI_CACHE_DIR = Path("/opt/spai-cache")
SPAI_OUTPUT_DIR = SPAI_CACHE_DIR / "output"
SPAI_REPO_ROOT = Path("/opt/spai")
if str(SPAI_REPO_ROOT) not in sys.path and SPAI_REPO_ROOT.exists():
    sys.path.append(str(SPAI_REPO_ROOT))
_spai_engine: Optional["SPAIEngine"] = None


class SPAIEngine:
    def __init__(self) -> None:
        from spai.config import get_config  # type: ignore
        from spai.models import build_cls_model  # type: ignore
        from spai.models.losses import build_loss  # type: ignore
        from spai.utils import load_pretrained  # type: ignore
        from spai.data import build_loader_test  # type: ignore
        from spai.__main__ import validate  # type: ignore

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

        SPAI_CACHE_DIR.mkdir(parents=True, exist_ok=True)
        SPAI_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.weights_path = self._ensure_weights()
        config_candidate = SPAI_REPO_ROOT / "configs" / "spai.yaml"
        if not config_candidate.exists():
            config_candidate = Path(pkg_resources.files("spai")) / "configs" / "spai.yaml"
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
            "output": str(SPAI_OUTPUT_DIR),
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
        weights_dir = SPAI_CACHE_DIR / "weights"
        weights_dir.mkdir(parents=True, exist_ok=True)
        weights_path = weights_dir / "spai.pth"
        if weights_path.exists():
            return weights_path

        import gdown  # type: ignore

        url = f"https://drive.google.com/uc?id={SPAI_WEIGHTS_ID}"
        gdown.download(url, str(weights_path), quiet=False)
        return weights_path

    def predict(self, image_bytes: bytes) -> Dict[str, Any]:
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
            data_loader = loaders[0]

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

        score = float(list(predictions.values())[0][0])
        return {
            "is_ai_generated": score >= 0.5,
            "score": score,
            "label": "ai_generated" if score >= 0.5 else "authentic",
            "probabilities": {
                "ai_generated": score,
                "authentic": 1.0 - score,
            },
            "status": "ok",
        }


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
        _spai_engine = SPAIEngine()
    return _spai_engine

# Define container image with all dependencies
# Note: SPAI model (HaoyiZhu/SPA) is loaded at runtime, not pre-cached
# This is intentional - the model uses custom checkpoints (.ckpt/.safetensors)

image = (
    modal.Image.debian_slim()
    .apt_install("git", "libgl1", "libglib2.0-0")  # Dependencies for OpenCV and Git
    .pip_install(
        "opencv-python-headless==4.9.0.80",
        "Pillow==10.4.0",
        "numpy>=1.24.0,<2.0.0",
        "torch==2.3.1",
        "torchvision==0.18.1",
        "scipy==1.14.0",
        "tensorboard",
        "termcolor==2.4.0",
        "timm==0.4.12",
        "yacs==0.1.8",
        "torchmetrics==1.4.0.post0",
        "tqdm==4.66.4",
        "click==8.1.7",
        "neptune==1.11.1",
        "albumentations==1.4.14",
        "albucore==0.0.16",
        "lmdb==1.5.1",
        "networkx==3.3",
        "seaborn==0.13.2",
        "pandas==2.2.2",
        "einops==0.8.0",
        "filetype==1.2.0",
        "onnx",
        "onnxscript",
        "gdown==5.1.0",
        "fastapi>=0.104.0",
        "git+https://github.com/openai/CLIP.git",
    )
    .run_commands(
        [
            "git clone --depth 1 https://github.com/mever-team/SPAI.git /opt/spai",
            "mkdir -p /opt/spai-cache/weights",
            "python -c \"from pathlib import Path; import gdown; weights_path = Path('/opt/spai-cache/weights/spai.pth'); weights_path.parent.mkdir(parents=True, exist_ok=True); weights_path.exists() or gdown.download('https://drive.google.com/uc?id=1vvXmZqs6TVJdj8iF1oJ4L_fcgdQrp_YI', str(weights_path), quiet=False)\"",
        ]
    )
)


@app.function(
    image=image,
    gpu="T4",
    memory=8192,
    timeout=180,
)
def analyze_image(image_bytes: bytes, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Complete ML Analysis Pipeline
    - Manipulation Detection (ELA + Frequency + Noise)
    - Heatmap Generation
    - SPAI AI-Detection (CPU/GPU auto)
    """
    import cv2
    import numpy as np
    import io
    import time
    import hashlib
    from datetime import datetime
    from PIL import Image, ImageChops
    
    start_time = time.time()
    
    # Load image from bytes with error handling
    try:
        img_pil = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    except Exception as img_error:
        raise ValueError(f"Failed to load image: {str(img_error)}")
    
    try:
        img_array = np.frombuffer(image_bytes, dtype=np.uint8)
        img_cv = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    except Exception:
        img_cv = None
    
    if img_cv is None:
        # Fallback: build from PIL image to avoid OpenCV decode crashes
        img_cv = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
    
    print(f"📸 Analyzing image: {img_pil.size}")
    
    # 1. Manipulation Detection
    print("🔬 Running Manipulation Detection...")
    manip_result = detect_manipulation(img_pil, img_cv)
    
    # 2. Generate Heatmap
    print("🗺️ Generating Heatmap...")
    heatmap_base64 = generate_heatmap(img_cv, img_pil)
    
    # 3. SPAI AI-Detection
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
        spai_result.update(spai_payload)
        spai_result["status"] = "ok"
    except Exception as spai_error:
        print(f"⚠️ SPAI detection failed: {spai_error}")
        spai_result["error"] = str(spai_error)
    
    processing_time = time.time() - start_time
    
    combined_is_manipulated = bool(
        manip_result['is_manipulated'] or spai_result.get('is_ai_generated', False)
    )
    combined_confidence = manip_result['confidence']
    if spai_result.get('status') == 'ok':
        combined_confidence = max(combined_confidence, spai_result.get('score', 0.0))

    # Combine results
    result = {
        "is_manipulated": combined_is_manipulated,
        "is_ai_generated": spai_result.get('is_ai_generated', False),
        "confidence": combined_confidence,
        "manipulation_type": manip_result['type'],
        "manipulation_areas": manip_result['areas'],
        "ela_score": manip_result['ela_score'],
        "frequency_score": manip_result['frequency_score'],
        "noise_score": manip_result['noise_score'],
        "heatmap_base64": heatmap_base64,
        "processing_time": processing_time,
        "method": "spai+manipulation" if spai_result.get('status') == 'ok' else "manipulation_detection",
        "ai_detection": spai_result,
        "manipulation_detection": manip_result,
    }
    result = _to_python(result)
    sha256 = hashlib.sha256(image_bytes).hexdigest()

    metadata = metadata or {}
    metadata = {k: v for k, v in metadata.items() if v is not None}
    timestamp = datetime.utcnow().isoformat() + "Z"

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
    """Run SPAI model inference using the official CVPR 2025 weights."""
    engine = get_spai_engine()
    return engine.predict(image_bytes)


def detect_manipulation(img_pil: Any, img_cv) -> Dict[str, Any]:
    """
    Manipulation Detection using ELA + Frequency + Noise Analysis
    """
    import numpy as np
    from PIL import ImageChops
    import cv2
    
    # 1. Error Level Analysis (ELA)
    ela_score = perform_ela(img_pil)
    
    # 2. Frequency Domain Analysis
    freq_score = frequency_analysis(img_cv)
    
    # 3. Noise Analysis
    noise_score = noise_analysis(img_cv)
    
    # Calculate combined confidence
    confidence = (ela_score * 0.4 + freq_score * 0.3 + noise_score * 0.3)
    
    # Threshold: Real photos score 0.2-0.4, manipulated 0.7+
    is_manipulated = confidence > 0.70
    
    # Determine manipulation type
    manipulation_type = None
    if is_manipulated:
        if ela_score > 0.85:
            manipulation_type = "ai"
        elif freq_score > 0.75:
            manipulation_type = "splice"
        else:
            manipulation_type = "manual"
    
    # Orient confidence properly
    final_confidence = confidence if is_manipulated else (1.0 - confidence)
    
    # Detect manipulation areas (simplified)
    areas = []
    if is_manipulated:
        h, w = img_cv.shape[:2]
        areas = [{
            "x": w * 0.25,
            "y": h * 0.25,
            "width": w * 0.5,
            "height": h * 0.5,
            "confidence": float(confidence),
            "type": manipulation_type
        }]
    
    return {
        'is_manipulated': is_manipulated,
        'confidence': float(final_confidence),
        'type': manipulation_type,
        'ela_score': float(ela_score),
        'frequency_score': float(freq_score),
        'noise_score': float(noise_score),
        'areas': areas
    }


def perform_ela(image: Any) -> float:
    """Error Level Analysis"""
    import numpy as np
    import io
    from PIL import Image, ImageChops
    
    # Save with known quality
    tmp_buffer = io.BytesIO()
    image.save(tmp_buffer, 'JPEG', quality=90)
    tmp_buffer.seek(0)
    
    # Reload and compare
    compressed = Image.open(tmp_buffer)
    ela = ImageChops.difference(image.convert('RGB'), compressed.convert('RGB'))
    
    # Calculate score
    ela_array = np.array(ela)
    mean_diff = np.mean(ela_array)
    max_diff = np.max(ela_array)
    
    # Normalize score (0-1)
    score = min((mean_diff / 50.0) * (max_diff / 255.0), 1.0)
    
    return score


def frequency_analysis(img) -> float:
    """Frequency Domain Analysis using DCT"""
    import cv2
    import numpy as np
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
    
    # Apply DCT
    dct = cv2.dct(np.float32(gray))
    
    # Analyze high-frequency components
    h, w = dct.shape
    high_freq = dct[int(h*0.6):, int(w*0.6):]
    
    # Calculate anomaly score
    mean_hf = np.mean(np.abs(high_freq))
    std_hf = np.std(high_freq)
    
    # Normalize
    score = min((mean_hf / 100.0) * (std_hf / 50.0), 1.0)
    
    return score


def noise_analysis(img) -> float:
    """Noise Pattern Analysis"""
    import cv2
    import numpy as np
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
    
    # Calculate noise variance
    noise_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    # Normalize
    score = min(noise_var / 500.0, 1.0)
    
    return score


def generate_heatmap(img_cv, img_pil: Any) -> str:
    """Generate ELA-based heatmap and return as base64"""
    import cv2
    import numpy as np
    import io
    import base64
    from PIL import Image, ImageChops
    
    # Perform ELA
    tmp_buffer = io.BytesIO()
    img_pil.save(tmp_buffer, 'JPEG', quality=90)
    tmp_buffer.seek(0)
    compressed = Image.open(tmp_buffer)
    
    ela = ImageChops.difference(img_pil.convert('RGB'), compressed.convert('RGB'))
    ela_array = np.array(ela)
    
    # Convert to grayscale
    if len(ela_array.shape) == 3:
        ela_gray = np.mean(ela_array, axis=2)
    else:
        ela_gray = ela_array
    
    # Normalize
    ela_normalized = cv2.normalize(ela_gray, None, 0, 255, cv2.NORM_MINMAX)
    ela_normalized = ela_normalized.astype(np.uint8)
    
    # Apply colormap
    heatmap = cv2.applyColorMap(ela_normalized, cv2.COLORMAP_JET)
    
    # Resize to match original
    heatmap = cv2.resize(heatmap, (img_cv.shape[1], img_cv.shape[0]))
    
    # Blend with original
    overlay = cv2.addWeighted(img_cv, 0.6, heatmap, 0.4, 0)
    
    # Convert to base64
    _, buffer = cv2.imencode('.jpg', overlay)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    
    return img_base64


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
        if source_url:
            metadata["source_url"] = source_url

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


@app.function(image=image)
@modal.fastapi_endpoint(method="GET")
def health_endpoint():
    """Health check endpoint"""
    return {"status": "healthy", "modal": "operational"}, 200


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
    print(f"Manipulated: {result['is_manipulated']}")
    print(f"Confidence: {result['confidence']:.1%}")
    print(f"Type: {result['manipulation_type']}")
    print(f"ELA Score: {result['ela_score']:.3f}")
    print(f"Processing Time: {result['processing_time']:.2f}s")
    print("="*50)
