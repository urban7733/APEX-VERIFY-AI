FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    git \
    wget \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY runpod/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Clone SPAI repository
RUN git clone https://github.com/mever-team/spai.git /app/spai

# Download pretrained weights
COPY runpod/download_weights.py .
RUN python download_weights.py

# Copy handler and inference module
COPY runpod/handler.py .
COPY runpod/src/ ./src/

# Set environment
ENV PYTHONPATH="/app/spai:${PYTHONPATH}"

CMD ["python", "-u", "handler.py"]
