# Modal ML Pipeline Deployment

## 🎉 Simplified Architecture

\`\`\`
Vercel Frontend → Modal ML Pipeline (Direct)
\`\`\`

**No standalone backend required.** 🚀

---

## 🌐 Deployed URLs

### Modal ML Pipeline
\`\`\`
https://urban33133--apex-verify-ml-fastapi-app.modal.run
\`\`\`

**Endpoints:**
- `GET /` - Service info
- `GET /health` - Health check
- `POST /analyze` - Image analysis
- `POST /memory/lookup` - Retrieve cached verification by SHA-256

---

## 🚀 Quick Start

### 1. Deploy Modal Pipeline

\`\`\`bash
# Install Modal
pip install modal --user

# Authenticate
modal token new

# Deploy
modal deploy modal_ml_pipeline.py
\`\`\`

Your pipeline URL will be shown after deployment.

---

## 🔧 Vercel Configuration

### Set Environment Variable

In Vercel → Your Project → Settings → Environment Variables:

**Add:**
- **Name**: `NEXT_PUBLIC_MODAL_ML_URL`
- **Value**: `https://urban33133--apex-verify-ml-fastapi-app.modal.run`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

**Then Redeploy** Vercel for changes to take effect.

---

## 📊 What's Included

### Current Capabilities ✅
- **SPAI AI-Detection** (Spectral AI-generated image classifier via PyTorch on GPU)
- **Manipulation Detection Heuristics**
  - Error Level Analysis (ELA)
  - Frequency Domain Analysis
  - Noise Pattern Analysis
- **Heatmap Generation** (OpenCV blending)
- **Verification Memory**
  - Persistent `modal.Dict` storing SHA-256 fingerprints
  - `/memory/lookup` endpoint to surface prior verdicts instantly
- **Auto-scaling** (Modal serverless runtime)
- **GPU inference** (`T4` with 8 GB memory)

---

## 💰 Cost

| Service | Monthly Cost |
|---------|--------------|
| **Vercel** | $0 (Hobby) |
| **Modal** | ~$3-5 (1000 requests/day) |
| ~~Railway~~ | **$0 (Deleted!)** ✅ |
| **Total** | **~$3-5/month** |

**First $10/month FREE on Modal!** 🎁

---

## 🧪 Testing

### Test Modal Pipeline Locally

\`\`\`bash
# Test with an image
modal run modal_ml_pipeline.py::main --image-path test.jpg
\`\`\`

### Test Modal API

\`\`\`bash
# Health check
curl https://urban33133--apex-verify-ml-fastapi-app.modal.run/health

# Analyze image
curl -X POST https://urban33133--apex-verify-ml-fastapi-app.modal.run/analyze \
  -F "file=@test.jpg"
\`\`\`

---

## 📝 Development

### Update Modal Pipeline

1. Edit `modal_ml_pipeline.py`
2. Deploy: `modal deploy modal_ml_pipeline.py`
3. Changes live instantly! ⚡

### Local Development

\`\`\`bash
# Frontend (Next.js)
npm run dev

# Uses Modal ML Pipeline automatically
\`\`\`

---

## 🐛 Troubleshooting

### "ML Pipeline unavailable" in Frontend

**Check:**
1. Is Modal deployed? → Run `modal app list`
2. Is Vercel env var set? → Check `NEXT_PUBLIC_MODAL_ML_URL`
3. Did you redeploy Vercel? → After adding env var

**Fix:**
\`\`\`bash
# Redeploy Modal
modal deploy modal_ml_pipeline.py

# Redeploy Vercel
# Go to Vercel Dashboard → Deployments → Redeploy
\`\`\`

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
