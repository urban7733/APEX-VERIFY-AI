from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import time
import logging
from dotenv import load_dotenv
from PIL import Image
import io

# Import our services
from models.dinov3_model import DINOv3Analyzer
from services.gemini_service import GeminiReportService

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="APEX VERIFY AI",
    description="Advanced AI-powered image authenticity verification with DINOv3 and Gemini Pro Vision",
    version="1.0.0"
)

# CORS middleware - configure for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Development
        "http://localhost:3001",  # Alternative dev port
        "https://apexveriyai.vercel.app",  # Production frontend
        "*"  # Remove this in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global service instances
dinov3_analyzer = None
gemini_service = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global dinov3_analyzer, gemini_service
    
    logger.info("Starting APEX VERIFY AI Backend...")
    
    try:
        # Initialize DINOv3 analyzer
        model_path = os.getenv('DINOV3_MODEL_PATH', './models/dinov3_vit7b16b.pth')
        logger.info(f"Loading DINOv3 model from: {model_path}")
        
        dinov3_analyzer = DINOv3Analyzer(model_path)
        logger.info("DINOv3 analyzer initialized successfully")
        
        # Initialize Gemini service
        gemini_service = GeminiReportService()
        logger.info("Gemini service initialized successfully")
        
        # Test Gemini connection
        gemini_status = gemini_service.test_connection()
        logger.info(f"Gemini API status: {gemini_status['status']}")
        
        logger.info("Backend startup completed successfully")
        
    except Exception as e:
        logger.error(f"Backend startup failed: {e}")
        raise

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "APEX VERIFY AI - Advanced Image Authenticity Verification",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "verify": "/api/verify",
            "status": "/status"
        },
        "features": [
            "DINOv3 deep learning analysis",
            "Gemini Pro Vision content analysis",
            "Authenticity scoring (0-100%)",
            "AI generation detection",
            "Professional analysis reports"
        ],
        "models": {
            "dinov3": "loaded" if dinov3_analyzer else "not_loaded",
            "gemini": "connected" if gemini_service else "not_connected"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check DINOv3 status
        dinov3_status = "healthy" if dinov3_analyzer else "unhealthy"
        
        # Check Gemini status
        gemini_status = "healthy"
        if gemini_service:
            try:
                status = gemini_service.test_connection()
                gemini_status = status['status']
            except:
                gemini_status = "unhealthy"
        
        return {
            "status": "healthy" if dinov3_status == "healthy" and gemini_status == "connected" else "degraded",
            "timestamp": "2024-01-01T00:00:00Z",
            "services": {
                "dinov3_analyzer": dinov3_status,
                "gemini_api": gemini_status
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }

@app.post("/api/verify")
async def verify_image(file: UploadFile = File(...)):
    """
    Verify image authenticity using DINOv3 and Gemini Pro Vision
    
    Args:
        file: Image file to verify (jpg, png, webp)
        
    Returns:
        Verification result with exact format for frontend
    """
    start_time = time.time()
    
    try:
        # 1. Validate image upload
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400, 
                detail="File must be an image (jpg, png, webp)"
            )
        
        # Check file size (limit to 10MB)
        file_size_limit = 10 * 1024 * 1024  # 10MB
        file_content = await file.read()
        
        if len(file_content) > file_size_limit:
            raise HTTPException(
                status_code=400,
                detail="File size too large. Maximum size is 10MB."
            )
        
        if len(file_content) == 0:
            raise HTTPException(
                status_code=400,
                detail="Empty file"
            )
        
        # 2. Validate image format
        try:
            image = Image.open(io.BytesIO(file_content))
            if image.format not in ['JPEG', 'PNG', 'WEBP']:
                raise HTTPException(
                    status_code=400,
                    detail="Unsupported image format. Use JPG, PNG, or WEBP."
                )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image file: {str(e)}"
            )
        
        # 3. Run DINOv3 analysis
        if not dinov3_analyzer:
            raise HTTPException(
                status_code=500,
                detail="DINOv3 analyzer not initialized"
            )
        
        try:
            dinov3_analysis = dinov3_analyzer.analyze_image(image)
            logger.info(f"DINOv3 analysis completed: {dinov3_analysis['authenticity_score']}%")
        except Exception as e:
            logger.error(f"DINOv3 analysis failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"DINOv3 analysis failed: {str(e)}"
            )
        
        # 4. Generate Gemini Pro report
        if not gemini_service:
            raise HTTPException(
                status_code=500,
                detail="Gemini service not initialized"
            )
        
        try:
            report = gemini_service.generate_report(file_content, dinov3_analysis)
            logger.info("Gemini report generated successfully")
        except Exception as e:
            logger.error(f"Gemini report generation failed: {e}")
            # Use fallback report
            report = gemini_service._create_fallback_report(dinov3_analysis)
        
        # 5. Calculate processing time
        processing_time = round(time.time() - start_time, 2)
        
        # 6. Return structured JSON for frontend (exact format specified)
        return {
            "success": True,
            "authenticity_score": dinov3_analysis['authenticity_score'],
            "classification": dinov3_analysis['classification'],
            "report": report,  # Full Gemini-generated text
            "processing_time": processing_time,
            "confidence": dinov3_analysis.get('confidence', 0),
            "feature_anomalies": dinov3_analysis.get('feature_anomalies', []),
            "model_info": {
                "dinov3": dinov3_analyzer.get_model_info(),
                "gemini": "gemini-pro-vision"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verification failed: {e}")
        processing_time = round(time.time() - start_time, 2)
        
        return {
            "success": False,
            "error": f"Verification failed: {str(e)}",
            "processing_time": processing_time,
            "authenticity_score": 0,
            "classification": "ERROR",
            "report": "Analysis failed due to system error."
        }

@app.get("/status")
async def get_status():
    """Get system status and configuration"""
    try:
        dinov3_info = dinov3_analyzer.get_model_info() if dinov3_analyzer else {"status": "not_loaded"}
        gemini_info = gemini_service.test_connection() if gemini_service else {"status": "not_connected"}
        
        return {
            "system": "APEX VERIFY AI",
            "version": "1.0.0",
            "status": "operational",
            "services": {
                "dinov3_analyzer": dinov3_info,
                "gemini_service": gemini_info
            },
            "configuration": {
                "model_path": os.getenv('DINOV3_MODEL_PATH', 'not_set'),
                "gemini_api_key": "configured" if os.getenv('GEMINI_API_KEY') else "not_configured",
                "environment": os.getenv('ENVIRONMENT', 'development')
            },
            "endpoints": {
                "verify": "/api/verify",
                "health": "/health",
                "status": "/status"
            }
        }
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        return {
            "system": "APEX VERIFY AI",
            "version": "1.0.0",
            "status": "error",
            "error": str(e)
        }

@app.get("/models/dinov3/info")
async def get_dinov3_info():
    """Get DINOv3 model information"""
    if not dinov3_analyzer:
        raise HTTPException(status_code=500, detail="DINOv3 analyzer not initialized")
    
    return dinov3_analyzer.get_model_info()

@app.get("/services/gemini/test")
async def test_gemini():
    """Test Gemini API connection"""
    if not gemini_service:
        raise HTTPException(status_code=500, detail="Gemini service not initialized")
    
    return gemini_service.test_connection()

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
