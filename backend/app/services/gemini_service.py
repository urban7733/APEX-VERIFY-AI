import os
import base64
import requests
import logging
from typing import Dict, Any, Optional
from PIL import Image
import io

logger = logging.getLogger(__name__)

class GeminiReportService:
    """
    Gemini Pro Vision Service for APEX VERIFY AI
    Generates professional analysis reports using the exact template format
    """
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent"
        
        if not self.api_key:
            logger.error("GEMINI_API_KEY not configured")
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        logger.info("Gemini Report Service initialized")
    
    def generate_report(self, image_data: bytes, analysis: Dict[str, Any]) -> str:
        """
        Generate comprehensive report using Gemini Pro Vision
        
        Args:
            image_data: Raw image bytes
            analysis: DINOv3 analysis results
            
        Returns:
            Formatted report string using exact template
        """
        try:
            # Prepare the prompt with exact template format
            prompt = self._create_prompt(analysis)
            
            # Send request to Gemini
            response = self._call_gemini_api(image_data, prompt)
            
            if response:
                # Format the response using the exact template
                return self._format_report(analysis, response)
            else:
                # Fallback to template-only report
                return self._create_fallback_report(analysis)
                
        except Exception as e:
            logger.error(f"Report generation failed: {e}")
            return self._create_fallback_report(analysis)
    
    def _create_prompt(self, analysis: Dict[str, Any]) -> str:
        """
        Create the prompt for Gemini Pro Vision
        
        Args:
            analysis: DINOv3 analysis results
            
        Returns:
            Formatted prompt string
        """
        authenticity_score = analysis.get('authenticity_score', 0)
        classification = analysis.get('classification', 'UNKNOWN')
        confidence = analysis.get('confidence', 0)
        feature_anomalies = analysis.get('feature_anomalies', [])
        
        prompt = f"""
        Analyze this image for authenticity and provide a professional assessment.
        
        DINOv3 Analysis Results:
        - Authenticity Score: {authenticity_score}%
        - Classification: {classification}
        - Confidence: {confidence}
        - Feature Anomalies: {', '.join(feature_anomalies) if feature_anomalies else 'None detected'}
        
        Please provide a detailed analysis that includes:
        1. Visual content assessment (people, objects, scenes, text)
        2. Quality and realism evaluation
        3. Potential manipulation indicators
        4. Professional recommendation
        
        Focus on:
        - Content consistency and naturalness
        - Unusual patterns or artifacts
        - Overall image quality
        - Specific details that support or contradict the authenticity score
        
        Provide a professional, detailed analysis that a user can trust for decision-making.
        """
        
        return prompt
    
    def _call_gemini_api(self, image_data: bytes, prompt: str) -> Optional[str]:
        """
        Call Gemini Pro Vision API
        
        Args:
            image_data: Raw image bytes
            prompt: Analysis prompt
            
        Returns:
            Gemini response text or None if failed
        """
        try:
            # Encode image to base64
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Prepare request payload
            payload = {
                "contents": [{
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": image_base64
                            }
                        }
                    ]
                }],
                "generationConfig": {
                    "temperature": 0.1,  # Low temperature for consistent output
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 1024,
                }
            }
            
            # Make API request
            headers = {"Content-Type": "application/json"}
            response = requests.post(
                f"{self.base_url}?key={self.api_key}",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result and result['candidates']:
                    content = result['candidates'][0]['content']
                    if 'parts' in content and content['parts']:
                        return content['parts'][0]['text']
            
            logger.warning(f"Gemini API returned status {response.status_code}")
            return None
            
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            return None
    
    def _format_report(self, analysis: Dict[str, Any], gemini_response: str) -> str:
        """
        Format the final report using the exact template specified
        
        Args:
            analysis: DINOv3 analysis results
            gemini_response: Raw Gemini response
            
        Returns:
            Formatted report string
        """
        authenticity_score = analysis.get('authenticity_score', 0)
        classification = analysis.get('classification', 'UNKNOWN')
        
        # Use the exact template format from requirements
        report = f"""Apex Verify AI Analysis: COMPLETE & REFINED
Authenticity Score: {authenticity_score}% - {classification}
Assessment: {self._extract_assessment(gemini_response)}

{gemini_response}

---
Analysis powered by DINOv3 + Gemini Pro Vision
Confidence: {analysis.get('confidence', 0)}
Feature Anomalies: {', '.join(analysis.get('feature_anomalies', [])) if analysis.get('feature_anomalies') else 'None detected'}"""
        
        return report
    
    def _extract_assessment(self, gemini_response: str) -> str:
        """
        Extract a concise assessment from Gemini response
        
        Args:
            gemini_response: Full Gemini response
            
        Returns:
            Concise assessment string
        """
        # Take first sentence or first 100 characters
        lines = gemini_response.strip().split('\n')
        first_line = lines[0] if lines else ""
        
        if len(first_line) > 100:
            return first_line[:97] + "..."
        
        return first_line
    
    def _create_fallback_report(self, analysis: Dict[str, Any]) -> str:
        """
        Create fallback report when Gemini API fails
        
        Args:
            analysis: DINOv3 analysis results
            
        Returns:
            Fallback report string
        """
        authenticity_score = analysis.get('authenticity_score', 0)
        classification = analysis.get('classification', 'UNKNOWN')
        confidence = analysis.get('confidence', 0)
        feature_anomalies = analysis.get('feature_anomalies', [])
        
        # Create professional fallback report
        if classification == "REAL":
            assessment = "This image shows strong signs of authenticity based on DINOv3 analysis."
        else:
            assessment = "This image shows indicators of potential manipulation or AI generation."
        
        report = f"""Apex Verify AI Analysis: COMPLETE & REFINED
Authenticity Score: {authenticity_score}% - {classification}
Assessment: {assessment}

DINOv3 Analysis Results:
- Feature Analysis: DINOv3 deep learning model analyzed image features
- Authenticity Score: {authenticity_score}% (Threshold: 95% for REAL classification)
- Confidence Level: {confidence}
- Detected Anomalies: {', '.join(feature_anomalies) if feature_anomalies else 'None detected'}

Technical Details:
- Model: DINOv3 Vision Transformer (ViT-B/14)
- Analysis Method: Feature extraction and anomaly detection
- Processing: GPU-accelerated deep learning inference

Recommendation: {'Use with confidence' if classification == 'REAL' else 'Exercise caution and verify through additional sources'}

---
Analysis powered by DINOv3 (Gemini Pro Vision temporarily unavailable)
Confidence: {confidence}
Feature Anomalies: {', '.join(feature_anomalies) if feature_anomalies else 'None detected'}"""
        
        return report
    
    def test_connection(self) -> Dict[str, Any]:
        """
        Test Gemini API connection
        
        Returns:
            Connection status and model info
        """
        try:
            # Create a simple test image
            test_image = Image.new('RGB', (100, 100), color='red')
            img_byte_arr = io.BytesIO()
            test_image.save(img_byte_arr, format='JPEG')
            test_image_data = img_byte_arr.getvalue()
            
            # Test prompt
            test_prompt = "Describe this simple red square image in one sentence."
            
            # Test API call
            response = self._call_gemini_api(test_image_data, test_prompt)
            
            if response:
                return {
                    "status": "connected",
                    "model": "gemini-pro-vision",
                    "test_response": response[:100] + "..." if len(response) > 100 else response
                }
            else:
                return {
                    "status": "failed",
                    "error": "No response from Gemini API"
                }
                
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
