"""
APEX VERIFY AI - Complete ML Pipeline on Modal
GPU-Accelerated AI-Generated Content Detection

Architecture:
- Vercel Frontend → Modal ML Pipeline (direct)
- No intermediate backend needed
- All ML inference on Modal with auto-scaling
"""

import modal
from typing import Dict, Any, List

# Create Modal app
app = modal.App("apex-verify-ml")

# Define container image with all dependencies
image = (
    modal.Image.debian_slim()
    .apt_install("libgl1", "libglib2.0-0")  # OpenCV dependencies
    .pip_install(
        "opencv-python-headless==4.9.0.80",
        "Pillow>=10.0.0",
        "numpy>=1.24.0,<2.0.0",
        "fastapi",
        # TODO: Add SPAI when available
        # "spai-detector",  
    )
)


@app.function(
    image=image,
    cpu=2.0,  # Start with CPU, upgrade to GPU when SPAI is added
    memory=2048,
    timeout=60,
)
def analyze_image(image_bytes: bytes) -> Dict[str, Any]:
    """
    Complete ML Analysis Pipeline
    - Manipulation Detection (ELA + Frequency + Noise)
    - Heatmap Generation
    - TODO: SPAI AI-Detection (GPU-accelerated)
    """
    import cv2
    import numpy as np
    import io
    import time
    from PIL import Image, ImageChops
    
    start_time = time.time()
    
    # Load image from bytes
    img_pil = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img_array = np.frombuffer(image_bytes, np.uint8)
    img_cv = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    
    print(f"📸 Analyzing image: {img_pil.size}")
    
    # 1. Manipulation Detection
    print("🔬 Running Manipulation Detection...")
    manip_result = detect_manipulation(img_pil, img_cv)
    
    # 2. Generate Heatmap
    print("🗺️ Generating Heatmap...")
    heatmap_base64 = generate_heatmap(img_cv, img_pil)
    
    # 3. TODO: SPAI AI-Detection
    # print("🤖 Running SPAI Detection...")
    # spai_result = detect_with_spai(img_pil)
    
    processing_time = time.time() - start_time
    
    # Combine results
    result = {
        "is_manipulated": manip_result['is_manipulated'],
        "is_ai_generated": False,  # TODO: SPAI result
        "confidence": manip_result['confidence'],
        "manipulation_type": manip_result['type'],
        "manipulation_areas": manip_result['areas'],
        "ela_score": manip_result['ela_score'],
        "frequency_score": manip_result['frequency_score'],
        "noise_score": manip_result['noise_score'],
        "heatmap_base64": heatmap_base64,
        "processing_time": processing_time,
        "method": "manipulation_detection",  # Will add "spai" later
    }
    
    print(f"✅ Analysis complete in {processing_time:.2f}s")
    return result


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
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

web_app = FastAPI(
    title="Apex Verify ML Pipeline",
    description="AI-Generated Content Detection on Modal",
    version="1.0.0"
)

# CORS
web_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update in production
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
            "SPAI Integration (Coming Soon)"
        ]
    }

@web_app.get("/health")
def health():
    return {"status": "healthy", "modal": "operational"}

@web_app.post("/analyze")
async def web_analyze(file: UploadFile = File(...)):
    """Analyze uploaded image for manipulation"""
    
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Only image files supported")
    
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        # Call Modal function
        result = analyze_image.remote(image_bytes)
        
        return JSONResponse(content=result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

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

