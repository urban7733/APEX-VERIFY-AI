from ultralytics import YOLO
import cv2
import numpy as np
from typing import Dict, List, Any
from loguru import logger
from app.models.response_models import DetectedObject, SpatialAnalysis

class YOLOService:
    """YOLO11 Object Detection Service"""
    
    def __init__(self):
        self.model = None
        self.model_loaded = False
        
    async def load_model(self):
        """Load YOLO11 model"""
        try:
            # Load YOLO11n (nano) for faster inference
            # Options: yolo11n, yolo11s, yolo11m, yolo11l, yolo11x
            self.model = YOLO('yolo11n.pt')
            self.model_loaded = True
            logger.info("✅ YOLO11 model loaded successfully")
        except Exception as e:
            logger.error(f"❌ Failed to load YOLO11: {str(e)}")
            raise
    
    def is_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.model_loaded
    
    async def detect_objects(self, image_path: str) -> Dict[str, Any]:
        """
        Detect objects in image using YOLO11
        
        Args:
            image_path: Path to image file
            
        Returns:
            Dictionary with detection results
        """
        if not self.model_loaded:
            await self.load_model()
        
        try:
            # Run inference
            results = self.model(image_path, conf=0.25, iou=0.45)
            
            # Parse results
            detections = []
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    # Get box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    conf = float(box.conf[0].cpu().numpy())
                    cls = int(box.cls[0].cpu().numpy())
                    class_name = result.names[cls]
                    
                    # Calculate center
                    center_x = (x1 + x2) / 2
                    center_y = (y1 + y2) / 2
                    
                    detection = DetectedObject(
                        class_name=class_name,
                        confidence=conf,
                        bbox=[float(x1), float(y1), float(x2), float(y2)],
                        center=[float(center_x), float(center_y)]
                    )
                    detections.append(detection)
            
            logger.info(f"🔍 Detected {len(detections)} objects")
            
            return {
                'objects': detections,
                'count': len(detections),
                'image_shape': results[0].orig_shape
            }
            
        except Exception as e:
            logger.error(f"❌ YOLO detection failed: {str(e)}")
            raise
    
    async def spatial_analysis(self, yolo_results: Dict[str, Any]) -> SpatialAnalysis:
        """
        Perform spatial analysis on detected objects
        
        Args:
            yolo_results: Results from YOLO detection
            
        Returns:
            SpatialAnalysis object
        """
        objects = yolo_results['objects']
        
        # Generate scene description
        if len(objects) == 0:
            scene_desc = "No objects detected in the image"
        else:
            obj_names = [obj.class_name for obj in objects]
            unique_objects = list(set(obj_names))
            scene_desc = f"Scene contains: {', '.join(unique_objects)}"
        
        # Analyze object relationships
        relations = []
        for i, obj1 in enumerate(objects):
            for obj2 in objects[i+1:]:
                # Check if objects are close
                dist = np.sqrt(
                    (obj1.center[0] - obj2.center[0])**2 + 
                    (obj1.center[1] - obj2.center[1])**2
                )
                if dist < 200:  # Close proximity threshold
                    relations.append(f"{obj1.class_name} near {obj2.class_name}")
        
        # Detect anomalies
        anomalies = []
        
        # Check for unusual object sizes
        for obj in objects:
            bbox_area = (obj.bbox[2] - obj.bbox[0]) * (obj.bbox[3] - obj.bbox[1])
            if bbox_area < 100:  # Very small object
                anomalies.append(f"Unusually small {obj.class_name}")
        
        # Check for objects outside expected areas
        # (This would be more sophisticated in production)
        
        # Calculate scene coherence (0-1)
        coherence = 1.0
        if len(anomalies) > 0:
            coherence -= len(anomalies) * 0.1
        coherence = max(0.0, min(1.0, coherence))
        
        return SpatialAnalysis(
            scene_description=scene_desc,
            object_relations=relations if relations else ["No significant object relations detected"],
            anomalies=anomalies if anomalies else ["No anomalies detected"],
            scene_coherence=coherence
        )

