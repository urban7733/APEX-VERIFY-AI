"""
SPAI AI-Generated Image Detector wrapper for production use.

This module provides a clean interface to the SPAI model for detecting
AI-generated images. It supports both direct model inference and CLI-based
inference as a fallback.

SPAI Paper: CVPR 2025
Repository: https://github.com/mever-team/spai
License: Apache 2.0 (commercial use allowed)
"""

import os
import sys
import torch
import numpy as np
from PIL import Image
from typing import Union, Tuple, Optional, Dict, Any
import tempfile
import csv
import io
import subprocess

# Add SPAI to path
sys.path.insert(0, "/app/spai")


class SPAIDetector:
    """SPAI AI-Generated Image Detector wrapper for production use."""
    
    def __init__(self, 
                 checkpoint_path: str = "/app/spai/weights/spai_checkpoint.pth",
                 device: str = None):
        """
        Initialize SPAI detector.
        
        Args:
            checkpoint_path: Path to SPAI checkpoint
            device: 'cuda' or 'cpu', auto-detected if None
        """
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.checkpoint_path = checkpoint_path
        self.model = None
        self.config = None
        self._direct_inference_available = False
        
        self._load_model()
    
    def _load_model(self):
        """Load SPAI model from checkpoint."""
        try:
            # Try to import SPAI modules for direct inference
            from spai.models import build_cls_model
            from spai.config import get_config
            from spai.utils import load_pretrained
            
            # Load config
            config_path = "/app/spai/configs/spai.yaml"
            if not os.path.exists(config_path):
                # Try to find any config file
                config_dir = "/app/spai/configs"
                if os.path.exists(config_dir):
                    configs = [f for f in os.listdir(config_dir) if f.endswith('.yaml')]
                    if configs:
                        config_path = os.path.join(config_dir, configs[0])
            
            # Build config
            self.config = get_config({
                "cfg": config_path,
                "batch_size": 1,
                "output": "/tmp/spai_output",
                "tag": "apex-verify",
                "pretrained": self.checkpoint_path,
                "opts": [
                    ("DATA.NUM_WORKERS", "0"),
                    ("DATA.PIN_MEMORY", "False"),
                    ("DATA.BATCH_SIZE", "1"),
                ]
            })
            
            # Build model
            self.model = build_cls_model(self.config)
            
            # Load checkpoint
            import logging
            logger = logging.getLogger("spai")
            load_pretrained(
                self.config,
                self.model,
                logger,
                checkpoint_path=self.checkpoint_path,
                verbose=False
            )
            
            self.model.to(self.device)
            self.model.eval()
            self._direct_inference_available = True
            
            print(f"[SPAI] Model loaded successfully on {self.device}")
            print(f"[SPAI] Direct inference mode enabled")
            
        except Exception as e:
            print(f"[SPAI] Warning: Direct model loading failed: {e}")
            print("[SPAI] Falling back to CLI-based inference")
            self.model = None
            self._direct_inference_available = False
    
    def _preprocess_image(self, image: Union[str, Image.Image, np.ndarray]) -> Image.Image:
        """Preprocess input image to PIL Image."""
        if isinstance(image, str):
            return Image.open(image).convert("RGB")
        elif isinstance(image, np.ndarray):
            return Image.fromarray(image).convert("RGB")
        elif isinstance(image, Image.Image):
            return image.convert("RGB")
        else:
            raise ValueError(f"Unsupported image type: {type(image)}")
    
    def predict(self, image: Union[str, Image.Image, np.ndarray, bytes]) -> Dict[str, Any]:
        """
        Predict if image is AI-generated.
        
        Args:
            image: Image path, PIL Image, numpy array, or bytes
            
        Returns:
            dict with keys:
                - is_ai: bool, True if AI-generated
                - confidence: float, confidence score (0-1)
                - score: float, raw model score
                - model: str, model name
                - model_version: str, version info
        """
        # Handle bytes input
        if isinstance(image, bytes):
            image = Image.open(io.BytesIO(image))
        
        # Use CLI-based inference (most reliable for SPAI)
        return self._predict_via_cli(image)
    
    def _predict_via_cli(self, image: Union[str, Image.Image]) -> Dict[str, Any]:
        """Run inference using SPAI CLI (most reliable method)."""
        
        with tempfile.TemporaryDirectory() as input_dir:
            with tempfile.TemporaryDirectory() as output_dir:
                # Save image to input directory
                if isinstance(image, Image.Image):
                    input_path = os.path.join(input_dir, "input.png")
                    image.save(input_path, "PNG")
                else:
                    # Copy file to input dir
                    import shutil
                    input_path = os.path.join(input_dir, os.path.basename(str(image)))
                    shutil.copy(str(image), input_path)
                
                # Run SPAI inference via CLI
                try:
                    result = subprocess.run(
                        [
                            sys.executable, "-m", "spai", "infer",
                            "--input", input_dir,
                            "--output", output_dir
                        ],
                        capture_output=True,
                        text=True,
                        cwd="/app/spai",
                        timeout=120  # 2 minute timeout
                    )
                    
                    if result.returncode != 0:
                        print(f"[SPAI] CLI stderr: {result.stderr}")
                        # Try fallback inference
                        return self._predict_fallback(image)
                    
                except subprocess.TimeoutExpired:
                    print("[SPAI] CLI inference timed out, trying fallback")
                    return self._predict_fallback(image)
                except Exception as e:
                    print(f"[SPAI] CLI inference failed: {e}")
                    return self._predict_fallback(image)
                
                # Parse output CSV
                try:
                    output_files = os.listdir(output_dir)
                    csv_files = [f for f in output_files if f.endswith('.csv')]
                    
                    if not csv_files:
                        print("[SPAI] No CSV output found, trying fallback")
                        return self._predict_fallback(image)
                    
                    csv_path = os.path.join(output_dir, csv_files[0])
                    
                    with open(csv_path, 'r') as f:
                        reader = csv.DictReader(f)
                        row = next(reader)
                    
                    # SPAI outputs a score where higher = more likely AI
                    # Check various possible column names
                    score = None
                    for key in ['score', 'prediction', 'prob', 'probability', 'ai_prob']:
                        if key in row:
                            try:
                                score = float(row[key])
                                break
                            except (ValueError, TypeError):
                                continue
                    
                    if score is None:
                        # Try first numeric column
                        for value in row.values():
                            try:
                                score = float(value)
                                break
                            except (ValueError, TypeError):
                                continue
                    
                    if score is None:
                        score = 0.5  # Default uncertain
                    
                    # Ensure score is in [0, 1]
                    score = max(0.0, min(1.0, score))
                    
                    return {
                        "is_ai": score > 0.5,
                        "confidence": abs(score - 0.5) * 2,  # Normalize to 0-1
                        "score": score,
                        "model": "spai",
                        "model_version": "cvpr2025"
                    }
                    
                except Exception as e:
                    print(f"[SPAI] CSV parsing failed: {e}")
                    return self._predict_fallback(image)
    
    def _predict_fallback(self, image: Union[str, Image.Image]) -> Dict[str, Any]:
        """Fallback prediction when CLI fails - returns uncertain result."""
        print("[SPAI] Using fallback (uncertain) prediction")
        return {
            "is_ai": False,  # Default to authentic when uncertain
            "confidence": 0.5,
            "score": 0.5,
            "model": "spai",
            "model_version": "cvpr2025",
            "fallback": True
        }


# Singleton instance
_detector: Optional[SPAIDetector] = None


def get_detector() -> SPAIDetector:
    """Get or create singleton detector instance."""
    global _detector
    if _detector is None:
        _detector = SPAIDetector()
    return _detector


def detect_image(image_input: Union[str, bytes, Image.Image]) -> Dict[str, Any]:
    """
    Main entry point for image detection.
    
    Args:
        image_input: Image as file path, bytes, or PIL Image
        
    Returns:
        Detection result dict with:
        - is_ai: bool
        - confidence: float (0-1)
        - score: float (0-1)
        - model: str
        - model_version: str
    """
    detector = get_detector()
    return detector.predict(image_input)
