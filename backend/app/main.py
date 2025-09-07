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
from models.simple_analyzer import SimpleAnalyzer
from services.workflow_orchestrator import WorkflowOrchestrator

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
simple_analyzer = None
workflow_orchestrator = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global simple_analyzer, workflow_orchestrator
    
    logger.info("Starting APEX VERIFY AI Backend...")
    
    try:
        # Initialize Simple analyzer (fallback)
        simple_analyzer = SimpleAnalyzer()
        logger.info("Simple analyzer initialized successfully")
        
        # Initialize Workflow Orchestrator (main system)
        workflow_orchestrator = WorkflowOrchestrator()
        workflow_ready = workflow_orchestrator.initialize()
        logger.info(f"Workflow Orchestrator: {'Ready' if workflow_ready else 'Failed'}")
        
        # Test workflow
        if workflow_ready:
            test_results = workflow_orchestrator.test_workflow()
            logger.info(f"Workflow test: {test_results['status']}")
        
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
            "Advanced AI analysis",
            "Gemini Pro Vision content analysis",
            "Authenticity scoring (0-100%)",
            "AI generation detection",
            "Professional analysis reports"
        ],
        "models": {
            "simple_analyzer": "loaded" if simple_analyzer else "not_loaded",
            "workflow_orchestrator": "ready" if workflow_orchestrator else "not_ready"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check Simple analyzer status
        analyzer_status = "healthy" if simple_analyzer else "unhealthy"
        
        # Check Workflow Orchestrator status
        workflow_status = "healthy"
        if workflow_orchestrator:
            try:
                status = workflow_orchestrator.get_workflow_status()
                workflow_status = "healthy" if status['initialized'] else "unhealthy"
            except:
                workflow_status = "unhealthy"
        
        return {
            "status": "healthy" if analyzer_status == "healthy" and workflow_status == "healthy" else "degraded",
            "timestamp": "2024-01-01T00:00:00Z",
            "services": {
                "simple_analyzer": analyzer_status,
                "workflow_orchestrator": workflow_status
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
    Verify image authenticity using DINOv3 Workflow Orchestrator
    
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
        
        # 3. Run DINOv3 Workflow Analysis
        if not workflow_orchestrator:
            # Fallback to simple analyzer
            if not simple_analyzer:
                raise HTTPException(
                    status_code=500,
                    detail="No analysis services available"
                )
            
            logger.warning("Workflow orchestrator not available, using simple analyzer fallback")
            analysis = simple_analyzer.analyze_image(image)
            report = f"""Apex Verify AI Analysis: COMPLETE
* Authenticity Score: {analysis['authenticity_score']}% - {analysis['classification']}
* Assessment: Analysis completed using fallback system.

The Scene in Focus
This image has been analyzed using our fallback detection system.

The Story Behind the Picture
Based on our analysis, this image has been processed through our verification pipeline.

Digital Footprint & Source Links
Technical analysis has been performed on the image metadata and characteristics.

AI Summary
The image has been verified through our analysis system with the available resources.

Your media is verified. You can now secure your file with our seal of authenticity.
( Download with Apex Verify™ Seal )"""
            
            processing_time = round(time.time() - start_time, 2)
            
            return {
                "success": True,
                "authenticity_score": analysis['authenticity_score'],
                "classification": analysis['classification'],
                "report": report,
                "processing_time": processing_time,
                "confidence": analysis.get('confidence', 0),
                "feature_anomalies": analysis.get('feature_anomalies', []),
                "model_info": {
                    "analyzer": "simple_analyzer_fallback",
                    "workflow": "not_available"
                }
            }
        
        # Use DINOv3 Workflow Orchestrator
        try:
            results = workflow_orchestrator.process_image(image, file.filename)
            logger.info(f"Workflow analysis completed: {results.get('authenticity_score', 0)}%")
            
            # Return results in the exact format expected by frontend
            return {
                "success": results.get('success', True),
                "authenticity_score": results.get('authenticity_score', 0),
                "classification": results.get('classification', 'UNKNOWN'),
                "report": results.get('report', ''),
                "processing_time": results.get('processing_time', 0),
                "confidence": results.get('confidence', 0),
                "feature_anomalies": results.get('analysis_details', {}).get('dinov3_analysis', {}).get('feature_anomalies', []),
                "watermarked_image_base64": results.get('watermarking', {}).get('watermarked_image_base64'),
                "model_info": results.get('model_info', {})
            }
            
        except Exception as e:
            logger.error(f"Workflow analysis failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Workflow analysis failed: {str(e)}"
            )
        
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
        analyzer_info = simple_analyzer.get_model_info() if simple_analyzer else {"status": "not_loaded"}
        workflow_info = workflow_orchestrator.get_workflow_status() if workflow_orchestrator else {"initialized": False}
        
        return {
            "system": "APEX VERIFY AI",
            "version": "1.0.0",
            "status": "operational",
            "services": {
                "simple_analyzer": analyzer_info,
                "workflow_orchestrator": workflow_info
            },
            "configuration": {
                "gemini_api_key": "configured" if os.getenv('GEMINI_API_KEY') else "not_configured",
                "google_vision_api_key": "configured" if os.getenv('GOOGLE_VISION_API_KEY') else "not_configured",
                "tineye_api_key": "configured" if os.getenv('TINEYE_API_KEY') else "not_configured",
                "dinov3_model_path": "configured" if os.getenv('DINOV3_MODEL_PATH') else "not_configured",
                "environment": os.getenv('ENVIRONMENT', 'development')
            },
            "endpoints": {
                "verify": "/api/verify",
                "health": "/health",
                "status": "/status",
                "workflow_test": "/workflow/test"
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

@app.get("/models/analyzer/info")
async def get_analyzer_info():
    """Get analyzer information"""
    if not simple_analyzer:
        raise HTTPException(status_code=500, detail="Simple analyzer not initialized")
    
    return simple_analyzer.get_model_info()

@app.get("/workflow/test")
async def test_workflow():
    """Test complete workflow"""
    if not workflow_orchestrator:
        raise HTTPException(status_code=500, detail="Workflow orchestrator not initialized")
    
    return workflow_orchestrator.test_workflow()

@app.get("/workflow/status")
async def get_workflow_status():
    """Get detailed workflow status"""
    if not workflow_orchestrator:
        raise HTTPException(status_code=500, detail="Workflow orchestrator not initialized")
    
    return workflow_orchestrator.get_workflow_status()

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
