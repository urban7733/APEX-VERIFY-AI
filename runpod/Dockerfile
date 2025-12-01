# NOTE: RunPod serverless workers expose CUDA 11.8 drivers, so we need the 11.8-compatible image.
FROM pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime

WORKDIR /app

# WICHTIG: Noninteractive mode für apt-get (verhindert tzdata Prompt)
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    wget \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY runpod/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Clone SPAI repository
RUN git clone --depth=1 https://github.com/mever-team/spai.git /app/spai

# Install SPAI dependencies
RUN pip install --no-cache-dir -r /app/spai/requirements.txt \
    && pip install --no-cache-dir -e /app/spai

# Download pretrained weights
COPY runpod/download_weights.py .
RUN python download_weights.py

# Copy handler and inference module
COPY runpod/handler.py .
COPY runpod/src/ ./src/

# Set environment
ENV PYTHONPATH="/app/spai:${PYTHONPATH}"

CMD ["python", "-u", "handler.py"]
