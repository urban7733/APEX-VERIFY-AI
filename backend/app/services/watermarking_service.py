import os
import logging
from typing import Dict, Any, Optional, Tuple
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
import io
import base64

logger = logging.getLogger(__name__)

class WatermarkingService:
    """
    Glassmorphism Watermarking Service for APEX VERIFY AI
    Adds professional watermarks to verified content (≥95% authenticity)
    """
    
    def __init__(self):
        self.watermark_logo_path = os.getenv('WATERMARK_LOGO_PATH', 'public/apex-verify-seal.png')
        self.font_path = os.getenv('WATERMARK_FONT_PATH', None)  # Optional custom font
        logger.info("Initializing Watermarking Service")
    
    def add_watermark(self, image: Image.Image, authenticity_score: float, 
                     verification_data: Dict[str, Any]) -> Tuple[Image.Image, str]:
        """
        Add glassmorphism watermark to verified image
        
        Args:
            image: PIL Image object
            authenticity_score: Authenticity score (0-100)
            verification_data: Verification metadata
            
        Returns:
            Tuple of (watermarked_image, base64_encoded_image)
        """
        try:
            # Only watermark if authenticity score is high enough
            if authenticity_score < 95:
                logger.info(f"Authenticity score {authenticity_score}% too low for watermarking")
                return image, self._image_to_base64(image)
            
            # Create watermarked version
            watermarked_image = self._create_glassmorphism_watermark(
                image, authenticity_score, verification_data
            )
            
            # Convert to base64 for download
            base64_image = self._image_to_base64(watermarked_image)
            
            logger.info(f"Watermark added successfully for {authenticity_score}% authentic image")
            return watermarked_image, base64_image
            
        except Exception as e:
            logger.error(f"Watermarking failed: {e}")
            return image, self._image_to_base64(image)
    
    def _create_glassmorphism_watermark(self, image: Image.Image, 
                                      authenticity_score: float,
                                      verification_data: Dict[str, Any]) -> Image.Image:
        """
        Create glassmorphism watermark effect
        
        Args:
            image: Original image
            authenticity_score: Authenticity score
            verification_data: Verification metadata
            
        Returns:
            Watermarked image
        """
        # Create a copy to work with
        watermarked = image.copy()
        
        # Get image dimensions
        width, height = watermarked.size
        
        # Create watermark overlay
        overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Watermark position (bottom right)
        watermark_width = min(width // 4, 300)
        watermark_height = min(height // 6, 120)
        
        # Calculate position
        x = width - watermark_width - 20
        y = height - watermark_height - 20
        
        # Create glassmorphism background
        self._draw_glassmorphism_background(draw, x, y, watermark_width, watermark_height)
        
        # Add verification seal/logo
        self._add_verification_seal(overlay, x, y, watermark_width, watermark_height)
        
        # Add authenticity score
        self._add_authenticity_score(draw, x, y, watermark_width, watermark_height, authenticity_score)
        
        # Add verification timestamp
        self._add_verification_timestamp(draw, x, y, watermark_width, watermark_height, verification_data)
        
        # Add APEX VERIFY branding
        self._add_branding(draw, x, y, watermark_width, watermark_height)
        
        # Apply glassmorphism effect
        overlay = self._apply_glassmorphism_effect(overlay)
        
        # Composite the watermark onto the original image
        if watermarked.mode != 'RGBA':
            watermarked = watermarked.convert('RGBA')
        
        watermarked = Image.alpha_composite(watermarked, overlay)
        
        return watermarked.convert('RGB')
    
    def _draw_glassmorphism_background(self, draw: ImageDraw.Draw, x: int, y: int, 
                                     width: int, height: int) -> None:
        """
        Draw glassmorphism background
        
        Args:
            draw: ImageDraw object
            x, y: Position coordinates
            width, height: Dimensions
        """
        # Create rounded rectangle with glassmorphism effect
        corner_radius = 15
        
        # Background with transparency
        draw.rounded_rectangle(
            [x, y, x + width, y + height],
            radius=corner_radius,
            fill=(255, 255, 255, 30)  # Semi-transparent white
        )
        
        # Border with glassmorphism effect
        draw.rounded_rectangle(
            [x, y, x + width, y + height],
            radius=corner_radius,
            outline=(255, 255, 255, 100),
            width=2
        )
        
        # Inner highlight
        draw.rounded_rectangle(
            [x + 2, y + 2, x + width - 2, y + height - 2],
            radius=corner_radius - 2,
            outline=(255, 255, 255, 50),
            width=1
        )
    
    def _add_verification_seal(self, overlay: Image.Image, x: int, y: int, 
                             width: int, height: int) -> None:
        """
        Add verification seal/logo
        
        Args:
            overlay: Overlay image
            x, y: Position coordinates
            width, height: Dimensions
        """
        try:
            # Try to load the seal image
            if os.path.exists(self.watermark_logo_path):
                seal = Image.open(self.watermark_logo_path)
                
                # Resize seal to fit
                seal_size = min(width // 3, height // 2, 40)
                seal = seal.resize((seal_size, seal_size), Image.Resampling.LANCZOS)
                
                # Make seal semi-transparent
                if seal.mode != 'RGBA':
                    seal = seal.convert('RGBA')
                
                # Adjust transparency
                seal_array = np.array(seal)
                seal_array[:, :, 3] = seal_array[:, :, 3] * 0.8  # 80% opacity
                seal = Image.fromarray(seal_array, 'RGBA')
                
                # Position seal
                seal_x = x + 10
                seal_y = y + 10
                
                # Paste seal onto overlay
                overlay.paste(seal, (seal_x, seal_y), seal)
                
        except Exception as e:
            logger.warning(f"Could not load verification seal: {e}")
            # Draw a simple circle as fallback
            draw = ImageDraw.Draw(overlay)
            seal_size = 30
            seal_x = x + 10
            seal_y = y + 10
            
            draw.ellipse(
                [seal_x, seal_y, seal_x + seal_size, seal_y + seal_size],
                fill=(0, 255, 0, 150),  # Green circle
                outline=(255, 255, 255, 200),
                width=2
            )
    
    def _add_authenticity_score(self, draw: ImageDraw.Draw, x: int, y: int, 
                              width: int, height: int, score: float) -> None:
        """
        Add authenticity score text
        
        Args:
            draw: ImageDraw object
            x, y: Position coordinates
            width, height: Dimensions
            score: Authenticity score
        """
        try:
            # Load font or use default
            font_size = 16
            if self.font_path and os.path.exists(self.font_path):
                font = ImageFont.truetype(self.font_path, font_size)
            else:
                font = ImageFont.load_default()
            
            # Score text
            score_text = f"VERIFIED {score:.1f}%"
            
            # Calculate text position
            bbox = draw.textbbox((0, 0), score_text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            text_x = x + width - text_width - 10
            text_y = y + 10
            
            # Draw text with shadow effect
            # Shadow
            draw.text((text_x + 1, text_y + 1), score_text, 
                     font=font, fill=(0, 0, 0, 100))
            
            # Main text
            color = (0, 255, 0, 255) if score >= 95 else (255, 255, 0, 255)
            draw.text((text_x, text_y), score_text, 
                     font=font, fill=color)
            
        except Exception as e:
            logger.warning(f"Could not add authenticity score: {e}")
    
    def _add_verification_timestamp(self, draw: ImageDraw.Draw, x: int, y: int, 
                                  width: int, height: int, 
                                  verification_data: Dict[str, Any]) -> None:
        """
        Add verification timestamp
        
        Args:
            draw: ImageDraw object
            x, y: Position coordinates
            width, height: Dimensions
            verification_data: Verification metadata
        """
        try:
            from datetime import datetime
            
            # Load font
            font_size = 10
            if self.font_path and os.path.exists(self.font_path):
                font = ImageFont.truetype(self.font_path, font_size)
            else:
                font = ImageFont.load_default()
            
            # Timestamp text
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
            timestamp_text = f"Verified: {timestamp}"
            
            # Calculate text position
            bbox = draw.textbbox((0, 0), timestamp_text, font=font)
            text_width = bbox[2] - bbox[0]
            
            text_x = x + width - text_width - 10
            text_y = y + height - 20
            
            # Draw timestamp
            draw.text((text_x, text_y), timestamp_text, 
                     font=font, fill=(255, 255, 255, 200))
            
        except Exception as e:
            logger.warning(f"Could not add timestamp: {e}")
    
    def _add_branding(self, draw: ImageDraw.Draw, x: int, y: int, 
                     width: int, height: int) -> None:
        """
        Add APEX VERIFY branding
        
        Args:
            draw: ImageDraw object
            x, y: Position coordinates
            width, height: Dimensions
        """
        try:
            # Load font
            font_size = 12
            if self.font_path and os.path.exists(self.font_path):
                font = ImageFont.truetype(self.font_path, font_size)
            else:
                font = ImageFont.load_default()
            
            # Branding text
            brand_text = "APEX VERIFY™"
            
            # Calculate text position
            bbox = draw.textbbox((0, 0), brand_text, font=font)
            text_width = bbox[2] - bbox[0]
            
            text_x = x + 10
            text_y = y + height - 25
            
            # Draw branding with gradient effect
            # Shadow
            draw.text((text_x + 1, text_y + 1), brand_text, 
                     font=font, fill=(0, 0, 0, 100))
            
            # Main text
            draw.text((text_x, text_y), brand_text, 
                     font=font, fill=(255, 255, 255, 255))
            
        except Exception as e:
            logger.warning(f"Could not add branding: {e}")
    
    def _apply_glassmorphism_effect(self, overlay: Image.Image) -> Image.Image:
        """
        Apply glassmorphism blur and transparency effects
        
        Args:
            overlay: Overlay image
            
        Returns:
            Processed overlay with glassmorphism effect
        """
        try:
            # Convert to numpy array for processing
            overlay_array = np.array(overlay)
            
            # Apply slight blur to create glassmorphism effect
            # This is a simplified version - in production, use more sophisticated effects
            
            # Create a mask for the watermark area
            alpha_channel = overlay_array[:, :, 3]
            mask = alpha_channel > 0
            
            # Apply blur to the alpha channel
            blurred_alpha = Image.fromarray(alpha_channel).filter(ImageFilter.GaussianBlur(radius=1))
            overlay_array[:, :, 3] = np.array(blurred_alpha)
            
            return Image.fromarray(overlay_array, 'RGBA')
            
        except Exception as e:
            logger.warning(f"Could not apply glassmorphism effect: {e}")
            return overlay
    
    def _image_to_base64(self, image: Image.Image) -> str:
        """
        Convert PIL Image to base64 string
        
        Args:
            image: PIL Image object
            
        Returns:
            Base64 encoded image string
        """
        try:
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Save to bytes
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='JPEG', quality=95)
            img_byte_arr = img_byte_arr.getvalue()
            
            # Encode to base64
            base64_string = base64.b64encode(img_byte_arr).decode('utf-8')
            
            return base64_string
            
        except Exception as e:
            logger.error(f"Failed to convert image to base64: {e}")
            return ""
    
    def create_watermark_preview(self, width: int = 300, height: int = 120) -> str:
        """
        Create a preview of the watermark design
        
        Args:
            width: Preview width
            height: Preview height
            
        Returns:
            Base64 encoded preview image
        """
        try:
            # Create preview image
            preview = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            draw = ImageDraw.Draw(preview)
            
            # Draw watermark preview
            self._draw_glassmorphism_background(draw, 0, 0, width, height)
            self._add_verification_seal(preview, 0, 0, width, height)
            self._add_authenticity_score(draw, 0, 0, width, height, 99.9)
            self._add_verification_timestamp(draw, 0, 0, width, height, {})
            self._add_branding(draw, 0, 0, width, height)
            
            # Apply effects
            preview = self._apply_glassmorphism_effect(preview)
            
            # Convert to base64
            return self._image_to_base64(preview.convert('RGB'))
            
        except Exception as e:
            logger.error(f"Failed to create watermark preview: {e}")
            return ""
    
    def get_watermark_info(self) -> Dict[str, Any]:
        """
        Get watermark service information
        
        Returns:
            Dict containing service info
        """
        return {
            "status": "ready",
            "watermark_type": "glassmorphism",
            "logo_available": os.path.exists(self.watermark_logo_path),
            "font_available": self.font_path and os.path.exists(self.font_path),
            "min_authenticity_score": 95.0,
            "features": [
                "glassmorphism_effect",
                "verification_seal",
                "authenticity_score",
                "timestamp",
                "branding"
            ]
        }
