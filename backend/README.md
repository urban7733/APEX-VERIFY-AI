# APEX VERIFY AI - Backend

## Overview

This backend provides a simple but effective deepfake detection service using Hugging Face transformers. It analyzes uploaded images and returns structured authenticity reports in the exact format requested.

## Features

- **Hugging Face Integration**: Uses `google/vit-base-patch16-224` Vision Transformer model
- **Structured Analysis**: Returns reports in the exact format specified
- **Fallback Support**: Graceful fallback if model loading fails
- **GPU Support**: Automatically uses GPU if available
- **Real-time Processing**: Fast image analysis and report generation

## Installation

1. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Set up environment variables:
\`\`\`bash
cp env.example .env
# Edit .env and add your GEMINI_API_KEY
\`\`\`

3. Start the backend:
\`\`\`bash
python start_local.py
\`\`\`

## API Endpoints

- `POST /api/verify` - Upload and analyze an image
- `GET /health` - Health check
- `GET /status` - System status
- `GET /models/analyzer/info` - Model information

## Model Details

The system uses a Vision Transformer model from Hugging Face that has been adapted for binary classification (real vs fake images). The model:

- Processes images at 224x224 resolution
- Returns authenticity scores from 0-100%
- Provides confidence levels and feature anomaly detection
- Supports both GPU and CPU inference

## Response Format

The API returns structured analysis reports in this format:

\`\`\`
Apex Verify AI Analysis: COMPLETE
* Authenticity Score: 99.9% - GENUINE MEDIA
* Assessment: [Assessment text]

The Scene in Focus
[Scene description]

The Story Behind the Picture
[Story context]

Digital Footprint & Source Links
[Digital analysis]

AI Summary
[Final summary]

Your media is verified. You can now secure your file with our seal of authenticity.
( Download with Apex Verify™ Seal )
\`\`\`

## Testing

Run the test script to verify the model works:

\`\`\`bash
python test_model.py
\`\`\`

## Dependencies

- FastAPI - Web framework
- Transformers - Hugging Face model library
- PyTorch - Deep learning framework
- Pillow - Image processing
- Gemini API - For enhanced report generation
