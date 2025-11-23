# RunPod Serverless Deployment Guide

This guide covers the GPU inference layer that now powers APEX VERIFY AI. RunPod hosts the SPAI (CVPR 2025) detector; Vercel handles uploads, metadata checks, and persistence.

```
Vercel (Next.js, CPU) ──▶ RunPod Serverless (SPAI on GPU) ──▶ Neon Postgres
```

## 1. Repository Layout

- `runpod/Dockerfile` – CUDA 12.1 base image + SPAI dependencies.
- `runpod/handler.py` – RunPod serverless entrypoint (`runpod.serverless.start`).
- `api/services/runpod_client.py` – Simple Python client for local smoke tests.

## 2. Prerequisites

- Docker 24+
- RunPod account with **Serverless** access
- RunPod API key (Settings → API Keys)

## 3. Build & Push Image

You can build locally and push to any registry supported by RunPod (Docker Hub, GHCR, etc.).

```bash
# 1. Build
docker build -t <registry>/<namespace>/apex-verify-spai:latest -f runpod/Dockerfile .

# 2. Push
docker push <registry>/<namespace>/apex-verify-spai:latest
```

> The Dockerfile clones the official SPAI repo, installs requirements, and downloads the `spai.pth` weights during build so warm boots are instant.

## 4. Create / Update RunPod Endpoint

1. Go to **RunPod Dashboard → Serverless → Create Endpoint**.
2. Select **Custom Image** and paste the pushed image reference.
3. Runtime: `python3.10` (already baked into the image via `runpod/base`).
4. GPU: T4 (8 GB) is sufficient; adjust based on cost/perf trade-offs.
5. Handler entrypoint: `handler.handler`.
6. After the endpoint is live, copy the **Sync Endpoint URL** (`https://api.runpod.ai/v2/<endpoint-id>/runsync`).

> For updates, push a new image tag and use "Update Endpoint" with the new reference.

## 5. Configure Vercel / Local Env

Add the following variables (all scopes in Vercel and in `.env.local`):

| Variable | Description |
| --- | --- |
| `RUNPOD_ENDPOINT_URL` | The `runsync` URL from RunPod |
| `RUNPOD_API_KEY` | Bearer token for the endpoint |
| `DATABASE_URL` | Neon connection string (optional but recommended) |

## 6. Testing the Endpoint

### Health Check

```bash
curl -X POST "$RUNPOD_ENDPOINT_URL" \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input":{"health_check":true}}'
```

You should see `{"status":"ok","message":"spai-ready"}` in the `output`.

### Sample Inference

```bash
BASE64_PIXEL="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

curl -X POST "$RUNPOD_ENDPOINT_URL" \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"input\":{\"image_base64\":\"$BASE64_PIXEL\"}}"
```

The response includes `score`, `probabilities`, and `is_ai_generated`.

## 7. Vercel Backend Integration

`app/api/analyze/route.ts` performs:

1. SHA-256 hash + Neon cache lookup
2. Metadata heuristics (`exifr`)
3. RunPod call (uses the env vars)
4. Result persistence

`app/api/health/route.ts` sends a `health_check` payload to RunPod and validates the Neon connection.

## 8. Cost & Scaling Notes

- RunPod bills per GPU-second; the handler loads SPAI once and keeps the weights in memory.
- Use T4 for cost efficiency; switch to A10G if you need faster inference.
- The Docker image already includes the weights, so cold starts only download dependencies when the endpoint is first created.

## 9. Troubleshooting

| Symptom | Action |
| --- | --- |
| `{"error":"Missing authorization"}` | Check `RUNPOD_API_KEY` |
| `ModuleNotFoundError: spai` | Ensure the Docker image built successfully and was deployed |
| Long cold starts | Keep the endpoint warm using the RunPod scheduler or periodic `health_check` |
| `/api/analyze` returns 503 | Inspect RunPod endpoint logs and Next.js function logs |

---

With the GPU layer on RunPod and CPU logic on Vercel, the system stays serverless end-to-end while keeping operating costs predictable. Update this guide whenever you publish a new container tag or change the endpoint configuration.***

