from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
from deepfake_detector import analyze_image
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Apex Verify AI Backend", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Apex Verify AI Backend - Deepfake Detection Service"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "deepfake-detection"}

@app.post("/analyze")
async def analyze_media(file: UploadFile = File(...)):
    """
    Analyze uploaded media for deepfake detection
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Only image files are supported")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Analyze the image
            logger.info(f"Analyzing image: {file.filename}")
            result = analyze_image(temp_file_path)
            
            # Format response to match frontend expectations
            response = {
                "authenticity_score": result["confidence"],
                "is_deepfake": not result["is_authentic"],
                "classification": result["classification"],
                "probabilities": result["probabilities"],
                "analysis": {
                    "model_used": "prithivMLmods/deepfake-detector-model-v1",
                    "confidence": result["confidence"],
                    "verdict": "AUTHENTIC" if result["is_authentic"] else "DEEPFAKE_DETECTED"
                },
                "technical_details": {
                    "real_probability": result["probabilities"]["real"],
                    "fake_probability": result["probabilities"]["fake"],
                    "model_architecture": "SiglipForImageClassification"
                }
            }
            
            logger.info(f"Analysis complete: {result['classification']} ({result['confidence']:.2%})")
            return response
            
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
            
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
