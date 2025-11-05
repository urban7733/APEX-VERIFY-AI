# Modal ML Pipeline Deployment

## 🎉 Simplified Architecture

```
Vercel Frontend (Next.js + NextAuth) → Modal ML Pipeline (GPU) → Neon PostgreSQL (serverless)
```

**All inference still runs on Modal; Neon stores auth + verification history.** 🚀

---

## 🌐 Deployed URLs

### Modal ML Pipeline
```
https://urban33133--apex-verify-ml-fastapi-app.modal.run
```

**Endpoints:**
- `GET /` - Service info
- `GET /health` - Health check
- `POST /analyze` - Image analysis
- `POST /memory/lookup` - Retrieve cached verification by SHA-256

---

## 🚀 Quick Start

### 1. Deploy Modal Pipeline

```bash
# Install Modal
pip install modal --user

# Authenticate
modal token new

# Deploy
modal deploy modal_ml_pipeline.py
```

Your pipeline URL will be shown after deployment.

---

## 🔧 Vercel Configuration

### Configure Environment Variables

In Vercel → Your Project → Settings → Environment Variables **(all scopes)**:

| Name | Value |
| ---- | ----- |
| `NEXT_PUBLIC_MODAL_ML_URL` | `https://urban33133--apex-verify-ml-fastapi-app.modal.run` |
| `GOOGLE_CLIENT_ID` | OAuth client from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth secret |
| `NEXTAUTH_SECRET` | 32+ char random string (e.g. `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://<your-vercel-domain>` |
| `DATABASE_URL` | Neon pooled connection, e.g. `postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1` |
| `GMAIL_USER` | (Optional) contact mailbox |
| `GMAIL_APP_PASSWORD` | (Optional) Gmail app password |
| `CONTACT_FORWARD_EMAIL` | (Optional) Forwarding target |

Deploy after setting the variables. Locally mirror them in `.env.local`.

---

## 📊 What's Included

### Current Capabilities ✅
- **SPAI AI-Detection** (Spectral AI-generated image classifier via PyTorch on GPU)
- **Manipulation Detection Heuristics**
  - Error Level Analysis (ELA)
  - Frequency Domain Analysis
  - Noise Pattern Analysis
- **Heatmap Generation** (OpenCV blending)
- **Verification Memory Layering**
  - Modal `Dict` for low-latency cache
  - Neon PostgreSQL for durable audit history & analytics
- **Google OAuth via NextAuth** gating uploads before analysis
- **Auto-scaling** (Modal serverless runtime)
- **GPU inference** (`T4` with 8 GB memory)

---

## 💰 Cost

| Service | Monthly Cost |
|---------|--------------|
| **Vercel** | $0 (Hobby) |
| **Modal** | ~$3-5 (1000 requests/day) |
| **Neon (Starter)** | $0 (10M row reads / mo) |
| **Total** | **~$3-5/month** |

**First $10/month FREE on Modal!** 🎁

---

## 🧪 Testing

### Test Modal Pipeline Locally

```bash
# Test with an image
modal run modal_ml_pipeline.py::main --image-path test.jpg
```

### Test Modal API

```bash
# Health check
curl https://urban33133--apex-verify-ml-fastapi-app.modal.run/health

# Analyze image
curl -X POST https://urban33133--apex-verify-ml-fastapi-app.modal.run/analyze \
  -F "file=@test.jpg"
```

---

## 📝 Development

### Update Modal Pipeline

1. Edit `modal_ml_pipeline.py`
2. Deploy: `modal deploy modal_ml_pipeline.py`
3. Changes live instantly! ⚡

### Local Development

```bash
# Frontend (Next.js)
pnpm dev

# Ensure Prisma client is generated after schema changes
pnpm prisma generate
```

---

## 🐛 Troubleshooting

### "ML Pipeline unavailable" in Frontend

**Check:**
1. Is Modal deployed? → Run `modal app list`
2. Is Vercel env var set? → Check `NEXT_PUBLIC_MODAL_ML_URL`
3. Did you redeploy Vercel? → After adding env var

**Fix:**
```bash
# Redeploy Modal
modal deploy modal_ml_pipeline.py

# Redeploy Vercel
# Go to Vercel Dashboard → Deployments → Redeploy
```

### Modal Cold Start (~2-5s first request)

**Normal behavior!** Modal spins down containers when idle.

**Keep warm** (optional):
- Add a cron job to ping `/health` every 5 minutes
- Or upgrade to Modal Pro (always-on instances)

---

## 🎯 Architecture Benefits

✅ **Simplicity**: No backend server to maintain
✅ **Scalability**: Auto-scales from 0 to infinity
✅ **Cost**: Pay only for what you use
✅ **Speed**: Direct connection (no proxy)
✅ **Reliability**: Modal handles all infrastructure

---

## 📞 Support

- **Modal Docs**: https://modal.com/docs
- **Modal Slack**: https://modal.com/slack
- **Your Workspace**: https://modal.com/apps/urban33133

---

**Built with Modal 🚀**
