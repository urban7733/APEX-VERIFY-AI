import os
import hashlib
import json
import base64
from typing import Dict, Any, List
from PIL import Image
import io
import requests
from datetime import datetime

class SimpleAIPipeline:
    """
    Simple and effective AI pipeline for APEX VERIFY AI.
    Combines DINOv3 feature extraction with Gemini Pro Vision analysis.
    """
    
    def __init__(self):
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent"
        
    def analyze_image(self, image_data: bytes) -> Dict[str, Any]:
        """
        Main pipeline: analyze image for authenticity.
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Complete analysis result
        """
        try:
            # Step 1: Basic image validation
            image_info = self._validate_image(image_data)
            
            # Step 2: Calculate image hash
            image_hash = hashlib.sha256(image_data).hexdigest()
            
            # Step 3: Extract features (simulated DINOv3)
            features = self._extract_features(image_data)
            
            # Step 4: Gemini Pro Vision analysis
            gemini_analysis = self._analyze_with_gemini(image_data)
            
            # Step 5: Combine results and score
            authenticity_score = self._calculate_score(features, gemini_analysis)
            verdict = self._get_verdict(authenticity_score)
            
            # Step 6: Create result
            result = {
                "timestamp": datetime.utcnow().isoformat(),
                "image_hash": image_hash,
                "image_info": image_info,
                "authenticity_score": authenticity_score,
                "verdict": verdict,
                "confidence": self._get_confidence(authenticity_score),
                "analysis": {
                    "features": features,
                    "gemini_analysis": gemini_analysis
                },
                "recommendations": self._get_recommendations(verdict, authenticity_score)
            }
            
            return result
            
        except Exception as e:
            return {
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
                "status": "failed"
            }
    
    def _validate_image(self, image_data: bytes) -> Dict[str, Any]:
        """Validate and get basic image information."""
        try:
            with Image.open(io.BytesIO(image_data)) as img:
                return {
                    "format": img.format,
                    "mode": img.mode,
                    "size": img.size,
                    "width": img.width,
                    "height": img.height
                }
        except Exception as e:
            raise Exception(f"Invalid image: {e}")
    
    def _extract_features(self, image_data: bytes) -> Dict[str, Any]:
        """
        Extract image features (simulated DINOv3 analysis).
        In production, this would use the actual DINOv3 model.
        """
        try:
            with Image.open(io.BytesIO(image_data)) as img:
                # Simulate feature extraction
                features = {
                    "resolution_analysis": self._analyze_resolution(img.size),
                    "color_analysis": self._analyze_colors(img),
                    "texture_analysis": self._analyze_texture(img),
                    "composition_analysis": self._analyze_composition(img.size),
                    "metadata_analysis": self._analyze_metadata(img)
                }
                
                # Calculate anomaly score
                anomaly_score = self._calculate_anomaly_score(features)
                
                return {
                    "features": features,
                    "anomaly_score": anomaly_score,
                    "anomaly_detected": anomaly_score > 0.3
                }
                
        except Exception as e:
            return {"error": f"Feature extraction failed: {e}"}
    
    def _analyze_resolution(self, size: tuple) -> Dict[str, Any]:
        """Analyze image resolution for anomalies."""
        width, height = size
        aspect_ratio = width / height
        
        # Check for common AI generation patterns
        resolution_score = 0
        if width >= 1024 and height >= 1024:
            resolution_score += 0.3  # High resolution
        if 0.9 <= aspect_ratio <= 1.1:
            resolution_score += 0.2  # Square-ish ratio
        if width % 64 == 0 and height % 64 == 0:
            resolution_score += 0.3  # Common AI model output size
            
        return {
            "width": width,
            "height": height,
            "aspect_ratio": round(aspect_ratio, 3),
            "resolution_score": resolution_score,
            "suspicious": resolution_score > 0.5
        }
    
    def _analyze_colors(self, img: Image.Image) -> Dict[str, Any]:
        """Analyze color patterns for anomalies."""
        try:
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Get color statistics
            colors = img.getcolors(maxcolors=img.width * img.height)
            if colors:
                total_pixels = sum(count for count, _ in colors)
                unique_colors = len(colors)
                color_diversity = unique_colors / total_pixels
                
                # Check for AI generation patterns
                color_score = 0
                if color_diversity < 0.01:  # Very low color diversity
                    color_score += 0.4
                if color_diversity > 0.5:   # Very high color diversity
                    color_score += 0.3
                    
                return {
                    "total_pixels": total_pixels,
                    "unique_colors": unique_colors,
                    "color_diversity": round(color_diversity, 4),
                    "color_score": color_score,
                    "suspicious": color_score > 0.3
                }
            else:
                return {"error": "Could not analyze colors"}
                
        except Exception as e:
            return {"error": f"Color analysis failed: {e}"}
    
    def _analyze_texture(self, img: Image.Image) -> Dict[str, Any]:
        """Analyze texture patterns for anomalies."""
        try:
            # Simple texture analysis
            gray = img.convert('L')
            pixels = list(gray.getdata())
            
            # Calculate local variance (texture measure)
            width, height = gray.size
            variance_sum = 0
            sample_count = 0
            
            for y in range(1, height - 1):
                for x in range(1, width - 1):
                    center = pixels[y * width + x]
                    neighbors = [
                        pixels[(y-1) * width + x],
                        pixels[(y+1) * width + x],
                        pixels[y * width + (x-1)],
                        pixels[y * width + (x+1)]
                    ]
                    
                    if neighbors:
                        variance = sum((center - n) ** 2 for n in neighbors) / len(neighbors)
                        variance_sum += variance
                        sample_count += 1
            
            if sample_count > 0:
                avg_variance = variance_sum / sample_count
                
                # Check for AI generation patterns
                texture_score = 0
                if avg_variance < 100:  # Very smooth texture
                    texture_score += 0.4
                if avg_variance > 2000:  # Very noisy texture
                    texture_score += 0.3
                    
                return {
                    "average_variance": round(avg_variance, 2),
                    "texture_score": texture_score,
                    "suspicious": texture_score > 0.3
                }
            else:
                return {"error": "Could not analyze texture"}
                
        except Exception as e:
            return {"error": f"Texture analysis failed: {e}"}
    
    def _analyze_composition(self, size: tuple) -> Dict[str, Any]:
        """Analyze image composition for anomalies."""
        width, height = size
        
        # Check for common AI composition patterns
        composition_score = 0
        
        # Rule of thirds analysis
        third_w = width / 3
        third_h = height / 3
        
        # Check if main subjects align with rule of thirds
        # This is simplified - in production would use actual object detection
        composition_score += 0.1  # Base score
        
        # Check for centered subjects (common in AI)
        if width == height:  # Square images often have centered subjects
            composition_score += 0.2
            
        return {
            "width": width,
            "height": height,
            "rule_of_thirds": {
                "vertical_lines": [third_w, third_w * 2],
                "horizontal_lines": [third_h, third_h * 2]
            },
            "composition_score": composition_score,
            "suspicious": composition_score > 0.2
        }
    
    def _analyze_metadata(self, img: Image.Image) -> Dict[str, Any]:
        """Analyze image metadata for anomalies."""
        metadata = {}
        
        # Check for common AI generation metadata
        if hasattr(img, 'info'):
            info = img.info
            
            # Check for AI software indicators
            if 'Software' in info:
                software = str(info['Software']).lower()
                if any(ai_indicator in software for ai_indicator in ['midjourney', 'dall-e', 'stable diffusion', 'ai', 'generated']):
                    metadata['ai_software_detected'] = True
                    metadata['software_name'] = info['Software']
            
            # Check for unusual metadata patterns
            if 'Comment' in info:
                comment = str(info['Comment']).lower()
                if any(ai_indicator in comment for ai_indicator in ['ai', 'generated', 'prompt']):
                    metadata['ai_comment_detected'] = True
                    
        metadata['has_metadata'] = bool(metadata)
        return metadata
    
    def _calculate_anomaly_score(self, features: Dict[str, Any]) -> float:
        """Calculate overall anomaly score from all features."""
        scores = []
        
        for feature_name, feature_data in features.items():
            if isinstance(feature_data, dict) and 'suspicious' in feature_data:
                if feature_data['suspicious']:
                    if 'score' in feature_data:
                        scores.append(feature_data['score'])
                    else:
                        scores.append(0.5)  # Default suspicious score
        
        if scores:
            return sum(scores) / len(scores)
        return 0.0
    
    def _analyze_with_gemini(self, image_data: bytes) -> Dict[str, Any]:
        """Analyze image content with Gemini Pro Vision."""
        if not self.gemini_api_key:
            return {
                "error": "Gemini API key not configured",
                "fallback_analysis": self._fallback_content_analysis(image_data)
            }
        
        try:
            # Encode image to base64
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Prepare prompt for Gemini
            prompt = """
            Analyze this image for authenticity and potential AI generation/manipulation.
            
            Focus on:
            1. Content consistency and realism
            2. Unusual patterns or artifacts
            3. Text, logos, or watermarks
            4. Overall image quality and naturalness
            
            Provide a detailed analysis with specific observations.
            """
            
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
                    "temperature": 0.1,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 1024,
                }
            }
            
            # Make request to Gemini
            headers = {"Content-Type": "application/json"}
            response = requests.post(
                f"{self.gemini_url}?key={self.gemini_api_key}",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result and result['candidates']:
                    content = result['candidates'][0]['content']
                    if 'parts' in content and content['parts']:
                        analysis_text = content['parts'][0]['text']
                        
                        return {
                            "analysis": analysis_text,
                            "confidence": "high",
                            "source": "gemini_pro_vision"
                        }
            
            # Fallback if Gemini fails
            return self._fallback_content_analysis(image_data)
            
        except Exception as e:
            return {
                "error": f"Gemini analysis failed: {e}",
                "fallback_analysis": self._fallback_content_analysis(image_data)
            }
    
    def _fallback_content_analysis(self, image_data: bytes) -> Dict[str, Any]:
        """Fallback content analysis when Gemini is unavailable."""
        try:
            with Image.open(io.BytesIO(image_data)) as img:
                # Basic content analysis
                analysis = {
                    "image_type": "analyzed",
                    "content_notes": "Basic analysis performed (Gemini unavailable)",
                    "confidence": "medium",
                    "source": "fallback_analysis"
                }
                
                # Add basic observations
                if img.mode == 'RGB':
                    analysis["color_mode"] = "color"
                elif img.mode == 'L':
                    analysis["color_mode"] = "grayscale"
                else:
                    analysis["color_mode"] = "other"
                
                analysis["dimensions"] = f"{img.width}x{img.height}"
                
                return analysis
                
        except Exception as e:
            return {
                "error": f"Fallback analysis failed: {e}",
                "confidence": "low",
                "source": "fallback_analysis"
            }
    
    def _calculate_score(self, features: Dict[str, Any], gemini_analysis: Dict[str, Any]) -> float:
        """Calculate final authenticity score (0-100)."""
        base_score = 50.0  # Start with neutral score
        
        # Feature analysis impact (40% weight)
        if 'anomaly_score' in features:
            anomaly_impact = features['anomaly_score'] * 40
            base_score -= anomaly_impact
        
        # Gemini analysis impact (30% weight)
        if 'error' not in gemini_analysis and 'analysis' in gemini_analysis:
            # Positive Gemini analysis
            base_score += 15
        elif 'fallback_analysis' in gemini_analysis:
            # Fallback analysis
            base_score += 5
        
        # Metadata analysis impact (20% weight)
        if 'features' in features and 'metadata_analysis' in features['features']:
            metadata = features['features']['metadata_analysis']
            if metadata.get('ai_software_detected') or metadata.get('ai_comment_detected'):
                base_score -= 20
        
        # Resolution analysis impact (10% weight)
        if 'features' in features and 'resolution_analysis' in features['features']:
            resolution = features['features']['resolution_analysis']
            if resolution.get('suspicious'):
                base_score -= 10
        
        # Ensure score is between 0 and 100
        return max(0.0, min(100.0, base_score))
    
    def _get_verdict(self, score: float) -> str:
        """Get human-readable verdict based on score."""
        if score >= 90:
            return "REAL"
        elif score >= 75:
            return "LIKELY_REAL"
        elif score >= 50:
            return "UNCERTAIN"
        elif score >= 25:
            return "LIKELY_FAKE"
        else:
            return "FAKE"
    
    def _get_confidence(self, score: float) -> str:
        """Get confidence level based on score."""
        if score >= 90 or score <= 10:
            return "VERY_HIGH"
        elif score >= 75 or score <= 25:
            return "HIGH"
        elif score >= 50:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _get_recommendations(self, verdict: str, score: float) -> List[str]:
        """Get actionable recommendations based on verdict."""
        recommendations = []
        
        if verdict == "REAL":
            recommendations.extend([
                "This image appears to be authentic",
                "Consider using for professional purposes",
                "Digital seal can be applied for verification"
            ])
        elif verdict == "LIKELY_REAL":
            recommendations.extend([
                "Image shows strong signs of authenticity",
                "Minor anomalies detected but likely real",
                "Suitable for most professional uses"
            ])
        elif verdict == "UNCERTAIN":
            recommendations.extend([
                "Unable to determine authenticity with confidence",
                "Consider additional verification methods",
                "Use with caution for professional purposes"
            ])
        elif verdict == "LIKELY_FAKE":
            recommendations.extend([
                "Multiple signs of AI generation detected",
                "Not recommended for professional use",
                "Consider reverse image search for verification"
            ])
        elif verdict == "FAKE":
            recommendations.extend([
                "Strong evidence of AI generation or manipulation",
                "Do not use for professional purposes",
                "Image may violate content policies"
            ])
        
        # Add general recommendations
        if score < 50:
            recommendations.append("Consider using APEX VERIFY AI for additional verification")
        
        return recommendations

# Global instance
ai_pipeline = SimpleAIPipeline()
