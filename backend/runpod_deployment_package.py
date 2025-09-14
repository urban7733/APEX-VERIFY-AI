"""
RunPod Deployment Package for APEX VERIFY AI - 2025 ULTIMATE STACK
This creates a complete deployment package for your RunPod endpoint
"""

import os
import shutil
import json
from pathlib import Path

def create_deployment_package():
    """Create a complete deployment package for RunPod"""
    
    print("🚀 Creating RunPod Deployment Package for ULTIMATE 2025 Stack...")
    
    # Create deployment directory
    deploy_dir = Path("runpod_deployment")
    if deploy_dir.exists():
        shutil.rmtree(deploy_dir)
    deploy_dir.mkdir()
    
    # Copy necessary files
    files_to_copy = [
        "app/",
        "requirements.txt",
        "runpod_handler.py",
        "runpod_config.py"
    ]
    
    for file_path in files_to_copy:
        if os.path.exists(file_path):
            if os.path.isdir(file_path):
                shutil.copytree(file_path, deploy_dir / file_path)
            else:
                shutil.copy2(file_path, deploy_dir / file_path)
            print(f"✅ Copied {file_path}")
    
    # Create main handler file
    main_handler = deploy_dir / "handler.py"
    with open(main_handler, "w") as f:
        f.write('''"""
Main RunPod Handler Entry Point
"""

from runpod_handler import handler

# This is the entry point for RunPod
def runpod_handler(event):
    """RunPod entry point"""
    return handler(event)
''')
    
    # Create startup script
    startup_script = deploy_dir / "startup.sh"
    with open(startup_script, "w") as f:
        f.write('''#!/bin/bash
# RunPod Startup Script for APEX VERIFY AI - 2025 ULTIMATE STACK

echo "🚀 Starting APEX VERIFY AI - 2025 ULTIMATE STACK..."

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Download models (this will take a while)
echo "🔥 Downloading ULTIMATE 2025 models..."
python -c "
from runpod_config import get_model_download_script
import subprocess
script = get_model_download_script()
subprocess.run(['bash', '-c', script])
"

# Test the handler
echo "🧪 Testing handler..."
python runpod_handler.py

echo "✅ APEX VERIFY AI - 2025 ULTIMATE STACK Ready!"
''')
    
    # Make startup script executable
    os.chmod(startup_script, 0o755)
    
    # Create RunPod configuration
    runpod_config = {
        "name": "apex-verify-ai-2025-ultimate",
        "description": "APEX VERIFY AI - 2025 ULTIMATE CUTTING-EDGE STACK",
        "version": "2.0.0",
        "handler": "handler.runpod_handler",
        "containerDiskInGb": 100,
        "volumeInGb": 0,
        "volumeMountPath": "/workspace",
        "env": {
            "ENVIRONMENT": "production",
            "DEVICE": "cuda",
            "MIXED_PRECISION": "true",
            "QUANTIZATION": "true",
            "BATCH_SIZE": "4",
            "CACHE_FEATURES": "true"
        },
        "gpuIds": ["your-gpu-id-here"],
        "networkVolumeId": "your-volume-id-here",
        "maxConcurrency": 10,
        "idleTimeout": 300,
        "scaleSettings": {
            "minInstances": 0,
            "maxInstances": 5
        }
    }
    
    config_file = deploy_dir / "runpod_config.json"
    with open(config_file, "w") as f:
        json.dump(runpod_config, f, indent=2)
    
    # Create README
    readme = deploy_dir / "README.md"
    with open(readme, "w") as f:
        f.write('''# APEX VERIFY AI - 2025 ULTIMATE STACK (RunPod)

## 🚀 Deployment Instructions

### 1. Upload to RunPod
Upload this entire folder to your RunPod serverless endpoint.

### 2. Set Environment Variables
- `ENVIRONMENT=production`
- `DEVICE=cuda`
- `MIXED_PRECISION=true`
- `QUANTIZATION=true`
- `BATCH_SIZE=4`
- `CACHE_FEATURES=true`

### 3. GPU Requirements
- **GPU**: RTX 4090 (24GB VRAM) or better
- **RAM**: 32GB+
- **Disk**: 100GB+ (for all models)

### 4. Models Included
- **DINOv3**: 7GB (7B parameters)
- **Grounded-SAM-2**: 15GB
- **Depth Anything V2**: 2GB
- **YOLO11**: 50MB
- **Moondream2**: 1GB

### 5. API Endpoints
- `POST /run` - Main verification endpoint
- Input: `{"input": {"action": "verify_image", "image_base64": "...", "pipeline": "beast"}}`
- Output: Analysis results with authenticity score

### 6. Usage Example
```python
import requests
import base64

# Encode your image
with open("image.jpg", "rb") as f:
    image_base64 = base64.b64encode(f.read()).decode('utf-8')

# Send to RunPod
response = requests.post(
    "https://api.runpod.ai/v2/zhgaq30ncgov4p/run",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={
        "input": {
            "action": "verify_image",
            "image_base64": image_base64,
            "filename": "image.jpg",
            "pipeline": "beast"
        }
    }
)

result = response.json()
print(f"Authenticity Score: {result['output']['authenticity_score']}%")
```

## 🔥 Features
- DINOv3 Universal Features (7B parameters)
- Grounded-SAM-2 Zero-shot Detection
- Depth Anything V2 - 3D Understanding
- YOLO11 Real-time Detection
- SAM2 Precise Segmentation
- Moondream2 Edge Deployment
- 4-bit Quantization
- Mixed Precision
- Zero Training Required!

Das ist der Weg zum Milliardär! 🚀
''')
    
    print(f"✅ Deployment package created in: {deploy_dir}")
    print(f"📦 Package size: {get_folder_size(deploy_dir)} MB")
    print("\n🔥 Next steps:")
    print("1. Upload the 'runpod_deployment' folder to your RunPod endpoint")
    print("2. Set the handler to 'handler.runpod_handler'")
    print("3. Configure GPU: RTX 4090 (24GB VRAM)")
    print("4. Set disk size: 100GB+")
    print("5. Run the startup script to download models")
    
    return deploy_dir

def get_folder_size(folder_path):
    """Get folder size in MB"""
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(folder_path):
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            if os.path.exists(filepath):
                total_size += os.path.getsize(filepath)
    return round(total_size / (1024 * 1024), 2)

if __name__ == "__main__":
    create_deployment_package()
