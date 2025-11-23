# Apex Verify AI – Development Guide

This document captures the lean workflow for the current **Vercel (CPU) ↔ RunPod Serverless (GPU)** architecture. The frontend handles uploads, metadata checks, and persistence; RunPod hosts the SPAI inference engine on dedicated GPUs.

## 1. Prerequisites

- Node.js ≥ 18.18 with pnpm 10
- Docker (needed to build the RunPod container)
- RunPod account + API key
- Optional: Gmail app password for the contact form

## 2. Local Setup

```
pnpm install
cp env.local.example .env.local   # add RunPod + DB credentials
pnpm dev                          # http://localhost:3000
```

Required env values:

- `RUNPOD_ENDPOINT_URL` → `https://api.runpod.ai/v2/<endpoint-id>/runsync`
- `RUNPOD_API_KEY` → Serverless API token
- `DATABASE_URL` → Neon / Postgres connection string

## 3. RunPod GPU Pipeline

- Python code lives in `runpod/handler.py`.
- Build the CUDA image defined in `runpod/Dockerfile` and push it to RunPod (see `RUNPOD_DEPLOYMENT.md`).
- The handler loads the official SPAI weights, performs inference, and returns the raw ML verdict. No metadata logic runs on GPU.

## 4. Backend / Frontend Notes

- `/api/analyze` now:
  1. Hashes the image + checks Prisma for cached verdicts.
  2. Runs metadata heuristics (EXIF + filename / URL keywords).
  3. Calls RunPod for SPAI inference.
  4. Persists combined results in Neon.
- `/api/memory/lookup` serves purely from Neon (Modal Dict is gone).
- `/api/health` pings RunPod with a `health_check` payload and verifies DB reachability.
- Lint via `pnpm lint`; type-check with `pnpm tsc --noEmit` if desired.

## 5. Environment Variables

| Variable | Purpose |
| --- | --- |
| `RUNPOD_ENDPOINT_URL` | Serverless synchronous endpoint (`.../runsync`) |
| `RUNPOD_API_KEY` | Bearer token used by API routes and health checks |
| `DATABASE_URL` | Neon/Postgres URL |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Optional contact form creds |
| `CONTACT_FORWARD_EMAIL` | Optional override recipient |

## 6. Deployment Checklist

1. Build & push the RunPod image (`runpod/Dockerfile`).
2. Create/Update the RunPod endpoint and capture the `runsync` URL.
3. Update `RUNPOD_*` + `DATABASE_URL` in the Vercel project.
4. `git push` → verify `/api/health` and `/api/analyze` in production.

## 7. Troubleshooting

| Symptom | Action |
| --- | --- |
| `/api/analyze` returns 503 | Confirm RunPod endpoint + API key; inspect RunPod logs for import errors. |
| Health route shows `runpod: timeout` | Endpoint might be asleep or misconfigured—send a manual `health_check` payload to warm it. |
| Cache misses repeatedly | Ensure the file bytes match (no EXIF rewrites) and Neon is reachable. |
| Contact form fails | Provide `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `CONTACT_FORWARD_EMAIL`. |

## 8. Coding Standards

- Ship production-ready code—no demo modes.
- Keep TypeScript types aligned with the RunPod response schema.
- Prefer small, composable modules to keep the surface area maintainable.

## 9. Getting Help

- **RunPod docs**: https://docs.runpod.io
- **Next.js docs**: https://nextjs.org/docs
- **SPAI paper / repo**: https://github.com/mever-team/spai

---

Ship with confidence. 🚀
