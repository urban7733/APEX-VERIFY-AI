"""
Configuration settings for APEX VERIFY AI Backend
"""

import os
from typing import Optional

class Settings:
    """Application settings loaded from environment variables"""
    
    # API Configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "APEX VERIFY AI"
    VERSION: str = "1.0.0"
    
    # Security
    CORS_ORIGINS: list = ["*"]  # Configure appropriately for production
    
    # File Upload
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    ALLOWED_IMAGE_TYPES: list = [
        "image/jpeg",
        "image/png", 
        "image/webp",
        "image/gif"
    ]
    
    # AI Services
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    DINOv3_MODEL_PATH: Optional[str] = os.getenv("DINOV3_MODEL_PATH")
    
    # Database (for future use)
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    
    # Redis (for future use)
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Storage (for future use)
    STORAGE_BUCKET: Optional[str] = os.getenv("STORAGE_BUCKET")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Performance
    MAX_CONCURRENT_VERIFICATIONS: int = int(os.getenv("MAX_CONCURRENT_VERIFICATIONS", "10"))
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return os.getenv("ENVIRONMENT", "development").lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment"""
        return not self.is_production

# Global settings instance
settings = Settings()
