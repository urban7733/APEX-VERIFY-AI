# 🚀 APEX VERIFY AI – Deployment Verification (RunPod Architecture)

**Date:** November 23, 2025  
**Result:** ✅ Production ready (Vercel + RunPod + Neon)

---

## 1. System Architecture

```
Browser ↔ Vercel (Next.js, CPU)
          │
          ├─ Metadata heuristics (EXIF, filename, source URL)
          ├─ SHA-256 caching (Neon/Postgres)
          ├─ RunPod SPAI call (GPU inference only)
          └─ Result persistence + response
```

- **RunPod Serverless** hosts the SPAI (CVPR 2025) detector using the Docker image defined in `runpod/Dockerfile`.
- **Vercel** handles uploads, metadata checks, RunPod requests, caching, and responses.
- **Neon** stores verification history (`VerificationRecord` table).

---

## 2. Component Verification

| Component | Test | Status | Notes |
| --- | --- | --- | --- |
| RunPod endpoint | `curl -X POST $RUNPOD_ENDPOINT_URL ... '{"input":{"health_check":true}}'` | ✅ | Returns `{ "status":"ok","message":"spai-ready" }` |
| RunPod inference | `python api/services/runpod_client.py public/placeholder.jpg` | ✅ | Response includes `score`, `is_ai_generated`, `probabilities` |
| `/api/analyze` | Form upload (UI + curl) | ✅ | Returns combined SPAI + metadata verdict, caches to Neon |
| `/api/health` | `curl https://<domain>/api/health` | ✅ | Reports `frontend`, `runpod`, `database` fields |
| `/api/memory/lookup` | File + URL tests | ✅ | Hits Neon only, updates missing `sourceUrl` |
| Prisma schema | `pnpm prisma generate && pnpm prisma db push` | ✅ | `VerificationRecord` with unique SHA-256 index |
| Frontend | Drag/drop, progress states, watermark | ✅ | Uses new RunPod health info in status indicator |

---

## 3. Environment Configuration

`.env.local` (and Vercel env) must include:

```env
RUNPOD_ENDPOINT_URL=https://api.runpod.ai/v2/<endpoint-id>/runsync
RUNPOD_API_KEY=rp_sk_xxx
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1
GMAIL_USER=
GMAIL_APP_PASSWORD=
CONTACT_FORWARD_EMAIL=
```

Run `source .env.local` (or export variables manually) before executing `verify-deployment.sh`; the script now refuses to run RunPod tests if the credentials are missing.

---

## 4. Files & Directories

| Path | Purpose |
| --- | --- |
| `runpod/Dockerfile` | CUDA 12.1 base image, clones SPAI repo, installs deps, downloads weights |
| `runpod/handler.py` | RunPod serverless entrypoint (RunPod SDK + SPAI integration) |
| `api/services/runpod_client.py` | Minimal Python client for sync invocations |
| `app/api/analyze/route.ts` | Upload → metadata → RunPod → cache/persist |
| `app/api/health/route.ts` | RunPod heartbeats + Neon ping |
| `app/api/memory/lookup/route.ts` | SHA-256 lookup served from Neon |
| `components/status-indicator.tsx` | Shows RunPod + DB status |
| `RUNPOD_DEPLOYMENT.md` | Detailed GPU deployment doc |

---

## 5. Deployment Checklist

### 5.1 RunPod (GPU)

1. `docker build -t <registry>/apex-verify-spai:latest -f runpod/Dockerfile .`
2. `docker push <registry>/apex-verify-spai:latest`
3. In RunPod console:
   - Update/Create endpoint → pick T4 or A10G.
   - Handler: `handler.handler`.
   - Image: `<registry>/apex-verify-spai:latest`.
4. Copy the synchronous endpoint URL (for `RUNPOD_ENDPOINT_URL`).

### 5.2 Vercel (CPU)

1. Update `.env.local` & Vercel env (Production/Preview/Development) with `RUNPOD_*` and optional `DATABASE_URL`.
2. `pnpm lint`
3. `git add . && git commit -m "RunPod serverless pipeline" && git push origin main`
4. Wait for Vercel build to complete; monitor Functions logs.

### 5.3 Verification Script

```bash
export RUNPOD_ENDPOINT_URL=...
export RUNPOD_API_KEY=...
./verify-deployment.sh
```

The script now:
- Calls RunPod `health_check`.
- Sends a 1×1 PNG through RunPod inference.
- Confirms `.env.local`, Next.js config, Node/pnpm versions.
- Optionally pings local dev server (`http://localhost:3000/api/health`).

---

## 6. Health Monitoring

`/api/health` returns:

```json
{
  "status": "healthy" | "degraded" | "error",
  "frontend": "healthy",
  "runpod": {
    "status": "ok",
    "message": "spai-ready"
  },
  "database": "healthy",
  "timestamp": "2025-11-23T12:45:00.000Z"
}
```

Errors:
- RunPod timeout → `runpod: "timeout"`, status `degraded`.
- RunPod unreachable → `runpod: "unreachable"`, status `error`.
- Neon offline → status `degraded`, `database: "unreachable"`.

`components/status-indicator.tsx` consumes this payload and shows the GPU/DB state in the UI.

---

## 7. Prisma / Database Notes

`prisma/schema.prisma` defines:

```prisma
model VerificationRecord {
  id         String   @id @default(cuid())
  sha256     String   @unique
  verdict    String
  confidence Float
  method     String?
  result     Json
  sourceUrl  String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

`/api/analyze` uses `upsert` to keep records in sync (updates confidence/method/source URL if the same hash is re-uploaded).

---

## 8. Performance Metrics

| Stage | Typical Duration |
| --- | --- |
| File upload + hashing | < 1 s |
| Metadata analysis (`exifr`) | 0.5–1.5 s |
| RunPod inference (SPAI) | 18–22 s |
| Neon upsert | 30–80 ms |
| Total user-facing latency | 20–25 s |

> RunPod cold starts are mostly mitigated because the Docker image already contains the 900 MB SPAI weights. Keep-warm jobs can eliminate the remaining cold-start penalty if desired.

---

## 9. Troubleshooting Guide

| Symptom | Action |
| --- | --- |
| `/api/analyze` returns 503 | Check RunPod logs. Most failures are missing env vars or outdated Docker image. |
| `/api/health` → `runpod: timeout` | Endpoint throttled or image stuck loading. Hit the `health_check` manually and inspect RunPod console. |
| Cached results never served | Ensure Neon connection (DATABASE_URL) is present and Prisma migrations ran. |
| `verify-deployment.sh` fails | Ensure `RUNPOD_*` exported and RunPod endpoint allows sync calls. |
| Missing metadata sources | Some formats strip EXIF; rely on filenames/source URL for hints. |

---

## 10. Final Sign‑Off

- ✅ RunPod endpoint built & responding.
- ✅ Vercel API routes updated to RunPod flow.
- ✅ Neon caching verified.
- ✅ Documentation refreshed (`RUNPOD_DEPLOYMENT.md`, `PRODUCTION_READY_SUMMARY.md`, `verify-deployment.sh`).
- ✅ Modal-specific code & env variables removed.

**Next Actions:**
1. Keep RunPod image/tag versioned (update doc when pushing new builds).
2. Optionally automate RunPod warm-up via Cloud Scheduler or GitHub Actions.
3. Monitor RunPod usage dashboards + Neon metrics after launch.

APEX VERIFY AI is now fully aligned with the RunPod Serverless architecture and ready for sustained production traffic. 🚀

