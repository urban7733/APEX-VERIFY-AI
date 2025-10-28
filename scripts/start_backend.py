#!/usr/bin/env python3
"""
Script to start the Apex Verify AI backend with deepfake detection
"""
import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("Installing requirements...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"])

def start_server():
    """Start the FastAPI server"""
    print("Starting Apex Verify AI backend...")
    os.chdir("backend")
    subprocess.run([sys.executable, "main.py"])

if __name__ == "__main__":
    try:
        install_requirements()
        start_server()
    except KeyboardInterrupt:
        print("\nShutting down server...")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
