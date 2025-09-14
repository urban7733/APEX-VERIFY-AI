"""
RunPod Serverless Handler for APEX VERIFY AI - 2025 ULTIMATE STACK
This is the handler that runs on your RunPod endpoint
"""

import base64
import json
import io
import time
import logging
from PIL import Image
from typing import Dict, Any

# Import our ULTIMATE 2025 cutting-edge services
from models.ultra_vision_pipeline import UltraVisionPipeline
from models.unified_vision_beast import UnifiedVisionBeast

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global instances
ultra_vision_pipeline = None
unified_vision_beast = None

def initialize_models():
    """Initialize the ULTIMATE 2025 models on RunPod startup"""
    global ultra_vision_pipeline, unified_vision_beast
    
    try:
        logger.info("🚀 Initializing ULTIMATE 2025 Stack on RunPod...")
        
        # Initialize UltraVisionPipeline
        ultra_vision_pipeline = UltraVisionPipeline()
        ultra_ready = ultra_vision_pipeline.initialize()
        logger.info(f"🔥 UltraVisionPipeline: {'Ready' if ultra_ready else 'Failed'}")
        
        # Initialize UnifiedVisionBeast
        unified_vision_beast = UnifiedVisionBeast()
        beast_ready = unified_vision_beast.initialize()
        logger.info(f"🔥 UnifiedVisionBeast: {'Ready' if beast_ready else 'Failed'}")
        
        logger.info("🚀 ULTIMATE 2025 Stack initialized on RunPod!")
        return True
        
    except Exception as e:
        logger.error(f"Model initialization failed: {e}")
        return False

def handler(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    RunPod serverless handler for APEX VERIFY AI
    
    Args:
        event: RunPod event containing input data
        
    Returns:
        Analysis results
    """
    try:
        # Get input data
        input_data = event.get("input", {})
        action = input_data.get("action", "verify_image")
        
        if action == "health_check":
            return {
                "status": "healthy",
                "message": "APEX VERIFY AI - 2025 ULTIMATE STACK Ready!",
                "models": {
                    "ultra_vision_pipeline": ultra_vision_pipeline is not None,
                    "unified_vision_beast": unified_vision_beast is not None
                }
            }
        
        elif action == "verify_image":
            # Process image verification
            image_base64 = input_data.get("image_base64")
            filename = input_data.get("filename", "image.jpg")
            pipeline = input_data.get("pipeline", "beast")
            
            if not image_base64:
                return {
                    "success": False,
                    "error": "No image provided",
                    "authenticity_score": 0,
                    "classification": "ERROR"
                }
            
            # Decode image
            try:
                image_data = base64.b64decode(image_base64)
                image = Image.open(io.BytesIO(image_data))
            except Exception as e:
                return {
                    "success": False,
                    "error": f"Invalid image data: {str(e)}",
                    "authenticity_score": 0,
                    "classification": "ERROR"
                }
            
            # Process with ULTIMATE 2025 stack
            start_time = time.time()
            
            if pipeline == "beast" and unified_vision_beast:
                logger.info("🔥 Using UnifiedVisionBeast - The Ultimate Hybrid Killer!")
                results = unified_vision_beast.process(image, filename)
            elif pipeline == "ultra" and ultra_vision_pipeline:
                logger.info("🔥 Using UltraVisionPipeline - The 2025 Beast Stack!")
                results = ultra_vision_pipeline.process_image(image, filename)
            else:
                return {
                    "success": False,
                    "error": f"Pipeline '{pipeline}' not available",
                    "authenticity_score": 0,
                    "classification": "ERROR"
                }
            
            processing_time = round(time.time() - start_time, 2)
            results["processing_time"] = processing_time
            
            logger.info(f"🔥 ULTIMATE analysis completed: {results.get('authenticity_score', 0)}%")
            return results
        
        else:
            return {
                "success": False,
                "error": f"Unknown action: {action}",
                "authenticity_score": 0,
                "classification": "ERROR"
            }
    
    except Exception as e:
        logger.error(f"Handler error: {e}")
        return {
            "success": False,
            "error": str(e),
            "authenticity_score": 0,
            "classification": "ERROR"
        }

# Initialize models when the handler loads
if __name__ == "__main__":
    # Test the handler
    print("🚀 Testing RunPod Handler...")
    
    # Initialize models
    init_success = initialize_models()
    print(f"Model initialization: {'Success' if init_success else 'Failed'}")
    
    # Test health check
    health_event = {"input": {"action": "health_check"}}
    health_result = handler(health_event)
    print(f"Health check: {health_result}")
    
    # Test with sample image
    test_image = Image.new('RGB', (224, 224), color='blue')
    img_byte_arr = io.BytesIO()
    test_image.save(img_byte_arr, format='JPEG')
    img_base64 = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')
    
    test_event = {
        "input": {
            "action": "verify_image",
            "image_base64": img_base64,
            "filename": "test_image.jpg",
            "pipeline": "beast"
        }
    }
    
    test_result = handler(test_event)
    print(f"Test analysis: {test_result}")
else:
    # Initialize models when imported
    initialize_models()
