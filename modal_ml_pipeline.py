"""
APEX VERIFY AI - Complete ML Pipeline on Modal
GPU-Accelerated AI-Generated Content Detection

Architecture:
- Vercel Frontend → Modal ML Pipeline (direct)
- No intermediate backend needed
- All ML inference on Modal with auto-scaling
"""

import os
import modal
from typing import Dict, Any, Optional
from functools import lru_cache

# Create Modal app
app = modal.App("apex-verify-ml")

# Persistent verification memory (global across containers)
verified_results = modal.Dict.from_name(
    "apex-verify-memory",
    create_if_missing=True,
)

# Define container image with all dependencies
# Note: SPAI model (HaoyiZhu/SPA) is loaded at runtime, not pre-cached
# This is intentional - the model uses custom checkpoints (.ckpt/.safetensors)

image = (
    modal.Image.debian_slim()
    .apt_install("libgl1", "libglib2.0-0")  # OpenCV dependencies
    .pip_install(
        "opencv-python-headless==4.9.0.80",
        "Pillow>=10.0.0",
        "numpy>=1.24.0,<2.0.0",
        "fastapi",
        "python-multipart",  # Required for FastAPI file uploads
        "torch==2.3.1",
        "torchvision==0.18.1",
        "transformers==4.42.4",
        "huggingface-hub==0.23.4",
        "safetensors==0.4.3",
        "timm",  # PyTorch Image Models - required for SPAI
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
        spai_payload = detect_with_spai(img_pil)
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

    verified_results[sha256] = record

    print(f"✅ Analysis complete in {processing_time:.2f}s (sha256={sha256})")
    return result


@lru_cache(maxsize=1)
def load_spai_artifacts():
    """Load SPAI model and processor once per container."""
    from transformers import AutoImageProcessor, AutoModelForImageClassification
    import torch

    model_name = "HaoyiZhu/SPA"
    processor = AutoImageProcessor.from_pretrained(model_name)
    model = AutoModelForImageClassification.from_pretrained(model_name)
    model.eval()

    # Ensure model uses GPU if available
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    return model, processor, device


def detect_with_spai(img_pil: Any) -> Dict[str, Any]:
    """Run SPAI model inference on a PIL image."""
    import torch

    model, processor, device = load_spai_artifacts()

    inputs = processor(images=img_pil, return_tensors="pt")
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probabilities = torch.nn.functional.softmax(logits, dim=-1)

    probs = probabilities[0]
    top_idx = torch.argmax(probs).item()
    top_score = probs[top_idx].item()

    id2label = model.config.id2label or {}
    label = id2label.get(top_idx, str(top_idx))
    label_normalized = label.lower().replace("_", " ")

    ai_indicative_tokens = {"ai-generated", "ai generated", "fake", "manipulated", "synthetic"}
    is_ai_generated = any(token in label_normalized for token in ai_indicative_tokens)

    probability_map: Dict[str, float] = {}
    for idx in range(probs.shape[0]):
        label_name = id2label.get(idx, str(idx))
        probability_map[label_name] = float(probs[idx].item())

    return {
        "is_ai_generated": bool(is_ai_generated),
        "label": label,
        "score": float(top_score),
        "probabilities": probability_map,
    }


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


# FastAPI web endpoint using Modal's function decorator
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel


class MemoryLookupRequest(BaseModel):
    sha256: str

web_app = FastAPI(
    title="Apex Verify ML Pipeline",
    description="AI-Generated Content Detection on Modal",
    version="1.0.0"
)

# CORS
allowed_origins = [
    origin.strip()
    for origin in os.environ.get("APEX_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

if not allowed_origins:
    allowed_origins = ["http://localhost:3000"]

web_app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@web_app.get("/")
def root():
    return {
        "service": "Apex Verify ML Pipeline",
        "status": "operational",
        "version": "1.0.0",
        "features": [
            "Manipulation Detection (ELA + Frequency + Noise)",
            "Heatmap Generation",
            "SPAI AI-Generated Image Detection",
            "Verification Memory (SHA-256 fingerprint archive)",
        ]
    }

@web_app.get("/health")
def health():
    return {"status": "healthy", "modal": "operational"}

@web_app.post("/analyze")
async def web_analyze(
    file: UploadFile = File(...),
    source_url: Optional[str] = Form(None),
):
    """Analyze uploaded image for manipulation"""
    
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Only image files supported")
    
    # Validate file size (100MB limit to match Next.js frontend)
    MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
    file_size = 0
    try:
        # Check size by reading in chunks
        chunk_size = 8192
        chunks = []
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            file_size += len(chunk)
            if file_size > MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail="File size must be less than 100MB")
            chunks.append(chunk)
        image_bytes = b''.join(chunks)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")
    
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Empty file provided")
    
    try:

        metadata = {}
        if source_url:
            metadata["source_url"] = source_url

        # Call Modal function
        result = analyze_image.remote(image_bytes, metadata)

        return JSONResponse(content=result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@web_app.post("/memory/lookup")
async def memory_lookup(payload: MemoryLookupRequest):
    # Validate SHA-256 format (64 hex characters)
    import re
    if not payload.sha256 or not re.match(r'^[a-f0-9]{64}$', payload.sha256.lower()):
        raise HTTPException(status_code=400, detail="Invalid SHA-256 hash format")
    
    record = verified_results.get(payload.sha256)
    if not record:
        raise HTTPException(status_code=404, detail="Verification not found")

    return {
        "status": "found",
        "sha256": payload.sha256,
        "record": record,
    }

# Mount FastAPI app to Modal
@app.function()
@modal.asgi_app()
def fastapi_app():
    return web_app


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
