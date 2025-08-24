"""
Verification Orchestrator Service

This service coordinates the entire image verification pipeline, orchestrating
DINOv3 feature extraction, anomaly detection, and Gemini Pro Vision content analysis.
"""

import logging
import tempfile
import os
import hashlib
from typing import Dict, Any, Optional
from .dinov3_service import DINOv3Service
from .gemini_service import GeminiService
from .digital_seal_service import digital_seal_service
from ..utils.file_utils import validate_image_file, get_image_metadata, create_temp_file_path, cleanup_temp_file

logger = logging.getLogger(__name__)

class VerificationOrchestrator:
    """
    Orchestrates the complete image verification pipeline including digital sealing.
    """
    
    def __init__(self):
        self.dinov3_service = DINOv3Service()
        self.gemini_service = GeminiService()
        self.services_initialized = False
        
    async def initialize(self):
        """Initialize all AI services."""
        try:
            # Initialize DINOv3 service
            await self.dinov3_service.initialize()
            
            # Initialize Gemini service
            await self.gemini_service.initialize()
            
            self.services_initialized = True
            print("Verification orchestrator initialized successfully")
            
        except Exception as e:
            print(f"Error initializing verification orchestrator: {e}")
            self.services_initialized = False
    
    async def verify_image(self, image_file_path: str, api_key: str = None) -> Dict[str, Any]:
        """
        Complete image verification pipeline with digital sealing.
        
        Args:
            image_file_path: Path to the image file
            api_key: API key for verification (optional)
            
        Returns:
            Complete verification result with digital seal
        """
        try:
            # Validate image file
            if not validate_image_file(image_file_path):
                return {"error": "Invalid image file"}
            
            # Get image metadata
            metadata = get_image_metadata(image_file_path)
            
            # Calculate image hash for digital seal
            with open(image_file_path, 'rb') as f:
                image_bytes = f.read()
                image_hash = hashlib.sha256(image_bytes).hexdigest()
            
            # Check if image already has a digital seal
            seal_check = digital_seal_service.verify_seal_integrity(image_file_path)
            if seal_check.get("has_seal", False):
                return {
                    "error": "Image already has a digital seal",
                    "existing_seal": seal_check,
                    "message": "This image has already been verified and sealed by APEX VERIFY AI"
                }
            
            # Run DINOv3 analysis
            dinov3_result = await self.dinov3_service.analyze_image(image_file_path)
            
            # Run Gemini analysis
            gemini_result = await self.gemini_service.analyze_image_content(image_file_path)
            
            # Combine results
            verification_result = self._combine_results(dinov3_result, gemini_result, metadata)
            
            # Create digital seal if image is verified as authentic
            seal_data = None
            sealed_image_path = None
            
            if verification_result.get("verdict") in ["REAL", "LIKELY_REAL"] and verification_result.get("authenticity_score", 0) >= 80:
                # Create digital seal
                api_key_hash = hashlib.sha256((api_key or "no_key").encode()).hexdigest()
                seal_data = digital_seal_service.create_digital_seal(
                    image_hash=image_hash,
                    verification_result=verification_result,
                    api_key_hash=api_key_hash
                )
                
                # Embed seal in image
                sealed_image_path = self._embed_digital_seal(image_file_path, seal_data)
                
                # Add seal information to result
                verification_result["digital_seal"] = {
                    "seal_id": seal_data["seal_hash"][:16],
                    "sealed_at": seal_data["timestamp"],
                    "sealed_image_path": sealed_image_path,
                    "certificate": digital_seal_service.create_verification_certificate(seal_data, image_file_path)
                }
            
            # Add image hash to result
            verification_result["image_hash"] = image_hash
            verification_result["seal_status"] = "sealed" if seal_data else "not_sealed"
            
            return verification_result
            
        except Exception as e:
            print(f"Error in verification pipeline: {e}")
            return {"error": f"Verification failed: {str(e)}"}
    
    def _combine_results(self, dinov3_result: Dict[str, Any], gemini_result: Dict[str, Any], metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Combine DINOv3 and Gemini results into final verification result."""
        
        # Calculate final authenticity score
        dinov3_score = dinov3_result.get("authenticity_score", 50)
        gemini_confidence = gemini_result.get("confidence_score", 0.5)
        
        # Weighted combination (DINOv3 is more important)
        final_score = (dinov3_score * 0.7) + (gemini_confidence * 100 * 0.3)
        final_score = max(0, min(100, final_score))
        
        # Determine verdict
        if final_score >= 95:
            verdict = "REAL"
            confidence = "HIGH"
        elif final_score >= 80:
            verdict = "LIKELY_REAL"
            confidence = "HIGH"
        elif final_score >= 60:
            verdict = "UNCERTAIN"
            confidence = "MEDIUM"
        else:
            verdict = "FAKE"
            confidence = "HIGH"
        
        return {
            "authenticity_score": round(final_score, 1),
            "verdict": verdict,
            "confidence": confidence,
            "analysis": {
                "model_used": "DINOv3 + Gemini Pro Vision",
                "processing_time_ms": dinov3_result.get("processing_time_ms", 0) + gemini_result.get("processing_time_ms", 0),
                "anomalies_detected": dinov3_result.get("anomalies_detected", 0)
            },
            "technical_details": {
                "dinov3_features": dinov3_result.get("features_summary", "No features extracted"),
                "gemini_analysis": gemini_result.get("content_analysis", "No content analysis"),
                "final_score": final_score
            },
            "recommendations": self._generate_recommendations(verdict, final_score),
            "metadata": metadata,
            "dinov3_details": dinov3_result,
            "gemini_details": gemini_result
        }
    
    def _generate_recommendations(self, verdict: str, score: float) -> list:
        """Generate recommendations based on verification result."""
        recommendations = []
        
        if verdict in ["REAL", "LIKELY_REAL"]:
            recommendations.append("Image appears to be authentic")
            recommendations.append("Consider downloading the sealed version for permanent verification")
            recommendations.append("Share the sealed image to maintain authenticity")
        elif verdict == "UNCERTAIN":
            recommendations.append("Image authenticity is unclear")
            recommendations.append("Consider additional verification methods")
            recommendations.append("Exercise caution when using this image")
        else:
            recommendations.append("Image appears to be manipulated or AI-generated")
            recommendations.append("Do not use this image for official purposes")
            recommendations.append("Consider reporting to relevant authorities")
        
        return recommendations
    
    def _embed_digital_seal(self, original_path: str, seal_data: Dict[str, Any]) -> Optional[str]:
        """Embed digital seal in image and return path to sealed image."""
        try:
            # Create sealed image path
            base_name = os.path.splitext(os.path.basename(original_path))[0]
            sealed_dir = os.path.join(os.path.dirname(original_path), "sealed")
            os.makedirs(sealed_dir, exist_ok=True)
            
            sealed_path = os.path.join(sealed_dir, f"{base_name}_sealed.png")
            
            # Determine image format and embed seal
            if original_path.lower().endswith(('.jpg', '.jpeg')):
                success = digital_seal_service.embed_seal_in_jpeg(original_path, seal_data, sealed_path)
            else:
                success = digital_seal_service.embed_seal_in_image(original_path, seal_data, sealed_path)
            
            if success:
                return sealed_path
            else:
                print("Failed to embed digital seal")
                return None
                
        except Exception as e:
            print(f"Error embedding digital seal: {e}")
            return None
    
    def get_service_status(self) -> Dict[str, Any]:
        """Get status of all services."""
        return {
            "orchestrator": "initialized" if self.services_initialized else "not_initialized",
            "dinov3_service": self.dinov3_service.get_status(),
            "gemini_service": self.gemini_service.get_status(),
            "digital_seal_service": "available"
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Health check for the verification system."""
        return {
            "status": "healthy" if self.services_initialized else "degraded",
            "services": self.get_service_status(),
            "timestamp": "2024-01-01T00:00:00Z"  # Placeholder
        }

# Create global instance
verification_orchestrator = VerificationOrchestrator()
