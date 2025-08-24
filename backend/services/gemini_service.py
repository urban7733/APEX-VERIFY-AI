"""
Gemini Pro Vision Service for Contextual Image Analysis

This service uses Google's Gemini Pro Vision to analyze image content and generate
human-readable reports about what's in the image.
"""

import logging
import google.generativeai as genai
from typing import Dict, List, Optional
import os
import base64
from PIL import Image
import io

logger = logging.getLogger(__name__)

class GeminiService:
    """
    Service for Gemini Pro Vision image analysis and report generation
    """
    
    def __init__(self):
        self.model = None
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.initialized = False
        
    async def initialize(self):
        """Initialize the Gemini Pro Vision service"""
        try:
            if not self.api_key:
                logger.warning("GEMINI_API_KEY not set, using placeholder service")
                self.initialized = False
                return False
            
            logger.info("Initializing Gemini Pro Vision service...")
            
            # Configure Gemini
            genai.configure(api_key=self.api_key)
            
            # Get the model
            self.model = genai.GenerativeModel('gemini-pro-vision')
            
            self.initialized = True
            logger.info("Gemini Pro Vision service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Gemini service: {e}")
            self.initialized = False
            return False
    
    async def analyze_image_content(self, image_path: str) -> Dict[str, any]:
        """
        Analyze image content using Gemini Pro Vision
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Content analysis results
        """
        try:
            if not self.initialized:
                return await self._placeholder_content_analysis()
            
            # Load image
            with open(image_path, "rb") as image_file:
                image_data = image_file.read()
            
            # Create prompt for content analysis
            prompt = """
            Analyze this image and provide a detailed report including:
            
            1. **Content Description**: What objects, people, scenes, or text are visible?
            2. **Context Analysis**: What is the setting, mood, or purpose of this image?
            3. **Technical Observations**: Any notable technical aspects (lighting, composition, quality)?
            4. **Authenticity Indicators**: Any signs that suggest this might be AI-generated or manipulated?
            5. **Summary**: Brief overall assessment of the image content.
            
            Provide the analysis in a structured, professional format.
            """
            
            # Generate content analysis
            response = await self.model.generate_content([prompt, image_data])
            
            # Parse and structure the response
            analysis = {
                "content_description": self._extract_section(response.text, "Content Description"),
                "context_analysis": self._extract_section(response.text, "Context Analysis"),
                "technical_observations": self._extract_section(response.text, "Technical Observations"),
                "authenticity_indicators": self._extract_section(response.text, "Authenticity Indicators"),
                "summary": self._extract_section(response.text, "Summary"),
                "raw_response": response.text,
                "model_used": "gemini-pro-vision"
            }
            
            logger.info("Gemini content analysis completed")
            return analysis
            
        except Exception as e:
            logger.error(f"Gemini content analysis failed: {e}")
            # Fallback to placeholder analysis
            return await self._placeholder_content_analysis()
    
    async def generate_verification_report(self, 
                                        dinov3_results: Dict[str, any],
                                        content_analysis: Dict[str, any]) -> Dict[str, any]:
        """
        Generate a comprehensive verification report combining DINOv3 and Gemini results
        
        Args:
            dinov3_results: Results from DINOv3 analysis
            content_analysis: Results from Gemini content analysis
            
        Returns:
            Comprehensive verification report
        """
        try:
            logger.info("Generating comprehensive verification report...")
            
            # Calculate final authenticity score
            dinov3_score = dinov3_results.get("authenticity_score", 0.0)
            
            # Convert to percentage
            authenticity_percentage = round(dinov3_score * 100, 1)
            
            # Determine verdict
            if authenticity_percentage >= 95:
                verdict = "REAL"
                confidence = "HIGH"
            elif authenticity_percentage >= 80:
                verdict = "LIKELY_REAL"
                confidence = "MEDIUM"
            elif authenticity_percentage >= 60:
                verdict = "UNCERTAIN"
                confidence = "LOW"
            else:
                verdict = "FAKE"
                confidence = "HIGH"
            
            # Generate recommendations
            recommendations = self._generate_recommendations(authenticity_percentage, dinov3_results)
            
            # Create comprehensive report
            report = {
                "authenticity_score": authenticity_percentage,
                "verdict": verdict,
                "confidence": confidence,
                "analysis": {
                    "model_used": f"DINOv3 + Gemini Pro Vision",
                    "processing_time_ms": dinov3_results.get("processing_time_ms", 0),
                    "anomalies_detected": dinov3_results.get("anomaly_count", 0)
                },
                "technical_details": {
                    "dinov3_features": "extracted" if dinov3_results.get("features_extracted") else "failed",
                    "gemini_analysis": "completed" if content_analysis else "failed",
                    "final_score": authenticity_percentage
                },
                "content_analysis": content_analysis,
                "anomaly_details": dinov3_results.get("anomalies_detected", {}),
                "recommendations": recommendations,
                "verification_timestamp": "2024-01-01T00:00:00Z"  # TODO: Use actual timestamp
            }
            
            logger.info("Verification report generated successfully")
            return report
            
        except Exception as e:
            logger.error(f"Report generation failed: {e}")
            raise
    
    def _extract_section(self, text: str, section_name: str) -> str:
        """Extract a specific section from Gemini response text"""
        try:
            # Simple text parsing - in production, use more robust parsing
            lines = text.split('\n')
            section_content = []
            in_section = False
            
            for line in lines:
                if section_name.lower() in line.lower():
                    in_section = True
                    continue
                elif in_section and line.strip() and any(keyword in line.lower() for keyword in ['context analysis', 'technical observations', 'authenticity indicators', 'summary']):
                    break
                elif in_section:
                    section_content.append(line.strip())
            
            return '\n'.join(section_content).strip() if section_content else "Analysis not available"
            
        except Exception as e:
            logger.warning(f"Failed to extract section {section_name}: {e}")
            return "Section extraction failed"
    
    def _generate_recommendations(self, authenticity_score: float, dinov3_results: Dict[str, any]) -> List[str]:
        """Generate recommendations based on analysis results"""
        recommendations = []
        
        if authenticity_score >= 95:
            recommendations.extend([
                "Image appears to be authentic",
                "No AI generation artifacts detected",
                "Natural image patterns confirmed"
            ])
        elif authenticity_score >= 80:
            recommendations.extend([
                "Image likely authentic with minor concerns",
                "Consider additional verification for critical use cases",
                "Some anomalies detected but within acceptable range"
            ])
        elif authenticity_score >= 60:
            recommendations.extend([
                "Image authenticity uncertain",
                "Multiple anomalies detected",
                "Recommend additional verification before use"
            ])
        else:
            recommendations.extend([
                "Image shows signs of AI generation or manipulation",
                "Do not use for critical applications",
                "Consider reverse image search for verification"
            ])
        
        # Add specific recommendations based on anomaly types
        anomalies = dinov3_results.get("anomalies_detected", {})
        if anomalies.get("gan_artifacts", 0) > 0.2:
            recommendations.append("GAN artifacts detected - possible AI generation")
        
        if anomalies.get("lighting_anomalies", 0) > 0.2:
            recommendations.append("Lighting inconsistencies suggest potential manipulation")
        
        return recommendations
    
    async def _placeholder_content_analysis(self) -> Dict[str, any]:
        """Placeholder content analysis when Gemini is not available"""
        return {
            "content_description": "Image content analysis not available in demo mode",
            "context_analysis": "Context analysis requires Gemini Pro Vision API key",
            "technical_observations": "Technical analysis limited without full service",
            "authenticity_indicators": "Authenticity indicators analysis unavailable",
            "summary": "Content analysis service not fully configured",
            "raw_response": "Placeholder response - configure Gemini API for full analysis",
            "model_used": "placeholder"
        }

# Global service instance
gemini_service = GeminiService()
