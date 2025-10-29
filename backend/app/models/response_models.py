from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class DetectedObject(BaseModel):
    """Detected object from YOLO11"""
    class_name: str
    confidence: float
    bbox: List[float]  # [x1, y1, x2, y2]
    center: List[float]  # [x, y]
    
class ManipulationArea(BaseModel):
    """Area detected as manipulated"""
    region: List[float]  # [x1, y1, x2, y2]
    score: float
    type: str  # 'clone', 'splice', 'ai_generated', etc.

class SpatialAnalysis(BaseModel):
    """Spatial relationship analysis"""
    scene_description: str
    object_relations: List[str]
    anomalies: List[str]
    scene_coherence: float

class AnalysisResponse(BaseModel):
    """Complete analysis response"""
    is_manipulated: bool
    confidence: float
    manipulation_type: Optional[str] = None
    
    # AI-Generated Detection (Primary)
    is_ai_generated: bool = False
    ai_confidence: float = 0.0
    ai_detection_details: Optional[Dict[str, Any]] = None
    
    # YOLO11 Detection
    objects_detected: List[DetectedObject]
    object_count: int
    
    # Spatial Analysis
    spatial_analysis: SpatialAnalysis
    
    # Heatmap
    heatmap_url: Optional[str] = None
    heatmap_base64: str
    
    # Manipulation Details
    manipulation_areas: List[ManipulationArea]
    ela_score: float
    frequency_analysis: Dict[str, Any]
    
    # Metadata
    processing_time: float
    
    class Config:
        json_schema_extra = {
            "example": {
                "is_manipulated": True,
                "confidence": 0.92,
                "manipulation_type": "ai_generated",
                "is_ai_generated": True,
                "ai_confidence": 0.96,
                "ai_detection_details": {
                    "methods_used": ["vit_analysis", "spectral_analysis", "artifact_analysis"],
                    "method_scores": {
                        "vit_analysis": 0.95,
                        "spectral_analysis": 0.87,
                        "artifact_analysis": 0.93
                    },
                    "final_score": 0.92
                },
                "objects_detected": [
                    {
                        "class_name": "person",
                        "confidence": 0.95,
                        "bbox": [100, 100, 300, 400],
                        "center": [200, 250]
                    }
                ],
                "object_count": 1,
                "spatial_analysis": {
                    "scene_description": "A person standing in front of a building",
                    "object_relations": ["person is in front of building"],
                    "anomalies": ["Unnatural lighting on face"],
                    "scene_coherence": 0.75
                },
                "heatmap_base64": "data:image/png;base64,...",
                "manipulation_areas": [
                    {
                        "region": [150, 120, 250, 280],
                        "score": 0.85,
                        "type": "ai_generated"
                    }
                ],
                "ela_score": 0.82,
                "frequency_analysis": {"high_freq": 0.7, "low_freq": 0.3},
                "processing_time": 3.2
            }
        }

