from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import tempfile
import shutil
from typing import Optional
import logging
from services.verification_orchestrator import verification_orchestrator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="APEX VERIFY AI Backend",
    description="AI-powered image authenticity verification with digital sealing",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info("Starting APEX VERIFY AI Backend...")
    await verification_orchestrator.initialize()
    logger.info("Backend startup completed")

@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "service": "APEX VERIFY AI Backend",
        "version": "1.0.0",
        "description": "AI-powered image authenticity verification with digital sealing",
        "features": [
            "DINOv3 feature extraction and anomaly detection",
            "Gemini Pro Vision content analysis",
            "Digital seal embedding for verified images",
            "Cryptographic proof of verification",
            "Tamper-evident metadata protection"
        ],
        "endpoints": {
            "health": "/health",
            "verify": "/api/verify",
            "download_sealed": "/api/download-sealed",
            "status": "/api/status"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        health_status = await verification_orchestrator.health_check()
        return health_status
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }

@app.post("/api/verify")
async def verify_image(file: UploadFile = File(...)):
    """
    Verify image authenticity and apply digital seal if verified.
    
    Args:
        file: Image file to verify
        
    Returns:
        Verification result with optional digital seal
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name
        
        try:
            # Verify image
            result = await verification_orchestrator.verify_image(temp_file_path)
            
            if "error" in result:
                raise HTTPException(status_code=400, detail=result["error"])
            
            return result
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                logger.warning(f"Failed to clean up temporary file: {e}")
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verification failed: {e}")
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@app.post("/api/download-sealed")
async def download_sealed_image(sealed_image_path: str = Form(...), filename: Optional[str] = Form(None)):
    """
    Download a sealed image with embedded digital seal.
    
    Args:
        sealed_image_path: Path to the sealed image
        filename: Optional filename for download
        
    Returns:
        Sealed image file
    """
    try:
        # Validate path (security check)
        if not os.path.exists(sealed_image_path) or not sealed_image_path.endswith(('_sealed.png', '_sealed.jpg')):
            raise HTTPException(status_code=400, detail="Invalid sealed image path")
        
        # Set filename
        if not filename:
            filename = os.path.basename(sealed_image_path)
        
        # Return file
        return FileResponse(
            sealed_image_path,
            media_type='image/png',
            filename=filename,
            headers={'Cache-Control': 'no-cache'}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Download failed: {e}")
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

@app.get("/api/status")
async def get_status():
    """Get detailed service status."""
    try:
        return verification_orchestrator.get_service_status()
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
