import os
import requests
import base64
import logging
from typing import Dict, Any, List, Optional
import numpy as np
from PIL import Image
import io
import hashlib
import json

# Import vector database service
from .vector_database_service import VectorDatabaseService

logger = logging.getLogger(__name__)

class ReverseSearchService:
    """
    Image Reverse Search Service for APEX VERIFY AI
    Uses multiple APIs and embedding similarity for source detection
    """
    
    def __init__(self):
        self.google_vision_api_key = os.getenv('GOOGLE_VISION_API_KEY')
        self.tineye_api_key = os.getenv('TINEYE_API_KEY')
        self.vector_db = VectorDatabaseService()
        self.embeddings_db = {}  # Fallback in-memory storage
        
        logger.info("Initializing Reverse Search Service")
    
    def search_image_sources(self, image: Image.Image, features: np.ndarray) -> Dict[str, Any]:
        """
        Search for image sources using multiple methods
        
        Args:
            image: PIL Image object
            features: DINOv3 feature vector
            
        Returns:
            Dict containing search results
        """
        results = {
            "google_vision": None,
            "tineye": None,
            "embedding_similarity": None,
            "metadata_analysis": None
        }
        
        try:
            # Google Vision API search
            if self.google_vision_api_key:
                results["google_vision"] = self._search_google_vision(image)
            
            # TinEye API search
            if self.tineye_api_key:
                results["tineye"] = self._search_tineye(image)
            
            # Embedding similarity search
            results["embedding_similarity"] = self._search_embedding_similarity(features)
            
            # Metadata analysis
            results["metadata_analysis"] = self._analyze_metadata(image)
            
            return results
            
        except Exception as e:
            logger.error(f"Reverse search failed: {e}")
            return {"error": str(e)}
    
    def _search_google_vision(self, image: Image.Image) -> Dict[str, Any]:
        """
        Search using Google Vision API
        
        Args:
            image: PIL Image object
            
        Returns:
            Dict containing Google Vision results
        """
        try:
            # Convert image to base64
            buffer = io.BytesIO()
            image.save(buffer, format='JPEG')
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            # Google Vision API request
            url = f"https://vision.googleapis.com/v1/images:annotate?key={self.google_vision_api_key}"
            
            payload = {
                "requests": [
                    {
                        "image": {
                            "content": image_base64
                        },
                        "features": [
                            {"type": "WEB_DETECTION", "maxResults": 10},
                            {"type": "FACE_DETECTION", "maxResults": 10}
                        ]
                    }
                ]
            }
            
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Parse results
            web_detection = data.get('responses', [{}])[0].get('webDetection', {})
            face_detection = data.get('responses', [{}])[0].get('faceAnnotations', [])
            
            return {
                "status": "success",
                "web_entities": web_detection.get('webEntities', []),
                "full_matching_images": web_detection.get('fullMatchingImages', []),
                "partial_matching_images": web_detection.get('partialMatchingImages', []),
                "pages_with_matching_images": web_detection.get('pagesWithMatchingImages', []),
                "faces_detected": len(face_detection)
            }
            
        except Exception as e:
            logger.error(f"Google Vision search failed: {e}")
            return {"status": "error", "error": str(e)}
    
    def _search_tineye(self, image: Image.Image) -> Dict[str, Any]:
        """
        Search using TinEye API
        
        Args:
            image: PIL Image object
            
        Returns:
            Dict containing TinEye results
        """
        try:
            # Convert image to base64
            buffer = io.BytesIO()
            image.save(buffer, format='JPEG')
            image_data = buffer.getvalue()
            
            # TinEye API request
            url = "https://api.tineye.com/rest/search/"
            
            headers = {
                'Content-Type': 'application/octet-stream',
                'x-api-key': self.tineye_api_key
            }
            
            response = requests.post(url, data=image_data, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "status": "success",
                "results": data.get('results', []),
                "total_results": data.get('total_results', 0)
            }
            
        except Exception as e:
            logger.error(f"TinEye search failed: {e}")
            return {"status": "error", "error": str(e)}
    
    def _search_embedding_similarity(self, features: np.ndarray) -> Dict[str, Any]:
        """
        Search for similar images using embedding similarity
        
        Args:
            features: DINOv3 feature vector
            
        Returns:
            Dict containing similarity results
        """
        try:
            # Try vector database first
            if self.vector_db.initialize():
                similar_results = self.vector_db.search_similar(features, top_k=5, threshold=0.7)
                
                if similar_results:
                    return {
                        "status": "success",
                        "similar_images": [
                            {
                                "image_hash": result["image_hash"],
                                "similarity": result["similarity"],
                                "source": "vector_database",
                                "metadata": result["metadata"]
                            }
                            for result in similar_results
                        ],
                        "total_matches": len(similar_results)
                    }
            
            # Fallback to local storage
            similarities = []
            
            for image_hash, stored_features in self.embeddings_db.items():
                similarity = self._cosine_similarity(features, stored_features)
                similarities.append({
                    "image_hash": image_hash,
                    "similarity": float(similarity),
                    "source": "local_database"
                })
            
            # Sort by similarity
            similarities.sort(key=lambda x: x["similarity"], reverse=True)
            
            return {
                "status": "success",
                "similar_images": similarities[:5],  # Top 5 matches
                "total_matches": len(similarities)
            }
            
        except Exception as e:
            logger.error(f"Embedding similarity search failed: {e}")
            return {"status": "error", "error": str(e)}
    
    def _analyze_metadata(self, image: Image.Image) -> Dict[str, Any]:
        """
        Analyze image metadata for source information
        
        Args:
            image: PIL Image object
            
        Returns:
            Dict containing metadata analysis
        """
        try:
            metadata = {}
            
            # Extract EXIF data
            if hasattr(image, '_getexif') and image._getexif():
                exif = image._getexif()
                metadata["exif"] = {
                    "camera_make": exif.get(271, "Unknown"),
                    "camera_model": exif.get(272, "Unknown"),
                    "date_taken": exif.get(306, "Unknown"),
                    "software": exif.get(305, "Unknown")
                }
            
            # Basic image properties
            metadata["properties"] = {
                "format": image.format,
                "mode": image.mode,
                "size": image.size,
                "has_transparency": image.mode in ('RGBA', 'LA', 'P')
            }
            
            # Generate image hash for fingerprinting
            image_hash = hashlib.sha256(image.tobytes()).hexdigest()
            metadata["fingerprint"] = image_hash[:16]
            
            return {
                "status": "success",
                "metadata": metadata,
                "analysis": self._interpret_metadata(metadata)
            }
            
        except Exception as e:
            logger.error(f"Metadata analysis failed: {e}")
            return {"status": "error", "error": str(e)}
    
    def _interpret_metadata(self, metadata: Dict[str, Any]) -> List[str]:
        """
        Interpret metadata for source clues
        
        Args:
            metadata: Extracted metadata
            
        Returns:
            List of interpretation strings
        """
        interpretations = []
        
        exif = metadata.get("exif", {})
        
        # Check for editing software
        software = exif.get("software", "").lower()
        if any(editor in software for editor in ["photoshop", "gimp", "paint", "canva"]):
            interpretations.append(f"Image processed with: {exif['software']}")
        
        # Check for camera information
        if exif.get("camera_make") != "Unknown":
            interpretations.append(f"Captured with: {exif['camera_make']} {exif['camera_model']}")
        
        # Check for recent date
        date_taken = exif.get("date_taken", "")
        if date_taken and "2024" in date_taken:
            interpretations.append("Recent capture (2024)")
        
        return interpretations
    
    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """
        Calculate cosine similarity between two vectors
        
        Args:
            a: First vector
            b: Second vector
            
        Returns:
            Cosine similarity score
        """
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
    def store_embedding(self, image_hash: str, features: np.ndarray, metadata: Dict[str, Any] = None) -> None:
        """
        Store image embedding for future similarity search
        
        Args:
            image_hash: Unique identifier for the image
            features: DINOv3 feature vector
            metadata: Additional metadata about the image
        """
        try:
            # Try vector database first
            if self.vector_db.initialize():
                metadata = metadata or {}
                success = self.vector_db.store_embedding(image_hash, features, metadata)
                if success:
                    logger.info(f"Stored embedding in vector database: {image_hash[:16]}...")
                    return
            
            # Fallback to local storage
            self.embeddings_db[image_hash] = features.copy()
            logger.info(f"Stored embedding locally: {image_hash[:16]}...")
            
        except Exception as e:
            logger.error(f"Failed to store embedding: {e}")
            # Fallback to local storage
            self.embeddings_db[image_hash] = features.copy()
    
    def test_connection(self) -> Dict[str, Any]:
        """
        Test API connections
        
        Returns:
            Dict containing connection status
        """
        status = {
            "google_vision": "not_configured",
            "tineye": "not_configured",
            "embedding_db": "ready"
        }
        
        if self.google_vision_api_key:
            status["google_vision"] = "configured"
        
        if self.tineye_api_key:
            status["tineye"] = "configured"
        
        # Get vector database stats
        vector_db_stats = self.vector_db.get_stats() if hasattr(self, 'vector_db') else {}
        
        return {
            "status": "ready",
            "services": status,
            "stored_embeddings": len(self.embeddings_db),
            "vector_database": vector_db_stats
        }
