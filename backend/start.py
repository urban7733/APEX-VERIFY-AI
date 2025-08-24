#!/usr/bin/env python3
"""
Startup script for APEX VERIFY AI Backend

This script initializes and starts the FastAPI server with proper configuration.
"""

import uvicorn
import os
import sys
from pathlib import Path

def main():
    """Main startup function"""
    
    # Add the backend directory to Python path
    backend_dir = Path(__file__).parent
    sys.path.insert(0, str(backend_dir))
    
    # Set default environment if not set
    if not os.getenv("ENVIRONMENT"):
        os.environ["ENVIRONMENT"] = "development"
    
    # Load environment variables from .env file if it exists
    env_file = backend_dir / ".env"
    if env_file.exists():
        from dotenv import load_dotenv
        load_dotenv(env_file)
        print(f"Loaded environment from {env_file}")
    
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("ENVIRONMENT") == "development"
    
    print(f"Starting APEX VERIFY AI Backend...")
    print(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"Reload: {reload}")
    print(f"API Documentation: http://{host}:{port}/docs")
    
    # Start the server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level=os.getenv("LOG_LEVEL", "info").lower()
    )

if __name__ == "__main__":
    main()
