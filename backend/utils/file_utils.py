"""
File utility functions for APEX VERIFY AI Backend
"""

import os
import mimetypes
from typing import Tuple, Optional
from PIL import Image
import logging

logger = logging.getLogger(__name__)

def validate_image_file(file_path: str, max_size: int = 100 * 1024 * 1024) -> Tuple[bool, str]:
    """
    Validate an image file for processing
    
    Args:
        file_path: Path to the file
        max_size: Maximum file size in bytes
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        # Check file exists
        if not os.path.exists(file_path):
            return False, "File does not exist"
        
        # Check file size
        file_size = os.path.getsize(file_path)
        if file_size > max_size:
            return False, f"File size {file_size} exceeds maximum {max_size}"
        
        # Check if it's a valid image
        try:
            with Image.open(file_path) as img:
                # Verify it's actually an image
                img.verify()
                
                # Check dimensions
                width, height = img.size
                if width < 10 or height < 10:
                    return False, "Image dimensions too small"
                if width > 10000 or height > 10000:
                    return False, "Image dimensions too large"
                    
        except Exception as e:
            return False, f"Invalid image file: {str(e)}"
        
        return True, ""
        
    except Exception as e:
        logger.error(f"File validation failed: {e}")
        return False, f"Validation error: {str(e)}"

def get_image_metadata(file_path: str) -> Optional[dict]:
    """
    Extract basic metadata from an image file
    
    Args:
        file_path: Path to the image file
        
    Returns:
        Dictionary of metadata or None if failed
    """
    try:
        with Image.open(file_path) as img:
            metadata = {
                "format": img.format,
                "mode": img.mode,
                "size": img.size,
                "width": img.width,
                "height": img.height,
                "file_size": os.path.getsize(file_path)
            }
            
            # Try to get EXIF data
            if hasattr(img, '_getexif') and img._getexif():
                exif = img._getexif()
                if exif:
                    metadata["exif"] = {
                        "make": exif.get(271, "Unknown"),
                        "model": exif.get(272, "Unknown"),
                        "software": exif.get(305, "Unknown"),
                        "datetime": exif.get(306, "Unknown")
                    }
            
            return metadata
            
    except Exception as e:
        logger.warning(f"Failed to extract metadata from {file_path}: {e}")
        return None

def create_temp_file_path(original_filename: str, temp_dir: str = None) -> str:
    """
    Create a temporary file path for processing
    
    Args:
        original_filename: Original filename
        temp_dir: Temporary directory (uses system temp if None)
        
    Returns:
        Path to temporary file
    """
    import tempfile
    
    # Get file extension
    _, ext = os.path.splipath(original_filename)
    
    # Create temporary file
    if temp_dir:
        temp_file = tempfile.NamedTemporaryFile(
            delete=False, 
            suffix=ext, 
            dir=temp_dir
        )
    else:
        temp_file = tempfile.NamedTemporaryFile(
            delete=False, 
            suffix=ext
        )
    
    temp_path = temp_file.name
    temp_file.close()
    
    return temp_path

def cleanup_temp_file(file_path: str):
    """
    Safely remove a temporary file
    
    Args:
        file_path: Path to temporary file
    """
    try:
        if os.path.exists(file_path):
            os.unlink(file_path)
            logger.debug(f"Cleaned up temporary file: {file_path}")
    except Exception as e:
        logger.warning(f"Failed to cleanup temporary file {file_path}: {e}")
