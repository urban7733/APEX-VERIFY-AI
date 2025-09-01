import torch
from transformers import AutoImageProcessor, SiglipForImageClassification
from PIL import Image
import numpy as np
import logging

logger = logging.getLogger(__name__)

class DeepfakeDetector:
    def __init__(self):
        self.model_name = "prithivMLmods/deepfake-detector-model-v1"
        self.model = None
        self.processor = None
        self.id2label = {
            "0": "fake",
            "1": "real"
        }
        self.load_model()
    
    def load_model(self):
        """Load the deepfake detection model"""
        try:
            logger.info(f"Loading model: {self.model_name}")
            self.model = SiglipForImageClassification.from_pretrained(self.model_name)
            self.processor = AutoImageProcessor.from_pretrained(self.model_name)
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def classify_image(self, image_path):
        """
        Classify an image as real or fake
        
        Args:
            image_path: Path to the image file
            
        Returns:
            dict: Classification results with probabilities
        """
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert("RGB")
            inputs = self.processor(images=image, return_tensors="pt")
            
            # Run inference
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                probs = torch.nn.functional.softmax(logits, dim=1).squeeze().tolist()
            
            # Format results
            prediction = {
                self.id2label[str(i)]: round(probs[i], 4) for i in range(len(probs))
            }
            
            # Determine if image is authentic (real)
            is_authentic = prediction["real"] > prediction["fake"]
            confidence_score = prediction["real"] if is_authentic else prediction["fake"]
            
            return {
                "is_authentic": is_authentic,
                "confidence": confidence_score,
                "probabilities": prediction,
                "classification": "real" if is_authentic else "fake"
            }
            
        except Exception as e:
            logger.error(f"Classification failed: {e}")
            raise

# Global detector instance
detector = None

def get_detector():
    """Get or create detector instance"""
    global detector
    if detector is None:
        detector = DeepfakeDetector()
    return detector

def analyze_image(image_path):
    """Analyze image for deepfake detection"""
    detector = get_detector()
    return detector.classify_image(image_path)
