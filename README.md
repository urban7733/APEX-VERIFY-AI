# Apex Verify AI

Apex Verify AI is a deepfake verification platform focused on the creator economy. 
## Architecture

\`\`\`
Next.js + Tailwind (frontend)
        |
REST API
        |
FastAPI (backend)
        |
AI Pipeline Orchestrator
        |-- Content Preprocessor
        |-- Model Router
        |-- Inference Runner
        |-- Aggregator / Scorer
        |-- Watermark Injector
        |-- Audit Logger

Postgres + pgvector (embeddings & metadata)
Redis + Celery (background tasks)
MinIO/S3 (storage)
\`\`\`

The AI pipeline is fully pluggable so that new detection models can be added easily. Verified content and user feedback are stored for future auto‑retraining.

## Development

Requirements:
- Node.js 18+
- Python 3.11+
- Docker (for local services)

### Setup

\`\`\`bash
pnpm install
# build and run backend services
docker compose up --build
\`\`\`

The FastAPI server will be available at `http://localhost:8000`. A health check is provided at `/health` and content can be verified via `/api/verify`.

### Backend

The backend lives in `backend/` and can also be run directly:

\`\`\`bash
pip install -r backend/requirements.txt
uvicorn app.main:app --reload
\`\`\`

### Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

Contributions are welcome! Please open an issue first to discuss any significant changes.
