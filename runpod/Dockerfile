FROM runpod/base:1.0.2-cuda1281-ubuntu2204

ENV DEBIAN_FRONTEND=noninteractive \
    SPAI_REPO_PATH=/opt/spai \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends git libgl1 libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

# Clone SPAI repository
RUN git clone --depth 1 https://github.com/mever-team/SPAI.git /opt/spai && \
    test -f /opt/spai/spai/__init__.py

# Install Python dependencies (SPAI + handler)
RUN pip install --upgrade pip && \
    pip install --no-cache-dir \
        runpod \
        pillow==10.4.0 \
        numpy>=1.24.0,<2.0.0 \
        torch==2.3.1 \
        torchvision==0.18.1 \
        gdown==5.1.0 \
        git+https://github.com/openai/CLIP.git && \
    pip install --no-cache-dir -r /opt/spai/requirements.txt && \
    pip install --no-cache-dir -e /opt/spai

# Download SPAI weights once at build time (cached in image)
RUN python - <<'PY'
from pathlib import Path
import gdown

weights_path = Path("/opt/spai/weights/spai.pth")
weights_path.parent.mkdir(parents=True, exist_ok=True)
if not weights_path.exists():
    gdown.download(
        "https://drive.google.com/uc?id=1vvXmZqs6TVJdj8iF1oJ4L_fcgdQrp_YI",
        str(weights_path),
        quiet=False,
    )
if not weights_path.exists() or weights_path.stat().st_size < 10 * 1024 * 1024:
    raise SystemExit("Failed to download SPAI weights")
PY

COPY runpod/handler.py /app/handler.py

CMD ["python", "-u", "/app/handler.py"]
