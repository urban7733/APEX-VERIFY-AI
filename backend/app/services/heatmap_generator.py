import cv2
import numpy as np
from PIL import Image, ImageChops
import io
import base64
from typing import Dict
from loguru import logger

class HeatmapGenerator:
    """Generate visualization heatmaps for manipulation detection"""
    
    def __init__(self):
        self.ela_quality = 90
    
    async def generate(self, image_path: str) -> Dict[str, str]:
        """
        Generate manipulation heatmap
        
        Args:
            image_path: Path to image file
            
        Returns:
            Dictionary with heatmap data (base64 and URL)
        """
        try:
            # Load image
            original = Image.open(image_path)
            cv_img = cv2.imread(image_path)
            
            # Generate ELA heatmap
            ela_heatmap = await self._generate_ela_heatmap(original)
            
            # Overlay on original
            heatmap_overlay = await self._create_overlay(cv_img, ela_heatmap)
            
            # Convert to base64
            heatmap_base64 = await self._image_to_base64(heatmap_overlay)
            
            logger.info("🗺️ Heatmap generated successfully")
            
            return {
                'base64': heatmap_base64,
                'url': None  # Can add cloud storage URL here later
            }
            
        except Exception as e:
            logger.error(f"❌ Heatmap generation failed: {str(e)}")
            # Return a blank heatmap
            blank = np.zeros((100, 100, 3), dtype=np.uint8)
            return {
                'base64': await self._image_to_base64(blank),
                'url': None
            }
    
    async def _generate_ela_heatmap(self, image: Image.Image) -> np.ndarray:
        """Generate ELA-based heatmap"""
        try:
            # Save with known quality
            tmp_buffer = io.BytesIO()
            image.save(tmp_buffer, 'JPEG', quality=self.ela_quality)
            tmp_buffer.seek(0)
            
            # Reload
            compressed = Image.open(tmp_buffer)
            
            # Calculate difference
            ela = ImageChops.difference(image.convert('RGB'), compressed.convert('RGB'))
            
            # Convert to numpy
            ela_array = np.array(ela)
            
            # Convert to grayscale for heatmap
            if len(ela_array.shape) == 3:
                ela_gray = np.mean(ela_array, axis=2)
            else:
                ela_gray = ela_array
            
            # Normalize
            ela_normalized = cv2.normalize(ela_gray, None, 0, 255, cv2.NORM_MINMAX)
            ela_normalized = ela_normalized.astype(np.uint8)
            
            # Apply color map (heatmap style)
            heatmap = cv2.applyColorMap(ela_normalized, cv2.COLORMAP_JET)
            
            return heatmap
            
        except Exception as e:
            logger.error(f"❌ ELA heatmap generation failed: {str(e)}")
            return np.zeros((100, 100, 3), dtype=np.uint8)
    
    async def _create_overlay(self, original: np.ndarray, heatmap: np.ndarray) -> np.ndarray:
        """Create overlay of heatmap on original image"""
        try:
            # Resize heatmap to match original if needed
            if original.shape[:2] != heatmap.shape[:2]:
                heatmap = cv2.resize(heatmap, (original.shape[1], original.shape[0]))
            
            # Blend images (70% original, 30% heatmap)
            overlay = cv2.addWeighted(original, 0.7, heatmap, 0.3, 0)
            
            # Add legend
            overlay = await self._add_legend(overlay)
            
            return overlay
            
        except Exception as e:
            logger.error(f"❌ Overlay creation failed: {str(e)}")
            return original
    
    async def _add_legend(self, image: np.ndarray) -> np.ndarray:
        """Add color legend to heatmap"""
        try:
            h, w = image.shape[:2]
            
            # Create legend bar
            legend_width = 30
            legend_height = 200
            legend = np.zeros((legend_height, legend_width, 3), dtype=np.uint8)
            
            # Fill legend with gradient
            for i in range(legend_height):
                color_value = int(255 * (1 - i / legend_height))
                legend[i, :] = cv2.applyColorMap(np.array([[color_value]], dtype=np.uint8), cv2.COLORMAP_JET)[0][0]
            
            # Add border
            legend = cv2.copyMakeBorder(legend, 2, 2, 2, 2, cv2.BORDER_CONSTANT, value=(255, 255, 255))
            
            # Position legend in top right corner
            margin = 20
            legend_x = w - legend_width - margin - 4
            legend_y = margin
            
            # Overlay legend on image
            image[legend_y:legend_y+legend_height+4, legend_x:legend_x+legend_width+4] = legend
            
            # Add text labels
            cv2.putText(image, 'High', (legend_x - 45, legend_y + 15), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1, cv2.LINE_AA)
            cv2.putText(image, 'Low', (legend_x - 40, legend_y + legend_height), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1, cv2.LINE_AA)
            
            return image
            
        except Exception as e:
            logger.error(f"❌ Legend addition failed: {str(e)}")
            return image
    
    async def _image_to_base64(self, image: np.ndarray) -> str:
        """Convert numpy image to base64 string"""
        try:
            # Convert BGR to RGB
            if len(image.shape) == 3 and image.shape[2] == 3:
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            else:
                image_rgb = image
            
            # Convert to PIL Image
            pil_image = Image.fromarray(image_rgb)
            
            # Save to buffer
            buffer = io.BytesIO()
            pil_image.save(buffer, format='PNG')
            buffer.seek(0)
            
            # Encode to base64
            img_base64 = base64.b64encode(buffer.read()).decode('utf-8')
            
            return f"data:image/png;base64,{img_base64}"
            
        except Exception as e:
            logger.error(f"❌ Base64 conversion failed: {str(e)}")
            return ""
