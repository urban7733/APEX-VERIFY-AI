import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class DINOv3Analyzer:
    """
    DINOv3 Model Integration for APEX VERIFY AI
    Loads the 25GB .pth file and provides authenticity analysis
    """
    
    def __init__(self, model_path: str):
        """
        Initialize DINOv3 analyzer with model weights
        
        Args:
            model_path: Path to the 25GB .pth file
        """
        self.model_path = model_path
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.transform = None
        
        logger.info(f"Initializing DINOv3 Analyzer on device: {self.device}")
        self._load_model()
        self._setup_transforms()
    
    def _load_model(self):
        """Load DINOv3 model from .pth file"""
        try:
            logger.info(f"Loading DINOv3 model from: {self.model_path}")
            
            # Import DINOv3 from Facebook Research
            import torch.hub
            
            # Load base DINOv3 model
            self.model = torch.hub.load('facebookresearch/dinov2', 'dinov2_vitb14', pretrained=False)
            
            # Load custom weights if available
            if torch.cuda.is_available():
                checkpoint = torch.load(self.model_path, map_location='cuda')
            else:
                checkpoint = torch.load(self.model_path, map_location='cpu')
            
            # Load state dict
            self.model.load_state_dict(checkpoint, strict=False)
            self.model.eval()
            self.model.to(self.device)
            
            logger.info("DINOv3 model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load DINOv3 model: {e}")
            self.model = None
            raise
    
    def _setup_transforms(self):
        """Setup image preprocessing transforms for DINOv3"""
        self.transform = transforms.Compose([
            transforms.Resize(224),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
    
    def analyze_image(self, image: Image.Image) -> Dict[str, Any]:
        """
        Analyze image using DINOv3 for authenticity detection
        
        Args:
            image: PIL Image object
            
        Returns:
            Analysis results with authenticity score and features
        """
        if self.model is None:
            raise RuntimeError("DINOv3 model not loaded")
        
        try:
            # Preprocess image
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            img_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Extract features
            with torch.no_grad():
                features = self.model.forward_features(img_tensor)
            
            # Analyze features for authenticity
            analysis = self._analyze_features(features, image.size)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Image analysis failed: {e}")
            raise
    
    def _analyze_features(self, features: torch.Tensor, image_size: tuple) -> Dict[str, Any]:
        """
        Analyze DINOv3 features for authenticity indicators
        
        Args:
            features: DINOv3 feature tensor
            image_size: Original image dimensions (width, height)
            
        Returns:
            Authenticity analysis results
        """
        try:
            # Extract global features (CLS token)
            global_features = features[:, 0, :]  # Shape: [1, feature_dim]
            
            # Extract patch features (excluding CLS token)
            patch_features = features[:, 1:, :]  # Shape: [1, num_patches, feature_dim]
            
            # Calculate feature statistics
            global_mean = global_features.mean().item()
            global_std = global_features.std().item()
            
            patch_mean = patch_features.mean().item()
            patch_std = patch_features.std().item()
            
            # Calculate feature diversity (how varied the features are)
            feature_diversity = torch.std(patch_features, dim=1).mean().item()
            
            # Calculate feature consistency (how consistent features are across patches)
            feature_consistency = torch.mean(torch.std(patch_features, dim=2)).item()
            
            # Analyze for AI generation indicators
            ai_indicators = self._detect_ai_indicators(
                feature_diversity, feature_consistency, image_size
            )
            
            # Calculate authenticity score (0-100)
            authenticity_score = self._calculate_authenticity_score(
                feature_diversity, feature_consistency, ai_indicators
            )
            
            # Determine classification
            classification = "REAL" if authenticity_score > 95 else "SUSPICIOUS"
            
            # Calculate confidence based on feature quality
            confidence = self._calculate_confidence(feature_diversity, feature_consistency)
            
            return {
                "authenticity_score": round(authenticity_score, 1),
                "classification": classification,
                "confidence": round(confidence, 2),
                "feature_anomalies": ai_indicators,
                "feature_stats": {
                    "global_mean": round(global_mean, 4),
                    "global_std": round(global_std, 4),
                    "patch_mean": round(patch_mean, 4),
                    "patch_std": round(patch_std, 4),
                    "feature_diversity": round(feature_diversity, 4),
                    "feature_consistency": round(feature_consistency, 4),
                    "num_patches": patch_features.shape[1],
                    "feature_dimension": patch_features.shape[2]
                }
            }
            
        except Exception as e:
            logger.error(f"Feature analysis failed: {e}")
            raise
    
    def _detect_ai_indicators(self, diversity: float, consistency: float, image_size: tuple) -> List[str]:
        """
        Detect AI generation indicators from feature analysis
        
        Args:
            diversity: Feature diversity score
            consistency: Feature consistency score
            image_size: Image dimensions
            
        Returns:
            List of detected AI indicators
        """
        indicators = []
        
        # Check feature consistency (AI-generated images often have very consistent features)
        if consistency < 0.1:
            indicators.append("very_consistent_features")
        elif consistency < 0.3:
            indicators.append("consistent_features")
        
        # Check feature diversity (AI-generated images often have low diversity)
        if diversity < 0.1:
            indicators.append("very_low_feature_diversity")
        elif diversity < 0.3:
            indicators.append("low_feature_diversity")
        
        # Check image size patterns (common AI generation sizes)
        width, height = image_size
        if width == height and width in [1024, 1536, 2048]:
            indicators.append("standard_ai_resolution")
        
        if width % 64 == 0 and height % 64 == 0:
            indicators.append("ai_model_output_size")
        
        return indicators
    
    def _calculate_authenticity_score(self, diversity: float, consistency: float, indicators: List[str]) -> float:
        """
        Calculate authenticity score (0-100) based on feature analysis
        
        Args:
            diversity: Feature diversity score
            consistency: Feature consistency score
            indicators: List of AI indicators
            
        Returns:
            Authenticity score from 0-100
        """
        base_score = 100.0
        
        # Penalize low feature diversity (indicates AI generation)
        if diversity < 0.1:
            base_score -= 40
        elif diversity < 0.3:
            base_score -= 25
        elif diversity < 0.5:
            base_score -= 15
        
        # Penalize high feature consistency (indicates AI generation)
        if consistency < 0.1:
            base_score -= 35
        elif consistency < 0.3:
            base_score -= 20
        elif consistency < 0.5:
            base_score -= 10
        
        # Additional penalties for specific indicators
        for indicator in indicators:
            if "very_" in indicator:
                base_score -= 15
            elif "low" in indicator or "consistent" in indicator:
                base_score -= 10
            elif "ai_" in indicator:
                base_score -= 5
        
        # Ensure score is between 0 and 100
        return max(0.0, min(100.0, base_score))
    
    def _calculate_confidence(self, diversity: float, consistency: float) -> float:
        """
        Calculate confidence level based on feature quality
        
        Args:
            diversity: Feature diversity score
            consistency: Feature consistency score
            
        Returns:
            Confidence score from 0-1
        """
        # Higher confidence when features are well-distributed
        confidence = 0.5  # Base confidence
        
        # Increase confidence with good feature diversity
        if diversity > 0.7:
            confidence += 0.3
        elif diversity > 0.5:
            confidence += 0.2
        elif diversity > 0.3:
            confidence += 0.1
        
        # Increase confidence with moderate consistency (not too consistent, not too random)
        if 0.3 <= consistency <= 0.7:
            confidence += 0.2
        elif 0.2 <= consistency <= 0.8:
            confidence += 0.1
        
        return min(1.0, confidence)
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        if self.model is None:
            return {"status": "not_loaded"}
        
        return {
            "status": "loaded",
            "device": str(self.device),
            "model_path": self.model_path,
            "parameters": sum(p.numel() for p in self.model.parameters()),
            "trainable_parameters": sum(p.numel() for p in self.model.parameters() if p.requires_grad)
        }
