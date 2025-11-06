# Apex Verify AI

Apex Verify AI delivers production-grade authenticity checks for visual media. A streamlined Next.js frontend connects to a GPU-backed Modal pipeline that blends open-source detection (SPAI) with proprietary manipulation analysis. Our goal is to protect the creator economy as synthetic content floods every channel.

## Mission

Provide creators, journalists, and digital-rights teams with a decisive answer—authentic or manipulated—backed by transparent evidence. We start with still imagery and are expanding the same guarantees to audio, video, and generative artwork so trust can travel across every format.

## Product Snapshot

- Instant verdict for uploaded or linked images with confidence scoring
- Heatmaps and heuristics that expose suspicious regions
- Verification memory that fingerprints assets with SHA-256 and persists outcomes for auditing
- Frontend tuned for production workflows; no demo stubs or mock endpoints
- Operational guardrails: strict MIME checks, request timeouts, and structured error responses

## Architecture Overview

```
Next.js (App Router) ──► API routes (analyze, memory, health)
        │                                    │
        ▼                                    ▼
Prisma client                          Modal FastAPI (GPU)
        │                                    │
Neon PostgreSQL ◄────────────────────────► SPAI + heuristics + heatmaps
```

Key principles:
- One Python entrypoint (`modal_ml_pipeline.py`) owns the entire inference surface through FastAPI and Modal functions.
- Next.js API routes proxy uploads to Modal, persist results, and enforce operational limits.
- Neon provides durable verification records; Prisma exposes a typed client without introducing an extra backend tier.

## Pipeline Components

- **SPAI (HaoyiZhu/SPA)** for spectral AI detection, accelerated with CUDA when available.
- **ELA / frequency / noise heuristics** that combine into a manipulation confidence score.
- **Heatmap compositor** that renders overlays server-side and streams Base64 payloads to the UI.
- **Modal `Dict` memory** that caches results globally so repeated assets return instantly.
- **Configurable CORS** via `APEX_ALLOWED_ORIGINS`, restricting FastAPI access to trusted frontends.

## Data Handling and Security

- Only SHA-256 hashes and structured verdicts are persisted; raw media never leaves process memory.
- Endpoints validate MIME types, enforce size limits, and time out long-running requests.
- `.env*` files stay out of version control; deployment environments provide secrets.
- Contact email delivery is optional—no credentials means a controlled `503` response rather than a failed SMTP attempt.

## Local Development

```bash
pnpm install
pnpm dev    # http://localhost:3000

# Optional: serve the Modal pipeline locally
modal serve modal_ml_pipeline.py
```

Configure `.env.local` (see `env.local.example`):

```
NEXT_PUBLIC_MODAL_ML_URL=https://<your-modal-app>.modal.run
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1
GMAIL_USER=...                 # optional contact form
GMAIL_APP_PASSWORD=...         # optional contact form
CONTACT_FORWARD_EMAIL=...      # optional contact form override
```

When deploying the Modal app, set `APEX_ALLOWED_ORIGINS` to a comma-separated list of approved domains (for example `https://apexverify.ai,http://localhost:3000`).

## Deployment Checklist

1. **Modal** – build and deploy `modal_ml_pipeline.py`; confirm `/health` returns `200`.
2. **Neon** – provision a pooled connection URL and run `pnpm prisma migrate deploy`.
3. **Next.js (Vercel or equivalent)** – set required environment variables and trigger the production build.
4. **Smoke test** – upload authentic and synthetic samples; confirm verdicts, heatmaps, and database persistence.

## Roadmap

- Extend detection to generated audio, video, and mixed-media content.
- Launch longitudinal analytics: drift monitoring, precision/recall dashboards, alerting.
- Introduce optional authentication (Google Sign-In first) once the platform exceeds 10,000 active users.
- Offer partner APIs for automated content ingestion and verification at scale.

## Contributing

1. Fork the repository and create a feature branch.
2. Keep TypeScript and Python changes lint-clean (`pnpm lint`) and production-ready (`pnpm build`).
3. For pipeline updates, run `modal deploy --dry-run` before opening a pull request.

## License

Proprietary. Contact the Apex Verify AI team for licensing details.

