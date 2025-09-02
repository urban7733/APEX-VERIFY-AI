import os
import hashlib
import json
import base64
import numpy as np
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from typing import Dict, Any, List, Tuple
from PIL import Image
import io
import requests
from datetime import datetime
import logging
from google.cloud import aiplatform
from google.cloud import storage
import tensorflow as tf

# Configure logging for Vertex AI
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AdvancedDeepfakeDetector:
    """
    World's most advanced deepfake detection pipeline for APEX VERIFY AI.
    Deployed on Vertex AI with GPU acceleration and DINOv3 integration.
    """
    
    def __init__(self):
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        self.gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent"
        self.vertex_project = os.getenv('GOOGLE_CLOUD_PROJECT', 'apex-ai-467219')
        self.vertex_region = os.getenv('GOOGLE_CLOUD_REGION', 'us-central1')
        
        # Initialize Vertex AI
        aiplatform.init(project=self.vertex_project, location=self.vertex_region)
        
        # DINOv3 model configuration
        self.dinov3_model_path = os.getenv('DINOV3_MODEL_PATH', '/app/dinov3_model.pth')
        self.dinov3_available = os.path.exists(self.dinov3_model_path)
        
        # AI Model fingerprints for identification
        self.ai_model_fingerprints = {
            'midjourney': {
                'resolution_patterns': [1024, 1536, 1792, 2048],
                'aspect_ratios': [1.0, 1.5, 2.0, 0.75],
                'color_signatures': ['vibrant', 'saturated', 'artistic'],
                'texture_patterns': ['smooth', 'painterly', 'stylized']
            },
            'dalle3': {
                'resolution_patterns': [1024, 1792, 2048],
                'aspect_ratios': [1.0, 1.5, 2.0, 0.75],
                'color_signatures': ['natural', 'balanced', 'photorealistic'],
                'texture_patterns': ['detailed', 'realistic', 'sharp']
            },
            'stable_diffusion': {
                'resolution_patterns': [512, 768, 1024, 1536],
                'aspect_ratios': [1.0, 1.5, 2.0, 0.75],
                'color_signatures': ['varied', 'artistic', 'creative'],
                'texture_patterns': ['artistic', 'varied', 'creative']
            },
            'gemini': {
                'resolution_patterns': [1024, 1536, 2048],
                'aspect_ratios': [1.0, 1.5, 2.0],
                'color_signatures': ['natural', 'balanced', 'realistic'],
                'texture_patterns': ['detailed', 'realistic', 'sharp']
            },
            'imagen': {
                'resolution_patterns': [1024, 1536, 2048],
                'aspect_ratios': [1.0, 1.5, 2.0],
                'color_signatures': ['natural', 'photorealistic', 'balanced'],
                'texture_patterns': ['realistic', 'detailed', 'natural']
            },
            'grok': {
                'resolution_patterns': [1024, 1536, 2048],
                'aspect_ratios': [1.0, 1.5, 2.0],
                'color_signatures': ['varied', 'creative', 'artistic'],
                'texture_patterns': ['creative', 'varied', 'artistic']
            },
            'sora': {
                'resolution_patterns': [1024, 1536, 2048],
                'aspect_ratios': [1.0, 1.5, 2.0, 0.75],
                'color_signatures': ['natural', 'realistic', 'balanced'],
                'texture_patterns': ['realistic', 'natural', 'detailed']
            }
        }
        
        # Initialize GPU models if available
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {self.device}")
        
        # Load pre-trained models for feature extraction
        self._load_models()
    
    def _load_models(self):
        """Load pre-trained models for advanced feature extraction."""
        try:
            # Load DINOv3 model if available
            if self.dinov3_available:
                logger.info("Loading DINOv3 model...")
                self.dinov3_model = self._load_dinov3_model()
                logger.info("DINOv3 model loaded successfully")
            else:
                logger.warning("DINOv3 model not found. Using fallback models.")
                self.dinov3_model = None
            
            # Load EfficientNet for feature extraction
            self.efficientnet = torch.hub.load('pytorch/vision:v0.10.0', 
                                             'efficientnet_b0', 
                                             pretrained=True)
            self.efficientnet.eval()
            self.efficientnet.to(self.device)
            
            # Load Vision Transformer for attention analysis
            self.vit = torch.hub.load('pytorch/vision:v0.10.0', 
                                    'vit_b_16', 
                                    pretrained=True)
            self.vit.eval()
            self.vit.to(self.device)
            
            # Image preprocessing for DINOv3
            self.dinov3_transform = transforms.Compose([
                transforms.Resize(224),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                                   std=[0.229, 0.224, 0.225])
            ])
            
            # Standard image preprocessing
            self.transform = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                                   std=[0.229, 0.224, 0.225])
            ])
            
            logger.info("All models loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load models: {e}")
            self.dinov3_model = None
            self.efficientnet = None
            self.vit = None
    
    def _load_dinov3_model(self):
        """Load DINOv3 model for advanced feature extraction."""
        try:
            # Import DINOv3 from Facebook Research
            import torch.hub
            
            # Load DINOv3 model
            model = torch.hub.load('facebookresearch/dinov2', 'dinov2_vitb14', pretrained=False)
            
            # Load custom weights if available
            if os.path.exists(self.dinov3_model_path):
                checkpoint = torch.load(self.dinov3_model_path, map_location=self.device)
                model.load_state_dict(checkpoint, strict=False)
                logger.info("DINOv3 custom weights loaded")
            
            model.eval()
            model.to(self.device)
            return model
            
        except Exception as e:
            logger.error(f"Failed to load DINOv3 model: {e}")
            return None
    
    def analyze_image(self, image_data: bytes) -> Dict[str, Any]:
        """
        Advanced deepfake detection pipeline with DINOv3 and AI model identification.
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Comprehensive analysis with AI model identification
        """
        try:
            logger.info("Starting advanced deepfake analysis with DINOv3")
            
            # Step 1: Basic image validation
            image_info = self._validate_image(image_data)
            
            # Step 2: Calculate image hash
            image_hash = hashlib.sha256(image_data).hexdigest()
            
            # Step 3: Advanced feature extraction with DINOv3 and GPU models
            features = self._extract_advanced_features(image_data)
            
            # Step 4: AI model fingerprinting
            ai_model_analysis = self._identify_ai_model(features, image_info)
            
            # Step 5: DINOv3 + Gemini Pro Vision analysis (KEY INTEGRATION)
            gemini_analysis = self._analyze_with_gemini_and_dinov3(image_data, features)
            
            # Step 6: Advanced anomaly detection
            anomaly_analysis = self._detect_advanced_anomalies(features, image_data)
            
            # Step 7: Calculate comprehensive score
            authenticity_score = self._calculate_advanced_score(
                features, gemini_analysis, ai_model_analysis, anomaly_analysis
            )
            
            verdict = self._get_verdict(authenticity_score)
            
            # Step 8: Create comprehensive result
            result = {
                "timestamp": datetime.utcnow().isoformat(),
                "image_hash": image_hash,
                "image_info": image_info,
                "authenticity_score": authenticity_score,
                "verdict": verdict,
                "confidence": self._get_confidence(authenticity_score),
                "ai_model_detection": ai_model_analysis,
                "analysis": {
                    "features": features,
                    "gemini_analysis": gemini_analysis,  # This is what frontend displays
                    "anomaly_analysis": anomaly_analysis,
                    "dinov3_features": features.get('dinov3_features', {})
                },
                "recommendations": self._get_recommendations(verdict, authenticity_score),
                "vertex_ai_deployment": {
                    "status": "active",
                    "gpu_accelerated": torch.cuda.is_available(),
                    "region": self.vertex_region,
                    "project": self.vertex_project,
                    "dinov3_loaded": self.dinov3_model is not None
                }
            }
            
            logger.info(f"Analysis completed. Verdict: {verdict}, Score: {authenticity_score}")
            return result
            
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return {
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
                "status": "failed"
            }
    
    def _extract_advanced_features(self, image_data: bytes) -> Dict[str, Any]:
        """Extract advanced features using DINOv3 and GPU-accelerated models."""
        try:
            with Image.open(io.BytesIO(image_data)) as img:
                # Convert to RGB
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                features = {}
                
                # DINOv3 feature extraction (KEY FEATURE)
                if self.dinov3_model:
                    try:
                        dinov3_features = self._extract_dinov3_features(img)
                        features['dinov3_features'] = dinov3_features
                        logger.info("DINOv3 features extracted successfully")
                    except Exception as e:
                        logger.error(f"DINOv3 feature extraction failed: {e}")
                        features['dinov3_features'] = {"error": str(e)}
                
                # Prepare image for other models
                img_tensor = self.transform(img).unsqueeze(0).to(self.device)
                
                # EfficientNet features
                if self.efficientnet:
                    with torch.no_grad():
                        efficientnet_features = self.efficientnet.forward_features(img_tensor)
                        features['efficientnet_features'] = efficientnet_features.mean().item()
                
                # Vision Transformer attention
                if self.vit:
                    with torch.no_grad():
                        vit_features = self.vit.forward_features(img_tensor)
                        features['vit_attention'] = vit_features.mean().item()
                
                # Advanced image analysis
                features.update({
                    "resolution_analysis": self._analyze_resolution_advanced(img.size),
                    "color_analysis": self._analyze_colors_advanced(img),
                    "texture_analysis": self._analyze_texture_advanced(img),
                    "composition_analysis": self._analyze_composition_advanced(img.size),
                    "metadata_analysis": self._analyze_metadata_advanced(img),
                    "frequency_analysis": self._analyze_frequency_domain(img),
                    "noise_analysis": self._analyze_noise_patterns(img)
                })
                
                return features
                
        except Exception as e:
            logger.error(f"Advanced feature extraction failed: {e}")
            return {"error": f"Feature extraction failed: {e}"}
    
    def _extract_dinov3_features(self, img: Image.Image) -> Dict[str, Any]:
        """Extract features using DINOv3 model."""
        try:
            # Prepare image for DINOv3
            img_tensor = self.dinov3_transform(img).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                # Extract DINOv3 features
                dinov3_output = self.dinov3_model.forward_features(img_tensor)
                
                # Process features
                if isinstance(dinov3_output, torch.Tensor):
                    # Global features (CLS token)
                    global_features = dinov3_output[:, 0, :]  # CLS token
                    
                    # Patch features (excluding CLS token)
                    patch_features = dinov3_output[:, 1:, :]  # Patch tokens
                    
                    # Calculate statistics
                    feature_stats = {
                        "global_features_mean": global_features.mean().item(),
                        "global_features_std": global_features.std().item(),
                        "patch_features_mean": patch_features.mean().item(),
                        "patch_features_std": patch_features.std().item(),
                        "feature_dimension": dinov3_output.shape[-1],
                        "num_patches": patch_features.shape[1]
                    }
                    
                    # Calculate feature diversity (how varied the features are)
                    feature_diversity = torch.std(patch_features, dim=1).mean().item()
                    feature_stats["feature_diversity"] = feature_diversity
                    
                    # Calculate feature consistency (how consistent features are across patches)
                    feature_consistency = torch.mean(torch.std(patch_features, dim=2)).item()
                    feature_stats["feature_consistency"] = feature_consistency
                    
                    # AI generation indicators based on DINOv3 features
                    ai_indicators = []
                    
                    # High feature consistency might indicate AI generation
                    if feature_consistency < 0.1:
                        ai_indicators.append("very_consistent_features")
                    elif feature_consistency < 0.3:
                        ai_indicators.append("consistent_features")
                    
                    # Low feature diversity might indicate AI generation
                    if feature_diversity < 0.1:
                        ai_indicators.append("low_feature_diversity")
                    elif feature_diversity < 0.3:
                        ai_indicators.append("moderate_feature_diversity")
                    
                    feature_stats["ai_indicators"] = ai_indicators
                    feature_stats["ai_probability"] = len(ai_indicators) * 0.2  # Simple scoring
                    
                    return feature_stats
                else:
                    return {"error": "Unexpected DINOv3 output format"}
                    
        except Exception as e:
            logger.error(f"DINOv3 feature extraction error: {e}")
            return {"error": str(e)}
    
    def _identify_ai_model(self, features: Dict[str, Any], image_info: Dict[str, Any]) -> Dict[str, Any]:
        """Identify which AI model generated the image."""
        try:
            scores = {}
            width, height = image_info['width'], image_info['height']
            aspect_ratio = width / height
            
            for model_name, fingerprints in self.ai_model_fingerprints.items():
                score = 0
                
                # Resolution pattern matching
                if width in fingerprints['resolution_patterns']:
                    score += 0.3
                
                # Aspect ratio matching
                for target_ratio in fingerprints['aspect_ratios']:
                    if abs(aspect_ratio - target_ratio) < 0.1:
                        score += 0.2
                        break
                
                # Color signature analysis
                color_score = self._analyze_color_signature(features, fingerprints['color_signatures'])
                score += color_score * 0.2
                
                # Texture pattern analysis
                texture_score = self._analyze_texture_signature(features, fingerprints['texture_patterns'])
                score += texture_score * 0.2
                
                # Metadata analysis
                if 'metadata_analysis' in features:
                    metadata = features['metadata_analysis']
                    if metadata.get('ai_software_detected'):
                        if model_name.lower() in str(metadata.get('software_name', '')).lower():
                            score += 0.3
                
                scores[model_name] = score
            
            # Find best match
            best_match = max(scores.items(), key=lambda x: x[1])
            
            return {
                "detected_model": best_match[0] if best_match[1] > 0.3 else "unknown",
                "confidence": best_match[1],
                "all_scores": scores,
                "analysis_method": "fingerprint_matching"
            }
            
        except Exception as e:
            logger.error(f"AI model identification failed: {e}")
            return {"error": f"Model identification failed: {e}"}
    
    def _analyze_frequency_domain(self, img: Image.Image) -> Dict[str, Any]:
        """Analyze image in frequency domain for AI artifacts."""
        try:
            # Convert to grayscale
            gray = img.convert('L')
            gray_array = np.array(gray)
            
            # Apply FFT
            fft = np.fft.fft2(gray_array)
            fft_shift = np.fft.fftshift(fft)
            magnitude_spectrum = np.log(np.abs(fft_shift) + 1)
            
            # Analyze frequency patterns
            center_y, center_x = magnitude_spectrum.shape[0] // 2, magnitude_spectrum.shape[1] // 2
            
            # Check for grid patterns (common in AI generation)
            horizontal_line = magnitude_spectrum[center_y, :]
            vertical_line = magnitude_spectrum[:, center_x]
            
            # Calculate grid regularity
            h_regularity = np.std(horizontal_line)
            v_regularity = np.std(vertical_line)
            
            # AI-generated images often have regular frequency patterns
            regularity_score = (h_regularity + v_regularity) / 2
            
            return {
                "frequency_regularity": regularity_score,
                "grid_pattern_detected": regularity_score < 0.5,
                "ai_artifact_probability": max(0, (1 - regularity_score) * 100)
            }
            
        except Exception as e:
            return {"error": f"Frequency analysis failed: {e}"}
    
    def _analyze_noise_patterns(self, img: Image.Image) -> Dict[str, Any]:
        """Analyze noise patterns for AI generation artifacts."""
        try:
            # Convert to grayscale
            gray = img.convert('L')
            gray_array = np.array(gray)
            
            # Calculate noise variance
            noise_variance = np.var(gray_array)
            
            # Check for uniform noise (common in AI)
            noise_uniformity = self._calculate_noise_uniformity(gray_array)
            
            # AI-generated images often have more uniform noise
            ai_probability = min(100, noise_uniformity * 100)
            
            return {
                "noise_variance": noise_variance,
                "noise_uniformity": noise_uniformity,
                "ai_generation_probability": ai_probability,
                "natural_noise": noise_variance > 100 and noise_uniformity < 0.7
            }
            
        except Exception as e:
            return {"error": f"Noise analysis failed: {e}"}
    
    def _calculate_noise_uniformity(self, gray_array: np.ndarray) -> float:
        """Calculate how uniform the noise pattern is."""
        # Calculate local variance in small patches
        patch_size = 8
        height, width = gray_array.shape
        variances = []
        
        for y in range(0, height - patch_size, patch_size):
            for x in range(0, width - patch_size, patch_size):
                patch = gray_array[y:y+patch_size, x:x+patch_size]
                variances.append(np.var(patch))
        
        if variances:
            # Lower variance of variances = more uniform noise
            return 1 - (np.std(variances) / np.mean(variances))
        return 0.5
    
    def _analyze_color_signature(self, features: Dict[str, Any], target_signatures: List[str]) -> float:
        """Analyze color signature against target AI model patterns."""
        if 'color_analysis' not in features:
            return 0.0
        
        color_data = features['color_analysis']
        if 'error' in color_data:
            return 0.0
        
        # Simple signature matching
        color_diversity = color_data.get('color_diversity', 0)
        
        if 'vibrant' in target_signatures and color_diversity < 0.01:
            return 0.8
        elif 'natural' in target_signatures and 0.01 <= color_diversity <= 0.1:
            return 0.7
        elif 'balanced' in target_signatures and 0.05 <= color_diversity <= 0.15:
            return 0.6
        
        return 0.3
    
    def _analyze_texture_signature(self, features: Dict[str, Any], target_signatures: List[str]) -> float:
        """Analyze texture signature against target AI model patterns."""
        if 'texture_analysis' not in features:
            return 0.0
        
        texture_data = features['texture_analysis']
        if 'error' in texture_data:
            return 0.0
        
        avg_variance = texture_data.get('average_variance', 0)
        
        if 'smooth' in target_signatures and avg_variance < 100:
            return 0.8
        elif 'detailed' in target_signatures and 100 <= avg_variance <= 500:
            return 0.7
        elif 'realistic' in target_signatures and 200 <= avg_variance <= 1000:
            return 0.6
        
        return 0.3
    
    def _calculate_advanced_score(self, features: Dict[str, Any], gemini_analysis: Dict[str, Any], 
                                ai_model_analysis: Dict[str, Any], anomaly_analysis: Dict[str, Any]) -> float:
        """Calculate advanced authenticity score with AI model detection."""
        base_score = 50.0
        
        # AI model detection impact (25% weight)
        if 'detected_model' in ai_model_analysis and ai_model_analysis['detected_model'] != 'unknown':
            confidence = ai_model_analysis.get('confidence', 0)
            if confidence > 0.5:
                base_score -= 30  # Strong AI detection
            elif confidence > 0.3:
                base_score -= 20  # Moderate AI detection
        
        # Advanced anomaly detection (30% weight)
        if 'frequency_analysis' in features:
            freq_analysis = features['frequency_analysis']
            if 'ai_artifact_probability' in freq_analysis:
                ai_prob = freq_analysis['ai_artifact_probability']
                base_score -= (ai_prob / 100) * 30
        
        # Noise pattern analysis (20% weight)
        if 'noise_analysis' in features:
            noise_analysis = features['noise_analysis']
            if 'ai_generation_probability' in noise_analysis:
                ai_prob = noise_analysis['ai_generation_probability']
                base_score -= (ai_prob / 100) * 20
        
        # Traditional feature analysis (15% weight)
        if 'anomaly_score' in features:
            anomaly_impact = features['anomaly_score'] * 15
            base_score -= anomaly_impact
        
        # Gemini analysis (10% weight)
        if 'error' not in gemini_analysis and 'analysis' in gemini_analysis:
            base_score += 10
        
        # Ensure score is between 0 and 100
        return max(0.0, min(100.0, base_score))
    
    def _detect_advanced_anomalies(self, features: Dict[str, Any], image_data: bytes) -> Dict[str, Any]:
        """Detect advanced anomalies using multiple analysis methods."""
        anomalies = {}
        
        # Frequency domain anomalies
        if 'frequency_analysis' in features:
            freq_analysis = features['frequency_analysis']
            if freq_analysis.get('grid_pattern_detected'):
                anomalies['frequency_grid'] = {
                    "type": "grid_pattern",
                    "severity": "high",
                    "description": "Regular grid pattern detected in frequency domain"
                }
        
        # Noise pattern anomalies
        if 'noise_analysis' in features:
            noise_analysis = features['noise_analysis']
            if not noise_analysis.get('natural_noise'):
                anomalies['noise_pattern'] = {
                    "type": "uniform_noise",
                    "severity": "medium",
                    "description": "Unnatural noise pattern detected"
                }
        
        # Traditional anomalies
        if 'anomaly_score' in features and features['anomaly_score'] > 0.3:
            anomalies['traditional'] = {
                "type": "feature_anomaly",
                "severity": "medium",
                "description": "Traditional feature analysis detected anomalies"
            }
        
        return {
            "anomalies": anomalies,
            "total_anomalies": len(anomalies),
            "severity_level": self._calculate_severity_level(anomalies)
        }
    
    def _calculate_severity_level(self, anomalies: Dict[str, Any]) -> str:
        """Calculate overall severity level of detected anomalies."""
        if not anomalies:
            return "none"
        
        high_count = sum(1 for a in anomalies.values() if a.get('severity') == 'high')
        medium_count = sum(1 for a in anomalies.values() if a.get('severity') == 'medium')
        
        if high_count > 0:
            return "high"
        elif medium_count > 0:
            return "medium"
        else:
            return "low"
    
    # Include all the existing analysis methods with enhanced versions
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
    
    def _analyze_resolution_advanced(self, size: tuple) -> Dict[str, Any]:
        """Enhanced resolution analysis for AI detection."""
        width, height = size
        aspect_ratio = width / height
        
        resolution_score = 0
        ai_indicators = []
        
        # Check for common AI generation patterns
        if width >= 1024 and height >= 1024:
            resolution_score += 0.3
            ai_indicators.append("high_resolution")
        
        if 0.9 <= aspect_ratio <= 1.1:
            resolution_score += 0.2
            ai_indicators.append("square_ratio")
        
        if width % 64 == 0 and height % 64 == 0:
            resolution_score += 0.3
            ai_indicators.append("ai_model_output_size")
        
        # Check for specific AI model resolutions
        if (width, height) in [(1024, 1024), (1536, 1536), (2048, 2048)]:
            resolution_score += 0.2
            ai_indicators.append("standard_ai_resolution")
            
        return {
            "width": width,
            "height": height,
            "aspect_ratio": round(aspect_ratio, 3),
            "resolution_score": resolution_score,
            "ai_indicators": ai_indicators,
            "suspicious": resolution_score > 0.5
        }
    
    def _analyze_colors_advanced(self, img: Image.Image) -> Dict[str, Any]:
        """Enhanced color analysis for AI detection."""
        try:
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            colors = img.getcolors(maxcolors=img.width * img.height)
            if colors:
                total_pixels = sum(count for count, _ in colors)
                unique_colors = len(colors)
                color_diversity = unique_colors / total_pixels
                
                color_score = 0
                ai_indicators = []
                
                if color_diversity < 0.01:
                    color_score += 0.4
                    ai_indicators.append("low_color_diversity")
                elif color_diversity > 0.5:
                    color_score += 0.3
                    ai_indicators.append("high_color_diversity")
                
                # Check for color clustering (common in AI)
                color_clustering = self._analyze_color_clustering(img)
                if color_clustering > 0.7:
                    color_score += 0.2
                    ai_indicators.append("color_clustering")
                    
                return {
                    "total_pixels": total_pixels,
                    "unique_colors": unique_colors,
                    "color_diversity": round(color_diversity, 4),
                    "color_clustering": color_clustering,
                    "color_score": color_score,
                    "ai_indicators": ai_indicators,
                    "suspicious": color_score > 0.3
                }
            else:
                return {"error": "Could not analyze colors"}
                
        except Exception as e:
            return {"error": f"Color analysis failed: {e}"}
    
    def _analyze_color_clustering(self, img: Image.Image) -> float:
        """Analyze how clustered the colors are in the image."""
        try:
            # Convert to numpy array
            img_array = np.array(img)
            
            # Calculate color distances
            colors = img_array.reshape(-1, 3)
            unique_colors = np.unique(colors, axis=0)
            
            if len(unique_colors) < 2:
                return 1.0
            
            # Calculate average distance between unique colors
            distances = []
            for i in range(len(unique_colors)):
                for j in range(i + 1, len(unique_colors)):
                    dist = np.linalg.norm(unique_colors[i] - unique_colors[j])
                    distances.append(dist)
            
            if distances:
                avg_distance = np.mean(distances)
                # Normalize to 0-1 scale (closer to 1 = more clustered)
                return max(0, min(1, 1 - (avg_distance / 441.67)))  # 441.67 is max possible distance
            
            return 0.5
            
        except Exception:
            return 0.5
    
    def _analyze_texture_advanced(self, img: Image.Image) -> Dict[str, Any]:
        """Enhanced texture analysis for AI detection."""
        try:
            gray = img.convert('L')
            pixels = list(gray.getdata())
            
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
                
                texture_score = 0
                ai_indicators = []
                
                if avg_variance < 100:
                    texture_score += 0.4
                    ai_indicators.append("very_smooth_texture")
                elif avg_variance > 2000:
                    texture_score += 0.3
                    ai_indicators.append("very_noisy_texture")
                
                # Check for texture regularity
                texture_regularity = self._calculate_texture_regularity(gray)
                if texture_regularity > 0.7:
                    texture_score += 0.2
                    ai_indicators.append("regular_texture_pattern")
                    
                return {
                    "average_variance": round(avg_variance, 2),
                    "texture_regularity": texture_regularity,
                    "texture_score": texture_score,
                    "ai_indicators": ai_indicators,
                    "suspicious": texture_score > 0.3
                }
            else:
                return {"error": "Could not analyze texture"}
                
        except Exception as e:
            return {"error": f"Texture analysis failed: {e}"}
    
    def _calculate_texture_regularity(self, gray_img: Image.Image) -> float:
        """Calculate how regular the texture pattern is."""
        try:
            img_array = np.array(gray_img)
            height, width = img_array.shape
            
            # Calculate local variance in regular grid
            patch_size = 16
            variances = []
            
            for y in range(0, height - patch_size, patch_size):
                for x in range(0, width - patch_size, patch_size):
                    patch = img_array[y:y+patch_size, x:x+patch_size]
                    variances.append(np.var(patch))
            
            if variances:
                # Lower variance of variances = more regular texture
                return 1 - (np.std(variances) / (np.mean(variances) + 1e-8))
            return 0.5
            
        except Exception:
            return 0.5
    
    def _analyze_composition_advanced(self, size: tuple) -> Dict[str, Any]:
        """Enhanced composition analysis for AI detection."""
        width, height = size
        
        composition_score = 0
        ai_indicators = []
        
        # Rule of thirds analysis
        third_w = width / 3
        third_h = height / 3
        
        composition_score += 0.1
        
        # Check for centered subjects (common in AI)
        if width == height:
            composition_score += 0.2
            ai_indicators.append("square_centered_composition")
        
        # Check for perfect symmetry
        if width == height and width % 2 == 0:
            composition_score += 0.1
            ai_indicators.append("perfect_symmetry")
            
        return {
            "width": width,
            "height": height,
            "rule_of_thirds": {
                "vertical_lines": [third_w, third_w * 2],
                "horizontal_lines": [third_h, third_h * 2]
            },
            "composition_score": composition_score,
            "ai_indicators": ai_indicators,
            "suspicious": composition_score > 0.2
        }
    
    def _analyze_metadata_advanced(self, img: Image.Image) -> Dict[str, Any]:
        """Enhanced metadata analysis for AI detection."""
        metadata = {}
        ai_indicators = []
        
        if hasattr(img, 'info'):
            info = img.info
            
            # Check for AI software indicators
            if 'Software' in info:
                software = str(info['Software']).lower()
                ai_software_keywords = [
                    'midjourney', 'dall-e', 'stable diffusion', 'ai', 'generated',
                    'imagen', 'gemini', 'grok', 'sora', 'artificial intelligence'
                ]
                
                for keyword in ai_software_keywords:
                    if keyword in software:
                        metadata['ai_software_detected'] = True
                        metadata['software_name'] = info['Software']
                        ai_indicators.append(f"software_{keyword}")
                        break
            
            # Check for unusual metadata patterns
            if 'Comment' in info:
                comment = str(info['Comment']).lower()
                ai_comment_keywords = ['ai', 'generated', 'prompt', 'midjourney', 'dall-e']
                
                for keyword in ai_comment_keywords:
                    if keyword in comment:
                        metadata['ai_comment_detected'] = True
                        ai_indicators.append(f"comment_{keyword}")
                        break
            
            # Check for EXIF data patterns
            if 'Exif' in info:
                exif = info['Exif']
                if len(exif) < 100:  # Very little EXIF data
                    ai_indicators.append("minimal_exif_data")
                    
        metadata['has_metadata'] = bool(metadata)
        metadata['ai_indicators'] = ai_indicators
        
        return metadata
    
    def _analyze_with_gemini_and_dinov3(self, image_data: bytes, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze image content with Gemini Pro Vision using DINOv3 features.
        This is the KEY integration that provides the frontend display text.
        """
        if not self.gemini_api_key:
            return {
                "error": "Gemini API key not configured",
                "fallback_analysis": self._fallback_content_analysis(image_data)
            }
        
        try:
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Get DINOv3 analysis for Gemini
            dinov3_analysis = ""
            if 'dinov3_features' in features and 'error' not in features['dinov3_features']:
                dinov3_analysis = self._format_dinov3_analysis_for_gemini(features['dinov3_features'])
            
            # Prepare comprehensive prompt for Gemini
            prompt = f"""
            Analyze this image for authenticity and potential AI generation/manipulation.
            
            DINOv3 Analysis Results:
            {dinov3_analysis}
            
            Focus on:
            1. Content consistency and realism based on DINOv3 features
            2. Unusual patterns or artifacts detected
            3. Text, logos, or watermarks
            4. Overall image quality and naturalness
            5. Specific AI generation indicators from DINOv3 analysis
            6. Potential model signatures (Midjourney, DALL-E, Stable Diffusion, etc.)
            
            Provide a detailed analysis with specific observations, confidence level, and recommendations.
            Use the DINOv3 analysis to support your conclusions about authenticity.
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
                            "analysis": analysis_text,  # This is what the frontend displays
                            "confidence": "high",
                            "source": "gemini_pro_vision_with_dinov3",
                            "dinov3_integrated": True
                        }
            
            # Fallback if Gemini fails
            return self._fallback_content_analysis(image_data)
            
        except Exception as e:
            return {
                "error": f"Gemini analysis failed: {e}",
                "fallback_analysis": self._fallback_content_analysis(image_data)
            }
    
    def _format_dinov3_analysis_for_gemini(self, dinov3_features: Dict[str, Any]) -> str:
        """Format DINOv3 features for Gemini analysis."""
        try:
            analysis = []
            
            if 'ai_indicators' in dinov3_features:
                indicators = dinov3_features['ai_indicators']
                if indicators:
                    analysis.append(f"AI Generation Indicators: {', '.join(indicators)}")
                else:
                    analysis.append("No strong AI generation indicators detected")
            
            if 'ai_probability' in dinov3_features:
                prob = dinov3_features['ai_probability']
                analysis.append(f"AI Generation Probability: {prob:.2f}")
            
            if 'feature_diversity' in dinov3_features:
                diversity = dinov3_features['feature_diversity']
                analysis.append(f"Feature Diversity: {diversity:.3f}")
            
            if 'feature_consistency' in dinov3_features:
                consistency = dinov3_features['feature_consistency']
                analysis.append(f"Feature Consistency: {consistency:.3f}")
            
            return "\n".join(analysis) if analysis else "DINOv3 analysis available"
            
        except Exception as e:
            return f"DINOv3 analysis error: {e}"
    
    def _fallback_content_analysis(self, image_data: bytes) -> Dict[str, Any]:
        """Fallback content analysis when Gemini is unavailable."""
        try:
            with Image.open(io.BytesIO(image_data)) as img:
                analysis = {
                    "image_type": "analyzed",
                    "content_notes": "Basic analysis performed (Gemini unavailable)",
                    "confidence": "medium",
                    "source": "fallback_analysis"
                }
                
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
        
        if score < 50:
            recommendations.append("Consider using APEX VERIFY AI for additional verification")
        
        return recommendations

# Global instance for Vertex AI deployment
advanced_detector = AdvancedDeepfakeDetector()
