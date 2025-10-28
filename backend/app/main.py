from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from pathlib import Path
import tempfile
import os
from loguru import logger

from app.services.yolo_service import YOLOService
from app.services.manipulation_detector import ManipulationDetector
from app.services.heatmap_generator import HeatmapGenerator
from app.models.response_models import AnalysisResponse

# Initialize FastAPI
app = FastAPI(
    title="Apex Verify AI - Backend",
    description="AI-powered deepfake detection with YOLO11 and manipulation analysis",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
yolo_service = YOLOService()
manipulation_detector = ManipulationDetector()
heatmap_generator = HeatmapGenerator()

@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    logger.info("🚀 Starting Apex Verify AI Backend...")
    await yolo_service.load_model()
    logger.info("✅ YOLO11 model loaded")
    logger.info("✅ Backend ready!")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Apex Verify AI",
        "version": "2.0.0",
        "status": "operational",
        "features": [
            "YOLO11 Object Detection",
            "Manipulation Detection",
            "AI Generation Heatmap",
            "Spatial Analysis"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "yolo_loaded": yolo_service.is_loaded(),
        "services": {
            "yolo": "operational",
            "manipulation_detection": "operational",
            "heatmap_generation": "operational"
        }
    }

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze image for manipulation with YOLO11 detection and heatmap generation
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Only image files are supported")
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_path = tmp_file.name
    
    try:
        logger.info(f"📸 Analyzing image: {file.filename}")
        
        # 1. YOLO11 Object Detection
        logger.info("🔍 Running YOLO11 detection...")
        yolo_results = await yolo_service.detect_objects(tmp_path)
        
        # 2. Manipulation Detection
        logger.info("🔬 Analyzing for manipulation...")
        manipulation_result = await manipulation_detector.analyze(tmp_path)
        
        # 3. Generate Heatmap
        logger.info("🗺️ Generating manipulation heatmap...")
        heatmap_data = await heatmap_generator.generate(tmp_path)
        
        # 4. Spatial Analysis
        logger.info("📊 Performing spatial analysis...")
        spatial_analysis = await yolo_service.spatial_analysis(yolo_results)
        
        # Combine results
        response = AnalysisResponse(
            is_manipulated=manipulation_result['is_manipulated'],
            confidence=manipulation_result['confidence'],
            manipulation_type=manipulation_result['type'],
            objects_detected=yolo_results['objects'],
            object_count=len(yolo_results['objects']),
            spatial_analysis=spatial_analysis,
            heatmap_url=heatmap_data['url'],
            heatmap_base64=heatmap_data['base64'],
            manipulation_areas=manipulation_result['areas'],
            ela_score=manipulation_result['ela_score'],
            frequency_analysis=manipulation_result['frequency_analysis'],
            processing_time=manipulation_result['processing_time']
        )
        
        logger.info(f"✅ Analysis complete: {'MANIPULATED' if response.is_manipulated else 'AUTHENTIC'}")
        return response
        
    except Exception as e:
        logger.error(f"❌ Error during analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
        
    finally:
        # Cleanup
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
