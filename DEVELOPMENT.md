# Apex Verify AI – Development Guide

This document captures the lean workflow for working on the current **Vercel ↔ Modal** architecture. All legacy backend instructions have been removed.

## 1. Prerequisites

- Node.js ≥ 18.18 with pnpm 10
- Modal CLI authenticated (`modal token set ...`)
- Optional: Gmail app password if you want to exercise the contact form

## 2. Local Setup

```bash
pnpm install
cp env.local.example .env.local   # edit values as needed
pnpm dev                          # http://localhost:3000
```

Point `NEXT_PUBLIC_MODAL_ML_URL` at either a deployed Modal app or a locally served instance:

```bash
modal serve modal_ml_pipeline.py
# copy the printed URL into NEXT_PUBLIC_MODAL_ML_URL
```

## 3. Modal Pipeline Development

- `modal_ml_pipeline.py` owns the full ML flow (SPAI + heuristics + heatmap).
- Use `modal run modal_ml_pipeline.py::main --image-path sample.jpg` to trigger local entry points.
- After edits, redeploy with `modal deploy modal_ml_pipeline.py`.
- Watch logs at https://modal.com/apps to verify cold starts and GPU usage.

## 4. Frontend Development Notes

- `/api/analyze` is the only code path that hits Modal; keep the proxy thin and resilient.
- Avoid reintroducing client-side randomness or mock data—always defer to Modal responses.
- Lint with `pnpm lint`, type-check with `pnpm tsc --noEmit` if desired.

## 5. Environment Variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_MODAL_ML_URL` | Base URL of the Modal FastAPI app (required) |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Enable the `/api/contact` route (optional) |
| `CONTACT_FORWARD_EMAIL` | Override the default recipient for contact emails (optional) |

The contact route returns `503` if credentials are missing, so deployments stay safe by default.

## 6. Deployment Checklist

1. `modal deploy modal_ml_pipeline.py`
2. Push to Git / trigger Vercel build (environment variables must be configured there)
3. Sanity test: upload a genuine and an AI-generated image on production and review SPAI confidence + heatmap

## 7. Troubleshooting

| Symptom | Action |
| --- | --- |
| `/api/analyze` times out | Check Modal logs for cold-start or import errors; confirm URL + credentials |
| SPAI result missing | Ensure GPU is available; verify container includes PyTorch + transformers |
| Contact form fails | Set `GMAIL_USER` and `GMAIL_APP_PASSWORD` (16-char app password) |

## 8. Coding Standards

- Treat every change as production-bound; no demo code or randomization.
- Use TypeScript types for API payloads where possible.
- Prefer pure functions and modular components to keep the surface area maintainable.

## 9. Getting Help

- **Modal docs**: https://modal.com/docs
- **Next.js docs**: https://nextjs.org/docs
- **SPAI paper / repo**: https://github.com/mever-team/spai

---

Ship with confidence. 🚀

