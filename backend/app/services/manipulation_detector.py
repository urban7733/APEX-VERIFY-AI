import cv2
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
import io
import time
from typing import Dict, List, Any
from loguru import logger
from app.models.response_models import ManipulationArea

class ManipulationDetector:
    """Detect image manipulation using multiple techniques"""
    
    def __init__(self):
        self.ela_quality = 90
        self.threshold = 15
    
    async def analyze(self, image_path: str) -> Dict[str, Any]:
        """
        Comprehensive manipulation analysis
        
        Args:
            image_path: Path to image file
            
        Returns:
            Dictionary with manipulation analysis results
        """
        start_time = time.time()
        
        try:
            # Load image
            img = Image.open(image_path)
            cv_img = cv2.imread(image_path)
            
            # 1. ELA (Error Level Analysis)
            ela_score, ela_map = await self._error_level_analysis(img)
            
            # 2. Frequency Domain Analysis
            freq_analysis = await self._frequency_analysis(cv_img)
            
            # 3. Noise Analysis
            noise_score = await self._noise_analysis(cv_img)
            
            # 4. Detect manipulation areas
            manipulation_areas = await self._detect_manipulation_areas(ela_map)
            
            # Calculate overall confidence
            # IMPORTANT: These scores indicate SUSPICION, not manipulation
            # Real photos typically have low values (< 0.3)
            # Only high values (> 0.7) indicate actual manipulation
            confidence = (ela_score * 0.4 + freq_analysis['score'] * 0.3 + noise_score * 0.3)
            
            # CORRECTED THRESHOLD: Real photos score 0.2-0.4, manipulated photos score 0.7+
            is_manipulated = confidence > 0.70  # Much higher threshold!
            
            # Determine manipulation type
            manipulation_type = None
            if is_manipulated:
                if ela_score > 0.85:  # Very high ELA = likely AI
                    manipulation_type = "ai_generated"
                elif freq_analysis['score'] > 0.75:  # High freq anomaly = splice
                    manipulation_type = "splice"
                else:
                    manipulation_type = "clone"
            
            processing_time = time.time() - start_time
            
            # Return confidence properly:
            # If manipulated: confidence = how sure we are it's manipulated
            # If NOT manipulated: confidence = how sure we are it's authentic
            final_confidence = confidence if is_manipulated else (1.0 - confidence)
            
            logger.info(f"📊 Manipulation score: {confidence:.2f}, is_manipulated: {is_manipulated}, confidence: {final_confidence:.2f}")
            
            return {
                'is_manipulated': is_manipulated,
                'confidence': float(final_confidence),  # Properly oriented confidence
                'type': manipulation_type,
                'ela_score': float(ela_score),
                'frequency_analysis': freq_analysis,
                'noise_score': float(noise_score),
                'areas': manipulation_areas,
                'processing_time': float(processing_time)
            }
            
        except Exception as e:
            logger.error(f"❌ Manipulation detection failed: {str(e)}")
            raise
    
    async def _error_level_analysis(self, image: Image.Image) -> tuple:
        """
        Perform Error Level Analysis (ELA)
        
        ELA detects differences in compression levels across image areas.
        Manipulated areas often have different compression artifacts.
        """
        try:
            # Save image with known quality
            tmp_buffer = io.BytesIO()
            image.save(tmp_buffer, 'JPEG', quality=self.ela_quality)
            tmp_buffer.seek(0)
            
            # Reload compressed image
            compressed_img = Image.open(tmp_buffer)
            
            # Calculate difference
            ela_img = ImageChops.difference(image.convert('RGB'), compressed_img.convert('RGB'))
            
            # Enhance for visualization
            extrema = ela_img.getextrema()
            max_diff = max([ex[1] for ex in extrema])
            
            if max_diff == 0:
                max_diff = 1
            
            scale = 255.0 / max_diff
            ela_img = ImageEnhance.Brightness(ela_img).enhance(scale)
            
            # Convert to numpy for analysis
            ela_array = np.array(ela_img)
            
            # Calculate ELA score
            mean_ela = np.mean(ela_array)
            ela_score = min(mean_ela / 50.0, 1.0)  # Normalize to 0-1
            
            return ela_score, ela_array
            
        except Exception as e:
            logger.error(f"❌ ELA failed: {str(e)}")
            return 0.0, np.zeros((100, 100, 3))
    
    async def _frequency_analysis(self, image: np.ndarray) -> Dict[str, float]:
        """
        Analyze frequency domain for manipulation detection
        
        Spliced/manipulated areas often have different frequency characteristics
        """
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply FFT
            f_transform = np.fft.fft2(gray)
            f_shift = np.fft.fftshift(f_transform)
            magnitude_spectrum = np.abs(f_shift)
            
            # Analyze high and low frequencies
            rows, cols = gray.shape
            crow, ccol = rows // 2, cols // 2
            
            # High frequency (edges, details)
            high_freq_mask = np.ones((rows, cols))
            r = 30
            center = [crow, ccol]
            x, y = np.ogrid[:rows, :cols]
            mask_area = (x - center[0])**2 + (y - center[1])**2 <= r*r
            high_freq_mask[mask_area] = 0
            
            high_freq_energy = np.sum(magnitude_spectrum * high_freq_mask)
            total_energy = np.sum(magnitude_spectrum)
            
            high_freq_ratio = high_freq_energy / total_energy if total_energy > 0 else 0
            
            # Score based on frequency distribution
            # Manipulated images often have unusual frequency distributions
            freq_score = abs(high_freq_ratio - 0.5) * 2  # Normalize
            
            return {
                'score': float(min(freq_score, 1.0)),
                'high_freq': float(high_freq_ratio),
                'low_freq': float(1 - high_freq_ratio)
            }
            
        except Exception as e:
            logger.error(f"❌ Frequency analysis failed: {str(e)}")
            return {'score': 0.0, 'high_freq': 0.5, 'low_freq': 0.5}
    
    async def _noise_analysis(self, image: np.ndarray) -> float:
        """
        Analyze noise patterns for inconsistencies
        
        Genuine photos have consistent noise, manipulated ones don't
        """
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply Gaussian blur
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Calculate noise as difference
            noise = cv2.absdiff(gray, blurred)
            
            # Divide image into blocks and analyze noise variance
            h, w = noise.shape
            block_size = 32
            variances = []
            
            for i in range(0, h - block_size, block_size):
                for j in range(0, w - block_size, block_size):
                    block = noise[i:i+block_size, j:j+block_size]
                    variances.append(np.var(block))
            
            # Inconsistent noise variance suggests manipulation
            if len(variances) > 0:
                variance_std = np.std(variances)
                noise_score = min(variance_std / 100.0, 1.0)
            else:
                noise_score = 0.0
            
            return float(noise_score)
            
        except Exception as e:
            logger.error(f"❌ Noise analysis failed: {str(e)}")
            return 0.0
    
    async def _detect_manipulation_areas(self, ela_map: np.ndarray) -> List[ManipulationArea]:
        """
        Detect specific areas of manipulation
        """
        try:
            areas = []
            
            # Convert to grayscale if needed
            if len(ela_map.shape) == 3:
                ela_gray = cv2.cvtColor(ela_map.astype(np.uint8), cv2.COLOR_RGB2GRAY)
            else:
                ela_gray = ela_map.astype(np.uint8)
            
            # Threshold to find suspicious areas
            _, thresh = cv2.threshold(ela_gray, 30, 255, cv2.THRESH_BINARY)
            
            # Find contours
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Filter and create ManipulationArea objects
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > 1000:  # Minimum area threshold
                    x, y, w, h = cv2.boundingRect(contour)
                    
                    # Calculate score for this region
                    region_score = np.mean(ela_gray[y:y+h, x:x+w]) / 255.0
                    
                    manipulation_area = ManipulationArea(
                        region=[float(x), float(y), float(x+w), float(y+h)],
                        score=float(region_score),
                        type='suspicious'
                    )
                    areas.append(manipulation_area)
            
            return areas
            
        except Exception as e:
            logger.error(f"❌ Area detection failed: {str(e)}")
            return []
