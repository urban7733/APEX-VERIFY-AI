from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from ai_pipeline import ai_pipeline
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="APEX VERIFY AI",
    description="Simple and effective AI-powered image authenticity verification",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "APEX VERIFY AI - Image Authenticity Verification",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "verify": "/verify",
            "status": "/status"
        },
        "features": [
            "AI-powered image analysis",
            "Feature extraction and anomaly detection",
            "Gemini Pro Vision integration",
            "Authenticity scoring (0-100%)",
            "Detailed analysis reports"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": "2024-08-25T00:00:00Z",
        "services": {
            "ai_pipeline": "operational",
            "gemini_api": "configured" if os.getenv('GEMINI_API_KEY') else "not_configured"
        }
    }

@app.post("/verify")
async def verify_image(file: UploadFile = File(...)):
    """
    Verify image authenticity using AI pipeline.
    
    Args:
        file: Image file to verify
        
    Returns:
        Verification result with authenticity score and analysis
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read file content
        image_data = await file.read()
        
        if len(image_data) == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        
        # Analyze image with AI pipeline
        result = ai_pipeline.analyze_image(image_data)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@app.get("/status")
async def get_status():
    """Get system status and configuration."""
    return {
        "system": "APEX VERIFY AI",
        "version": "1.0.0",
        "status": "operational",
        "ai_pipeline": {
            "status": "ready",
            "features": [
                "Image validation",
                "Feature extraction",
                "Anomaly detection",
                "Gemini Pro Vision analysis",
                "Authenticity scoring"
            ]
        },
        "configuration": {
            "gemini_api_configured": bool(os.getenv('GEMINI_API_KEY')),
            "max_file_size": "10MB",
            "supported_formats": ["JPEG", "PNG", "GIF", "BMP", "TIFF"]
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8014)
