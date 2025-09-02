import os
import logging
import numpy as np
import pickle
import json
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
import hashlib
from datetime import datetime

# Optional imports for advanced vector databases
try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    logging.warning("FAISS not available, using fallback vector storage")

try:
    from pinecone import Pinecone, ServerlessSpec
    PINECONE_AVAILABLE = True
except ImportError:
    PINECONE_AVAILABLE = False
    logging.warning("Pinecone not available, using fallback vector storage")

logger = logging.getLogger(__name__)

class VectorDatabaseService:
    """
    Vector Database Service for APEX VERIFY AI
    Supports FAISS, Pinecone, and fallback local storage for embedding management
    """
    
    def __init__(self):
        self.dimension = 768  # DINOv3 feature dimension
        self.faiss_index = None
        self.pinecone_index = None
        self.local_storage = {}
        self.metadata_db = {}
        self.storage_type = self._determine_storage_type()
        
        logger.info(f"Initializing Vector Database Service with {self.storage_type}")
    
    def _determine_storage_type(self) -> str:
        """
        Determine which vector database to use based on available libraries and configuration
        
        Returns:
            str: Storage type ('faiss', 'pinecone', 'local')
        """
        # Check for Pinecone configuration
        if PINECONE_AVAILABLE and os.getenv('PINECONE_API_KEY'):
            return 'pinecone'
        
        # Check for FAISS
        if FAISS_AVAILABLE:
            return 'faiss'
        
        # Fallback to local storage
        return 'local'
    
    def initialize(self) -> bool:
        """
        Initialize the vector database
        
        Returns:
            bool: True if initialization successful
        """
        try:
            if self.storage_type == 'faiss':
                return self._initialize_faiss()
            elif self.storage_type == 'pinecone':
                return self._initialize_pinecone()
            else:
                return self._initialize_local()
                
        except Exception as e:
            logger.error(f"Vector database initialization failed: {e}")
            return False
    
    def _initialize_faiss(self) -> bool:
        """
        Initialize FAISS index
        
        Returns:
            bool: True if successful
        """
        try:
            # Create FAISS index
            self.faiss_index = faiss.IndexFlatIP(self.dimension)  # Inner product for cosine similarity
            
            # Load existing index if available
            index_path = os.getenv('FAISS_INDEX_PATH', './data/faiss_index.bin')
            metadata_path = os.getenv('FAISS_METADATA_PATH', './data/faiss_metadata.json')
            
            if os.path.exists(index_path) and os.path.exists(metadata_path):
                # Load existing index
                self.faiss_index = faiss.read_index(index_path)
                with open(metadata_path, 'r') as f:
                    self.metadata_db = json.load(f)
                logger.info(f"Loaded existing FAISS index with {self.faiss_index.ntotal} vectors")
            else:
                # Create new index
                os.makedirs(os.path.dirname(index_path), exist_ok=True)
                logger.info("Created new FAISS index")
            
            return True
            
        except Exception as e:
            logger.error(f"FAISS initialization failed: {e}")
            return False
    
    def _initialize_pinecone(self) -> bool:
        """
        Initialize Pinecone index
        
        Returns:
            bool: True if successful
        """
        try:
            api_key = os.getenv('PINECONE_API_KEY')
            environment = os.getenv('PINECONE_ENVIRONMENT', 'us-east-1')
            index_name = os.getenv('PINECONE_INDEX_NAME', 'apex-verify-embeddings')
            
            # Initialize Pinecone
            pc = Pinecone(api_key=api_key)
            
            # Check if index exists
            if index_name not in pc.list_indexes().names():
                # Create new index
                pc.create_index(
                    name=index_name,
                    dimension=self.dimension,
                    metric='cosine',
                    spec=ServerlessSpec(
                        cloud='aws',
                        region=environment
                    )
                )
                logger.info(f"Created new Pinecone index: {index_name}")
            else:
                logger.info(f"Using existing Pinecone index: {index_name}")
            
            # Connect to index
            self.pinecone_index = pc.Index(index_name)
            
            return True
            
        except Exception as e:
            logger.error(f"Pinecone initialization failed: {e}")
            return False
    
    def _initialize_local(self) -> bool:
        """
        Initialize local storage
        
        Returns:
            bool: True if successful
        """
        try:
            # Load existing data if available
            storage_path = os.getenv('LOCAL_VECTOR_STORAGE', './data/vector_storage.pkl')
            metadata_path = os.getenv('LOCAL_METADATA_STORAGE', './data/vector_metadata.json')
            
            if os.path.exists(storage_path) and os.path.exists(metadata_path):
                with open(storage_path, 'rb') as f:
                    self.local_storage = pickle.load(f)
                with open(metadata_path, 'r') as f:
                    self.metadata_db = json.load(f)
                logger.info(f"Loaded existing local storage with {len(self.local_storage)} vectors")
            else:
                # Create new storage
                os.makedirs(os.path.dirname(storage_path), exist_ok=True)
                logger.info("Created new local vector storage")
            
            return True
            
        except Exception as e:
            logger.error(f"Local storage initialization failed: {e}")
            return False
    
    def store_embedding(self, image_hash: str, features: np.ndarray, metadata: Dict[str, Any]) -> bool:
        """
        Store embedding in the vector database
        
        Args:
            image_hash: Unique identifier for the image
            features: DINOv3 feature vector
            metadata: Additional metadata about the image
            
        Returns:
            bool: True if storage successful
        """
        try:
            # Normalize features for cosine similarity
            features_normalized = features / np.linalg.norm(features)
            
            # Prepare metadata
            full_metadata = {
                'image_hash': image_hash,
                'timestamp': datetime.now().isoformat(),
                'feature_norm': float(np.linalg.norm(features)),
                'feature_mean': float(np.mean(features)),
                'feature_std': float(np.std(features)),
                **metadata
            }
            
            if self.storage_type == 'faiss':
                return self._store_faiss(image_hash, features_normalized, full_metadata)
            elif self.storage_type == 'pinecone':
                return self._store_pinecone(image_hash, features_normalized, full_metadata)
            else:
                return self._store_local(image_hash, features_normalized, full_metadata)
                
        except Exception as e:
            logger.error(f"Failed to store embedding: {e}")
            return False
    
    def _store_faiss(self, image_hash: str, features: np.ndarray, metadata: Dict[str, Any]) -> bool:
        """
        Store embedding in FAISS index
        
        Args:
            image_hash: Unique identifier
            features: Normalized feature vector
            metadata: Metadata dictionary
            
        Returns:
            bool: True if successful
        """
        try:
            # Add to FAISS index
            self.faiss_index.add(features.reshape(1, -1).astype('float32'))
            
            # Store metadata
            self.metadata_db[image_hash] = metadata
            
            # Save to disk
            self._save_faiss_data()
            
            logger.info(f"Stored embedding in FAISS: {image_hash[:16]}...")
            return True
            
        except Exception as e:
            logger.error(f"FAISS storage failed: {e}")
            return False
    
    def _store_pinecone(self, image_hash: str, features: np.ndarray, metadata: Dict[str, Any]) -> bool:
        """
        Store embedding in Pinecone index
        
        Args:
            image_hash: Unique identifier
            features: Normalized feature vector
            metadata: Metadata dictionary
            
        Returns:
            bool: True if successful
        """
        try:
            # Prepare Pinecone vector
            vector_data = {
                'id': image_hash,
                'values': features.tolist(),
                'metadata': metadata
            }
            
            # Upsert to Pinecone
            self.pinecone_index.upsert(vectors=[vector_data])
            
            logger.info(f"Stored embedding in Pinecone: {image_hash[:16]}...")
            return True
            
        except Exception as e:
            logger.error(f"Pinecone storage failed: {e}")
            return False
    
    def _store_local(self, image_hash: str, features: np.ndarray, metadata: Dict[str, Any]) -> bool:
        """
        Store embedding in local storage
        
        Args:
            image_hash: Unique identifier
            features: Normalized feature vector
            metadata: Metadata dictionary
            
        Returns:
            bool: True if successful
        """
        try:
            # Store in local dictionaries
            self.local_storage[image_hash] = features
            self.metadata_db[image_hash] = metadata
            
            # Save to disk
            self._save_local_data()
            
            logger.info(f"Stored embedding locally: {image_hash[:16]}...")
            return True
            
        except Exception as e:
            logger.error(f"Local storage failed: {e}")
            return False
    
    def search_similar(self, query_features: np.ndarray, top_k: int = 10, threshold: float = 0.7) -> List[Dict[str, Any]]:
        """
        Search for similar embeddings
        
        Args:
            query_features: Query feature vector
            top_k: Number of results to return
            threshold: Similarity threshold
            
        Returns:
            List of similar embeddings with metadata
        """
        try:
            # Normalize query features
            query_normalized = query_features / np.linalg.norm(query_features)
            
            if self.storage_type == 'faiss':
                return self._search_faiss(query_normalized, top_k, threshold)
            elif self.storage_type == 'pinecone':
                return self._search_pinecone(query_normalized, top_k, threshold)
            else:
                return self._search_local(query_normalized, top_k, threshold)
                
        except Exception as e:
            logger.error(f"Similarity search failed: {e}")
            return []
    
    def _search_faiss(self, query_features: np.ndarray, top_k: int, threshold: float) -> List[Dict[str, Any]]:
        """
        Search FAISS index for similar vectors
        
        Args:
            query_features: Normalized query vector
            top_k: Number of results
            threshold: Similarity threshold
            
        Returns:
            List of similar results
        """
        try:
            if self.faiss_index.ntotal == 0:
                return []
            
            # Search FAISS index
            scores, indices = self.faiss_index.search(query_features.reshape(1, -1).astype('float32'), top_k)
            
            results = []
            for score, idx in zip(scores[0], indices[0]):
                if score >= threshold and idx != -1:
                    # Get metadata for this index
                    image_hash = list(self.metadata_db.keys())[idx]
                    metadata = self.metadata_db[image_hash]
                    
                    results.append({
                        'image_hash': image_hash,
                        'similarity': float(score),
                        'metadata': metadata
                    })
            
            return results
            
        except Exception as e:
            logger.error(f"FAISS search failed: {e}")
            return []
    
    def _search_pinecone(self, query_features: np.ndarray, top_k: int, threshold: float) -> List[Dict[str, Any]]:
        """
        Search Pinecone index for similar vectors
        
        Args:
            query_features: Normalized query vector
            top_k: Number of results
            threshold: Similarity threshold
            
        Returns:
            List of similar results
        """
        try:
            # Search Pinecone
            results = self.pinecone_index.query(
                vector=query_features.tolist(),
                top_k=top_k,
                include_metadata=True
            )
            
            similar_results = []
            for match in results['matches']:
                if match['score'] >= threshold:
                    similar_results.append({
                        'image_hash': match['id'],
                        'similarity': float(match['score']),
                        'metadata': match['metadata']
                    })
            
            return similar_results
            
        except Exception as e:
            logger.error(f"Pinecone search failed: {e}")
            return []
    
    def _search_local(self, query_features: np.ndarray, top_k: int, threshold: float) -> List[Dict[str, Any]]:
        """
        Search local storage for similar vectors
        
        Args:
            query_features: Normalized query vector
            top_k: Number of results
            threshold: Similarity threshold
            
        Returns:
            List of similar results
        """
        try:
            similarities = []
            
            for image_hash, stored_features in self.local_storage.items():
                # Calculate cosine similarity
                similarity = np.dot(query_features, stored_features)
                
                if similarity >= threshold:
                    similarities.append({
                        'image_hash': image_hash,
                        'similarity': float(similarity),
                        'metadata': self.metadata_db.get(image_hash, {})
                    })
            
            # Sort by similarity and return top_k
            similarities.sort(key=lambda x: x['similarity'], reverse=True)
            return similarities[:top_k]
            
        except Exception as e:
            logger.error(f"Local search failed: {e}")
            return []
    
    def _save_faiss_data(self):
        """Save FAISS index and metadata to disk"""
        try:
            index_path = os.getenv('FAISS_INDEX_PATH', './data/faiss_index.bin')
            metadata_path = os.getenv('FAISS_METADATA_PATH', './data/faiss_metadata.json')
            
            faiss.write_index(self.faiss_index, index_path)
            with open(metadata_path, 'w') as f:
                json.dump(self.metadata_db, f, indent=2)
                
        except Exception as e:
            logger.error(f"Failed to save FAISS data: {e}")
    
    def _save_local_data(self):
        """Save local storage data to disk"""
        try:
            storage_path = os.getenv('LOCAL_VECTOR_STORAGE', './data/vector_storage.pkl')
            metadata_path = os.getenv('LOCAL_METADATA_STORAGE', './data/vector_metadata.json')
            
            with open(storage_path, 'wb') as f:
                pickle.dump(self.local_storage, f)
            with open(metadata_path, 'w') as f:
                json.dump(self.metadata_db, f, indent=2)
                
        except Exception as e:
            logger.error(f"Failed to save local data: {e}")
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get vector database statistics
        
        Returns:
            Dict containing database statistics
        """
        try:
            stats = {
                'storage_type': self.storage_type,
                'dimension': self.dimension,
                'total_vectors': 0,
                'available_features': {
                    'faiss': FAISS_AVAILABLE,
                    'pinecone': PINECONE_AVAILABLE
                }
            }
            
            if self.storage_type == 'faiss' and self.faiss_index:
                stats['total_vectors'] = self.faiss_index.ntotal
            elif self.storage_type == 'pinecone' and self.pinecone_index:
                stats['total_vectors'] = self.pinecone_index.describe_index_stats()['total_vector_count']
            else:
                stats['total_vectors'] = len(self.local_storage)
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get stats: {e}")
            return {'error': str(e)}
    
    def clear_database(self) -> bool:
        """
        Clear all data from the vector database
        
        Returns:
            bool: True if successful
        """
        try:
            if self.storage_type == 'faiss' and self.faiss_index:
                self.faiss_index.reset()
                self.metadata_db.clear()
                self._save_faiss_data()
            elif self.storage_type == 'pinecone' and self.pinecone_index:
                self.pinecone_index.delete(delete_all=True)
            else:
                self.local_storage.clear()
                self.metadata_db.clear()
                self._save_local_data()
            
            logger.info("Vector database cleared successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to clear database: {e}")
            return False
    
    def test_connection(self) -> Dict[str, Any]:
        """
        Test vector database connection
        
        Returns:
            Dict containing connection status
        """
        try:
            if self.storage_type == 'faiss':
                return {
                    'status': 'connected',
                    'type': 'faiss',
                    'total_vectors': self.faiss_index.ntotal if self.faiss_index else 0
                }
            elif self.storage_type == 'pinecone':
                stats = self.pinecone_index.describe_index_stats()
                return {
                    'status': 'connected',
                    'type': 'pinecone',
                    'total_vectors': stats['total_vector_count']
                }
            else:
                return {
                    'status': 'connected',
                    'type': 'local',
                    'total_vectors': len(self.local_storage)
                }
                
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }
