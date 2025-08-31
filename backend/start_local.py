#!/usr/bin/env python3
"""
APEX VERIFY AI - Local Development Startup Script
Start the backend with proper module imports and configuration
"""

import uvicorn
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set environment variables for local development
os.environ.setdefault('ENVIRONMENT', 'development')

if __name__ == "__main__":
    print("🚀 Starting APEX VERIFY AI Backend (Local Development)")
    print("=" * 50)
    
    # Check if .env file exists
    env_file = backend_dir / '.env'
    if not env_file.exists():
        print("⚠️  Warning: .env file not found")
        print("   Please create .env file with your configuration")
        print("   See env.example for template")
        print()
    
    # Check required environment variables
    gemini_key = os.getenv('GEMINI_API_KEY')
    if not gemini_key:
        print("❌ GEMINI_API_KEY not set")
        print("   Please set your Gemini API key in .env file")
        print()
    
    dinov3_path = os.getenv('DINOV3_MODEL_PATH', './models/dinov3_vit7b16b.pth')
    if not os.path.exists(dinov3_path):
        print(f"⚠️  Warning: DINOv3 model not found at {dinov3_path}")
        print("   The backend will start but DINOv3 analysis will fail")
        print("   Please ensure your .pth file is in the correct location")
        print()
    
    print("📁 Backend directory:", backend_dir)
    print("🔑 Gemini API:", "Configured" if gemini_key else "Not configured")
    print("🧠 DINOv3 Model:", "Found" if os.path.exists(dinov3_path) else "Not found")
    print()
    
    # Start the server
    print("🌐 Starting server at http://localhost:8000")
    print("📚 API documentation: http://localhost:8000/docs")
    print("=" * 50)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
