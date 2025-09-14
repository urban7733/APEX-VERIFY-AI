#!/bin/bash
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
