# APEX VERIFY AI

**Apex Verify AI** delivers production-grade authenticity checks for AI-generated imagery. A polished Next.js experience connects directly to a GPU-backed Modal pipeline that runs SPAI (Spectral AI-generated Image detection) plus proprietary manipulation analysis.

## 🎯 Mission

Creators, journalists, and digital-rights teams need a single verdict: **Verified** or **Manipulated**. Apex Verify AI delivers that answer in seconds and packages the result with transparent confidence scores and heatmaps that expose suspicious regions.

## 🏗️ Architecture

```
Next.js 14 (Vercel) ──┐
                     ├── /api/analyze  ──► Modal FastAPI app (GPU)
                     └── /api/memory/lookup ─► Modal FastAPI app (Memory)
Modal ML Pipeline ───┘          ├── SPAI (Spectral AI detector)
                                ├── ELA / Frequency / Noise heuristics
                                ├── Heatmap compositor (OpenCV + Pillow)
                                └── Persistent modal.Dict verification memory
```

Key notes:
- No standalone backend service. All ML inference happens inside Modal functions with automatic scaling.
- The frontend sends multipart uploads to the Next.js API route `/api/analyze`, which safely proxies requests to Modal and handles timeouts and error reporting.
- SPAI runs on PyTorch with CUDA (T4) when available; the pipeline gracefully falls back to CPU if necessary.

## 🚀 Technology Stack

### Frontend
- **Next.js 14 + App Router**
- **React 18** client components for upload, preview, and results
- **Tailwind CSS** + **shadcn/ui** primitives for consistent styling
- **Lucide Icons** for accessible iconography

### Modal ML Pipeline (`modal_ml_pipeline.py`)
- **Modal App** with GPU-ready Debian base image
- **PyTorch + Transformers** to load SPAI (`HaoyiZhu/SPA`)
- **OpenCV, Pillow, NumPy** for preprocessing, ELA, frequency, and noise analysis
- **FastAPI** exposed via `@modal.asgi_app()` with `/`, `/health`, `/analyze`, and `/memory/lookup`

## ✨ Core Features

- Drag-and-drop uploads with instant preview and watermark downloads
- SPAI-based AI-generated detection with probability distribution
- Combined ELA/Frequency/Noise heuristics for manipulation confidence
- Heatmap overlays rendered server-side and streamed as Base64
- Verification memory that stores SHA-256 fingerprints and prior verdicts for instant recall
- Responsive, mobile-first UI without inline demo data or randomization

## 🔧 Configuration

Create an `.env.local` (see `env.local.example`) and set:

\`\`\`
NEXT_PUBLIC_MODAL_ML_URL=https://<your-modal-app>.modal.run
GMAIL_USER=alerts@example.com              # optional: enables contact form
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx        # 16-char Gmail app password
CONTACT_FORWARD_EMAIL=team@example.com     # optional override
\`\`\`

If email credentials are omitted, the contact endpoint responds with `503` instead of attempting delivery.

## 🛠️ Local Development

\`\`\`bash
pnpm install
pnpm dev
# visit http://localhost:3000
\`\`\`

Point `NEXT_PUBLIC_MODAL_ML_URL` at a deployed Modal app or run locally with `modal serve modal_ml_pipeline.py`.

## 🔁 Deployment Workflow

1. **Modal** – `modal deploy modal_ml_pipeline.py` to publish the latest container with SPAI and dependencies.
2. **Next.js (Vercel)** – set environment variables (`NEXT_PUBLIC_MODAL_ML_URL`, contact email creds) and trigger a Vercel deploy.
3. **Smoke test** – upload both a genuine image and a synthetic sample, confirm SPAI output, and verify `GET /health` returns `{"status":"healthy"}`.

## 📡 API Surface

| Endpoint | Description |
| --- | --- |
| `POST /api/analyze` | Next.js route that forwards multipart uploads to Modal and returns analysis JSON |
| `POST /api/memory/lookup` | Hashes uploads/URLs, queries Modal verification memory, and returns historic verdicts |
| `POST /api/contact` | Optional contact form handler (requires Gmail app credentials) |
| `GET https://<modal-app>.modal.run/health` | Modal health probe |

Typical `/api/analyze` response:

\`\`\`json
{
  "is_manipulated": false,
  "is_ai_generated": false,
  "confidence": 0.18,
  "heatmap_base64": "...",
  "ai_detection": {
    "status": "ok",
    "label": "authentic",
    "score": 0.12
  },
  "manipulation_detection": {
    "ela_score": 0.24,
    "frequency_score": 0.19,
    "noise_score": 0.21
  }
}
\`\`\`

## 🔒 Security Notes

- Uploaded binaries are processed in-memory; we persist only the cryptographic SHA-256 fingerprint plus the structured verdict inside a secured `modal.Dict` (no raw media is stored).
- Modal validates MIME types and rejects non-image uploads.
- The frontend enforces a 60‑second timeout and displays actionable errors.
- Contact email sending is disabled unless credentials are provided.
- `.env*` files remain git-ignored; secrets never belong in version control.

## 🤝 Contributing

1. Fork the repository
2. Create a branch (`git checkout -b feature/<name>`)
3. Implement changes with linted TypeScript/Python
4. Run `pnpm lint && pnpm build` (optional) and `modal deploy --dry-run` when touching the pipeline
5. Open a Pull Request with testing notes

## 📄 License

Proprietary – all rights reserved. Contact the maintainers for licensing inquiries.

---

**Apex Verify AI** – Because synthetic media still needs a referee.
