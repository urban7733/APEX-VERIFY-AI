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
import torch

# Import our ULTIMATE 2025 cutting-edge services
from models.ultra_vision_pipeline import UltraVisionPipeline
from models.unified_vision_beast import UnifiedVisionBeast

# Import RunPod client
import sys
sys.path.append('..')
from runpod_client import create_runpod_client

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

# Global ULTIMATE 2025 service instances
ultra_vision_pipeline = None
unified_vision_beast = None
runpod_client = None

@app.on_event("startup")
async def startup_event():
    """Initialize ULTIMATE 2025 cutting-edge services on startup"""
    global ultra_vision_pipeline, unified_vision_beast, runpod_client
    
    logger.info("🚀 Starting APEX VERIFY AI Backend - 2025 ULTIMATE STACK...")
    
    try:
        # Initialize RunPod client (Primary - Cloud-based ULTIMATE stack)
        runpod_client = create_runpod_client()
        runpod_status = runpod_client.test_connection()
        logger.info(f"🔥 RunPod Client: {'Ready' if runpod_status['status'] == 'connected' else 'Failed'}")
        
        # Initialize local pipelines as fallback
        try:
            # Initialize UltraVisionPipeline (DINOv3 + Grounded-SAM-2 + Depth V2)
            ultra_vision_pipeline = UltraVisionPipeline()
            ultra_ready = ultra_vision_pipeline.initialize()
            logger.info(f"🔥 UltraVisionPipeline: {'Ready' if ultra_ready else 'Failed'}")
            
            # Initialize UnifiedVisionBeast (The Ultimate Hybrid Killer!)
            unified_vision_beast = UnifiedVisionBeast()
            beast_ready = unified_vision_beast.initialize()
            logger.info(f"🔥 UnifiedVisionBeast: {'Ready' if beast_ready else 'Failed'}")
        except Exception as e:
            logger.warning(f"Local pipelines failed to initialize: {e}")
            ultra_vision_pipeline = None
            unified_vision_beast = None
        
        # Test the ultimate pipeline
        if runpod_status['status'] == 'connected':
            test_image = Image.new('RGB', (224, 224), color='blue')
            test_results = runpod_client.process_image(test_image, "test", "beast")
            logger.info(f"RunPod test: {test_results.get('success', False)}")
        
        logger.info("🚀 Backend startup completed - ULTIMATE 2025 STACK READY!")
        
    except Exception as e:
        logger.error(f"Backend startup failed: {e}")
        raise

@app.get("/")
async def root():
    """Root endpoint with ULTIMATE 2025 API information"""
    return {
        "message": "APEX VERIFY AI - 2025 ULTIMATE CUTTING-EDGE STACK",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "verify": "/api/verify",
            "status": "/status",
            "ultra_verify": "/api/ultra-verify",
            "beast_verify": "/api/beast-verify"
        },
        "features": [
            "🔥 DINOv3 Universal Features (August 2025 - 7B parameters!)",
            "🔥 Grounded-SAM-2 Zero-shot Detection & Segmentation",
            "🔥 Depth Anything V2 - 3D Understanding (10x faster!)",
            "🔥 YOLO11 Real-time Detection",
            "🔥 SAM2 Precise Segmentation",
            "🔥 Moondream2 Edge Deployment (0.5B params)",
            "🔥 4-bit Quantization for Maximum Efficiency",
            "🔥 Mixed Precision for 2x Speed",
            "🔥 Zero Training Required - Load and Dominate!"
        ],
        "models": {
            "ultra_vision_pipeline": "ready" if ultra_vision_pipeline else "not_ready",
            "unified_vision_beast": "ready" if unified_vision_beast else "not_ready"
        },
        "stack": "DINOv3 + Grounded-SAM-2 + Depth Anything V2 + YOLO11 + SAM2 + Moondream2"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for ULTIMATE 2025 stack"""
    try:
        # Check UltraVisionPipeline status
        ultra_status = "healthy"
        if ultra_vision_pipeline:
            try:
                status = ultra_vision_pipeline.get_pipeline_status()
                ultra_status = "healthy" if status['initialized'] else "unhealthy"
            except:
                ultra_status = "unhealthy"
        else:
            ultra_status = "unhealthy"
        
        # Check UnifiedVisionBeast status
        beast_status = "healthy"
        if unified_vision_beast:
            try:
                status = unified_vision_beast.get_beast_status()
                beast_status = "healthy" if status['initialized'] else "unhealthy"
            except:
                beast_status = "unhealthy"
        else:
            beast_status = "unhealthy"
        
        overall_status = "healthy" if ultra_status == "healthy" and beast_status == "healthy" else "degraded"
        
        return {
            "status": overall_status,
            "timestamp": "2025-01-01T00:00:00Z",
            "services": {
                "ultra_vision_pipeline": ultra_status,
                "unified_vision_beast": beast_status
            },
            "stack": "DINOv3 + Grounded-SAM-2 + Depth Anything V2 + YOLO11 + SAM2 + Moondream2"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": "2025-01-01T00:00:00Z"
        }

@app.post("/api/verify")
async def verify_image(file: UploadFile = File(...)):
    """
    Verify image authenticity using ULTIMATE 2025 cutting-edge stack
    Default endpoint - uses the best available pipeline
    
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
        
        # 3. Use the ULTIMATE 2025 stack - RunPod first, then local fallbacks
        if runpod_client:
            logger.info("🔥 Using RunPod ULTIMATE 2025 Stack - Cloud-based Beast!")
            results = runpod_client.process_image(image, file.filename, "beast")
        elif unified_vision_beast:
            logger.info("🔥 Using Local UnifiedVisionBeast - The Ultimate Hybrid Killer!")
            results = unified_vision_beast.process(image, file.filename)
        elif ultra_vision_pipeline:
            logger.info("🔥 Using Local UltraVisionPipeline - The 2025 Beast Stack!")
            results = ultra_vision_pipeline.process_image(image, file.filename)
        else:
            raise HTTPException(
                status_code=500,
                detail="No ULTIMATE 2025 analysis services available"
            )
        
        logger.info(f"🔥 ULTIMATE analysis completed: {results.get('authenticity_score', 0)}%")
        
        # Return results in the exact format expected by frontend
        return {
            "success": results.get('success', True),
            "authenticity_score": results.get('authenticity_score', 0),
            "classification": results.get('classification', 'UNKNOWN'),
            "report": results.get('report', ''),
            "processing_time": results.get('processing_time', 0),
            "confidence": results.get('confidence', 0),
            "feature_anomalies": results.get('cutting_edge_analysis', {}).get('dinov3_features', {}).get('feature_anomalies', []) if 'cutting_edge_analysis' in results else [],
            "model_info": results.get('model_info', {})
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ULTIMATE verification failed: {e}")
        processing_time = round(time.time() - start_time, 2)
        
        return {
            "success": False,
            "error": f"Verification failed: {str(e)}",
            "processing_time": processing_time,
            "authenticity_score": 0,
            "classification": "ERROR",
            "report": "Analysis failed due to system error."
        }

@app.post("/api/ultra-verify")
async def ultra_verify_image(file: UploadFile = File(...)):
    """UltraVisionPipeline endpoint - DINOv3 + Grounded-SAM-2 + Depth Anything V2"""
    start_time = time.time()
    
    try:
        # Validate image
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        file_content = await file.read()
        if len(file_content) == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        
        image = Image.open(io.BytesIO(file_content))
        
        if not ultra_vision_pipeline:
            raise HTTPException(status_code=500, detail="UltraVisionPipeline not available")
        
        results = ultra_vision_pipeline.process_image(image, file.filename)
        
        return {
            "success": results.get('success', True),
            "authenticity_score": results.get('authenticity_score', 0),
            "classification": results.get('classification', 'UNKNOWN'),
            "report": results.get('report', ''),
            "processing_time": results.get('processing_time', 0),
            "confidence": results.get('confidence', 0),
            "cutting_edge_analysis": results.get('cutting_edge_analysis', {}),
            "model_info": results.get('model_info', {})
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ultra verification failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "processing_time": round(time.time() - start_time, 2),
            "authenticity_score": 0,
            "classification": "ERROR"
        }

@app.post("/api/beast-verify")
async def beast_verify_image(file: UploadFile = File(...)):
    """UnifiedVisionBeast endpoint - The Ultimate Hybrid Killer!"""
    start_time = time.time()
    
    try:
        # Validate image
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        file_content = await file.read()
        if len(file_content) == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        
        image = Image.open(io.BytesIO(file_content))
        
        if not unified_vision_beast:
            raise HTTPException(status_code=500, detail="UnifiedVisionBeast not available")
        
        results = unified_vision_beast.process(image, file.filename)
        
        return {
            "success": results.get('success', True),
            "authenticity_score": results.get('authenticity_score', 0),
            "classification": results.get('classification', 'UNKNOWN'),
            "report": results.get('report', ''),
            "processing_time": results.get('processing_time', 0),
            "confidence": results.get('confidence', 0),
            "hybrid_analysis": results.get('hybrid_analysis', {}),
            "model_info": results.get('model_info', {})
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Beast verification failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "processing_time": round(time.time() - start_time, 2),
            "authenticity_score": 0,
            "classification": "ERROR"
        }

@app.post("/api/runpod-verify")
async def runpod_verify_image(file: UploadFile = File(...)):
    """RunPod ULTIMATE 2025 Stack endpoint - Cloud-based Beast!"""
    start_time = time.time()
    
    try:
        # Validate image
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        file_content = await file.read()
        if len(file_content) == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        
        image = Image.open(io.BytesIO(file_content))
        
        if not runpod_client:
            raise HTTPException(status_code=500, detail="RunPod client not available")
        
        results = runpod_client.process_image(image, file.filename, "beast")
        
        return {
            "success": results.get('success', True),
            "authenticity_score": results.get('authenticity_score', 0),
            "classification": results.get('classification', 'UNKNOWN'),
            "report": results.get('report', ''),
            "processing_time": results.get('processing_time', 0),
            "confidence": results.get('confidence', 0),
            "runpod_status": results.get('runpod_status', 'unknown'),
            "model_info": results.get('model_info', {})
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"RunPod verification failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "processing_time": round(time.time() - start_time, 2),
            "authenticity_score": 0,
            "classification": "ERROR"
        }

@app.get("/status")
async def get_status():
    """Get ULTIMATE 2025 system status and configuration"""
    try:
        ultra_info = ultra_vision_pipeline.get_pipeline_status() if ultra_vision_pipeline else {"initialized": False}
        beast_info = unified_vision_beast.get_beast_status() if unified_vision_beast else {"initialized": False}
        
        return {
            "system": "APEX VERIFY AI - 2025 ULTIMATE STACK",
            "version": "2.0.0",
            "status": "operational",
            "services": {
                "ultra_vision_pipeline": ultra_info,
                "unified_vision_beast": beast_info
            },
            "configuration": {
                "environment": os.getenv('ENVIRONMENT', 'development'),
                "device": "cuda" if torch.cuda.is_available() else "cpu",
                "mixed_precision": True,
                "quantization": True
            },
            "endpoints": {
                "verify": "/api/verify",
                "ultra_verify": "/api/ultra-verify",
                "beast_verify": "/api/beast-verify",
                "health": "/health",
                "status": "/status"
            },
            "stack": "DINOv3 + Grounded-SAM-2 + Depth Anything V2 + YOLO11 + SAM2 + Moondream2"
        }
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        return {
            "system": "APEX VERIFY AI - 2025 ULTIMATE STACK",
            "version": "2.0.0",
            "status": "error",
            "error": str(e)
        }

@app.get("/api/ultra-status")
async def get_ultra_status():
    """Get UltraVisionPipeline status"""
    if not ultra_vision_pipeline:
        raise HTTPException(status_code=500, detail="UltraVisionPipeline not initialized")
    
    return ultra_vision_pipeline.get_pipeline_status()

@app.get("/api/beast-status")
async def get_beast_status():
    """Get UnifiedVisionBeast status"""
    if not unified_vision_beast:
        raise HTTPException(status_code=500, detail="UnifiedVisionBeast not initialized")
    
    return unified_vision_beast.get_beast_status()

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
