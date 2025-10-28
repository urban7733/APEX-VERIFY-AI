# 🔬 Apex Verify AI - Backend

Production-ready deepfake detection backend with YOLO11, ELA analysis, and AI manipulation heatmaps.

## 🚀 Features

- ✅ **YOLO11 Object Detection** - Latest YOLO model for real-time object detection
- ✅ **ELA (Error Level Analysis)** - Detect compression inconsistencies
- ✅ **Frequency Domain Analysis** - FFT-based manipulation detection
- ✅ **Noise Analysis** - Detect inconsistent noise patterns
- ✅ **AI Generation Heatmap** - Visual overlay showing manipulation areas
- ✅ **Spatial Analysis** - Understand scene composition and object relations
- ✅ **RESTful API** - Clean, documented API endpoints

## 📋 Requirements

- Python 3.10+
- 4GB+ RAM (8GB+ recommended)
- GPU recommended for faster YOLO inference

## 🛠️ Installation

### Local Development

```bash
# Navigate to backend directory
cd backend

# Make start script executable
chmod +x start.sh

# Run the start script (handles everything)
./start.sh
```

### Manual Installation

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
cd app && python main.py
```

## 🎯 API Endpoints

### Health Check
```
GET /health
```

### Analyze Image
```
POST /api/analyze
Content-Type: multipart/form-data

Body:
  - file: image file (JPEG, PNG, etc.)

Response:
{
  "is_manipulated": true,
  "confidence": 0.87,
  "manipulation_type": "ai_generated",
  "objects_detected": [...],
  "spatial_analysis": {...},
  "heatmap_base64": "data:image/png;base64,...",
  "manipulation_areas": [...],
  "ela_score": 0.82,
  "frequency_analysis": {...},
  "processing_time": 2.5
}
```

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔧 Configuration

### YOLO Model Selection

In `app/services/yolo_service.py`, you can change the YOLO model:

```python
# Options: yolo11n (fastest), yolo11s, yolo11m, yolo11l, yolo11x (most accurate)
self.model = YOLO('yolo11n.pt')
```

### ELA Quality

In `app/services/manipulation_detector.py`:

```python
self.ela_quality = 90  # JPEG quality for ELA (85-95 recommended)
```

## 🚀 Deployment

### Production Server

```bash
# Install dependencies
pip install -r requirements.txt

# Run with Gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
```

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables

```bash
# Optional configuration
export WORKERS=4
export PORT=8000
export LOG_LEVEL=info
```

## 📊 Performance

- **YOLO11n**: ~50ms per image on GPU, ~200ms on CPU
- **ELA Analysis**: ~100ms
- **Heatmap Generation**: ~150ms
- **Total**: ~300-500ms per image

## 🧪 Testing

```bash
# Test the API
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_image.jpg"
```

## 🔒 Security

- File type validation
- File size limits
- Temporary file cleanup
- CORS configuration for production

## 📝 Project Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI app
│   ├── models/
│   │   └── response_models.py     # Pydantic models
│   └── services/
│       ├── yolo_service.py        # YOLO11 detection
│       ├── manipulation_detector.py  # ELA, frequency, noise
│       └── heatmap_generator.py   # Heatmap visualization
├── requirements.txt
├── start.sh
└── README.md
```

## 🐛 Troubleshooting

### YOLO Model Download Issues

```bash
# Manually download YOLO11 weights
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolo11n.pt
```

### GPU Not Detected

```bash
# Check PyTorch CUDA
python -c "import torch; print(torch.cuda.is_available())"

# Install CUDA-enabled PyTorch
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

### Memory Issues

- Use smaller YOLO model (yolo11n instead of yolo11x)
- Resize large images before processing
- Increase system swap space

## 📈 Future Enhancements

- [ ] Multi-frame video analysis
- [ ] GAN-generated image detection
- [ ] Face manipulation detection
- [ ] Metadata analysis
- [ ] Blockchain verification
- [ ] Cloud storage for heatmaps

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for truth and authenticity**

