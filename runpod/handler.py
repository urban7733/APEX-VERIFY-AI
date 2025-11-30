"""
RunPod Serverless Handler for SPAI AI-Generated Image Detection.

This handler runs on RunPod's serverless GPU infrastructure and provides
the ML inference backend for Apex Verify AI.

Endpoint accepts:
- Base64 encoded image (image_base64)
- Image URL (image_url)  
- Legacy base64 format (image)

Returns:
{
    "status": "success",
    "is_ai": bool,
    "confidence": float (0-1),
    "score": float (0-1),
    "model": "spai",
    "model_version": "cvpr2025"
}

SPAI Paper: CVPR 2025
Repository: https://github.com/mever-team/spai
License: Apache 2.0 (commercial use allowed)
GPU Requirements: 8GB+ VRAM (RTX 3080/4080 recommended)
"""

import runpod
import base64
import requests
from io import BytesIO
from PIL import Image
import traceback
import torch

from src.spai_inference import detect_image, get_detector


def download_image(url: str) -> bytes:
    """Download image from URL with timeout."""
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.content


def decode_base64_image(base64_string: str) -> bytes:
    """Decode base64 string to bytes, handling data URL prefix."""
    # Remove data URL prefix if present (e.g., "data:image/png;base64,")
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    return base64.b64decode(base64_string)


def handler(event: dict) -> dict:
    """
    RunPod handler function.
    
    Expected input format:
    {
        "input": {
            "image_base64": "...",  # Option 1: Base64 encoded image
            "image_url": "...",     # Option 2: URL to image
            "image": "..."          # Option 3: Raw base64 (legacy)
        }
    }
    """
    try:
        input_data = event.get("input", {})
        
        # Health check endpoint
        if input_data.get("health_check"):
            return {
                "status": "success",
                "message": "spai-ready",
                "gpu_available": torch.cuda.is_available(),
                "model": "spai",
                "model_version": "cvpr2025"
            }
        
        # Clear GPU memory before inference
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            torch.cuda.synchronize()
        
        # Get image data from various input formats
        image_bytes = None
        
        if "image_base64" in input_data:
            image_bytes = decode_base64_image(input_data["image_base64"])
        elif "image_url" in input_data:
            image_bytes = download_image(input_data["image_url"])
        elif "image" in input_data:
            image_bytes = decode_base64_image(input_data["image"])
        else:
            return {
                "error": "No image provided. Use 'image_base64', 'image_url', or 'image'.",
                "status": "error"
            }
        
        # Validate image
        try:
            img = Image.open(BytesIO(image_bytes))
            img.verify()  # Verify it's a valid image
        except Exception as e:
            return {
                "error": f"Invalid image data: {str(e)}",
                "status": "error"
            }
        
        # Run detection
        try:
            result = detect_image(image_bytes)
        finally:
            # Always clean up GPU memory after inference
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        
        # Format response for Vercel backend compatibility
        return {
            "status": "success",
            "is_ai": result.get("is_ai", False),
            "is_ai_generated": result.get("is_ai", False),  # Alias for compatibility
            "confidence": result.get("confidence", 0.5),
            "score": result.get("score", 0.5),
            "model": result.get("model", "spai"),
            "model_version": result.get("model_version", "cvpr2025"),
            "fallback": result.get("fallback", False)
        }
        
    except Exception as e:
        traceback.print_exc()
        
        # Clean up GPU memory on error
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
    return {
            "error": str(e),
            "status": "error"
        }


# Warm up model on container start
print("=" * 60)
print("[Apex Verify AI] SPAI RunPod Handler Starting...")
print("=" * 60)

print("[SPAI] Checking GPU availability...")
if torch.cuda.is_available():
    print(f"[SPAI] GPU: {torch.cuda.get_device_name(0)}")
    print(f"[SPAI] VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
else:
    print("[SPAI] WARNING: No GPU available, running on CPU (slow)")

print("[SPAI] Warming up model...")
try:
    get_detector()
    print("[SPAI] Model warm-up complete!")
    print("=" * 60)
    print("[Apex Verify AI] Ready to accept requests")
    print("=" * 60)
except Exception as e:
    print(f"[SPAI] Warm-up failed: {e}")
    print("[SPAI] Will attempt to load model on first request")

# Start RunPod serverless handler
runpod.serverless.start({"handler": handler})
