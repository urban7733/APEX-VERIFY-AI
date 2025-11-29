FROM runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    SPAI_REPO_PATH=/opt/spai \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends git libgl1 libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

# Clone SPAI repository
RUN git clone --depth 1 https://github.com/mever-team/SPAI.git /opt/spai

# Install Python dependencies step by step
RUN pip install --upgrade pip

# Install runpod and basic deps first
RUN pip install --no-cache-dir runpod gdown

# Install SPAI requirements
RUN pip install --no-cache-dir -r /opt/spai/requirements.txt || true

# Install SPAI as editable package
RUN pip install --no-cache-dir -e /opt/spai || true

# Download SPAI weights
RUN python -c "
from pathlib import Path
import gdown
weights_path = Path('/opt/spai/weights/spai.pth')
weights_path.parent.mkdir(parents=True, exist_ok=True)
if not weights_path.exists():
    gdown.download('https://drive.google.com/uc?id=1vvXmZqs6TVJdj8iF1oJ4L_fcgdQrp_YI', str(weights_path), quiet=False)
print('Weights downloaded!' if weights_path.exists() else 'Download failed')
"

# Copy handler
COPY runpod/handler.py /app/handler.py

CMD ["python", "-u", "/app/handler.py"]
