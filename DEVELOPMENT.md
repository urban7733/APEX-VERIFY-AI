# APEX VERIFY AI - Development Guide

## ⚠️ SECURITY WARNING
**NEVER commit API keys, passwords, or secrets to version control!**
- Your `.env` files are automatically ignored by git
- Keep your Gemini API key secure
- Use environment variables for all sensitive configuration

## 🚀 Quick Start

### 1. **Clone and Setup**
```bash
git clone https://github.com/urban7733/apexv0dev.git
cd apexv0dev
npm run setup
```

### 2. **Configure Environment Variables**
```bash
# Backend - Copy and edit with your API keys
cp backend/env.example backend/.env
# Edit backend/.env and add your GEMINI_API_KEY

# Frontend - Copy and edit with your backend URL
cp env.local.example app/.env.local
# Edit app/.env.local and set BACKEND_URL
```

### 3. **Start Development Environment**
```bash
# Start both frontend and backend
npm run full:dev

# Or start them separately:
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend  
npm run backend:dev
```

### 4. **Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🏗️ Project Structure

```
apexv0dev/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (proxies to FastAPI)
│   ├── verify/            # Image verification page
│   └── page.tsx           # Home page
├── backend/               # FastAPI backend
│   ├── services/          # AI services
│   │   ├── dinov3_service.py      # DINOv3 feature extraction
│   │   ├── gemini_service.py      # Gemini Pro Vision analysis
│   │   └── verification_orchestrator.py  # Pipeline coordination
│   ├── config/            # Configuration
│   ├── utils/             # Utility functions
│   └── main.py            # FastAPI app
├── components/            # React components
│   ├── ui/                # UI components (Radix UI)
│   ├── verification-results.tsx   # Results display
│   └── status-indicator.tsx       # Health status
└── lib/                   # Shared utilities
```

## 🔧 Configuration

### Environment Variables

**Frontend** (`.env.local`):
```bash
BACKEND_URL=http://localhost:8000
```

**Backend** (`.env`):
```bash
ENVIRONMENT=development
GEMINI_API_KEY=your_gemini_api_key_here
LOG_LEVEL=INFO
```

### API Keys Required

1. **Gemini Pro Vision API Key** (required for full functionality)
   - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Set in backend `.env` file
   - Without it, the service uses placeholder responses

## 🧪 Testing the System

### 1. **Health Check**
Visit `/api/health` to check system status

### 2. **Image Verification**
1. Go to http://localhost:3000/verify
2. Upload an image (JPG, PNG, WebP)
3. Click "Analyze Image"
4. View results

### 3. **Backend API Testing**
```bash
# Health check
curl http://localhost:8000/health

# Service status
curl http://localhost:8000/api/status

# Test image upload (replace with actual image)
curl -X POST http://localhost:8000/api/verify \
  -F "file=@test-image.jpg"
```

## 🔍 Development Workflow

### Frontend Development
- **Hot Reload**: Changes auto-refresh in browser
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Components**: Modular, reusable components

### Backend Development
- **Hot Reload**: Backend restarts on file changes
- **Async/Await**: Modern Python async patterns
- **Service Architecture**: Modular, testable services
- **Logging**: Comprehensive logging for debugging

### AI Pipeline Development
1. **DINOv3 Service**: Feature extraction and anomaly detection
2. **Gemini Service**: Content analysis and report generation
3. **Orchestrator**: Coordinates the entire pipeline

## 🐛 Debugging

### Frontend Issues
- Check browser console for errors
- Verify API endpoints are correct
- Check network tab for failed requests

### Backend Issues
- Check terminal for Python errors
- Verify environment variables
- Check FastAPI logs at http://localhost:8000/docs

### AI Service Issues
- Check service initialization logs
- Verify API keys are set
- Check model loading status

## 📦 Production Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
```

### Backend (Google Cloud)
```bash
# Set production environment
export ENVIRONMENT=production
export GEMINI_API_KEY=your_production_key

# Deploy to Google Cloud Run or App Engine
gcloud app deploy backend/
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

**⚠️ Security Reminder:** Never commit API keys or secrets. Always use environment variables.

## 📚 Resources

- **Next.js**: https://nextjs.org/docs
- **FastAPI**: https://fastapi.tiangolo.com/
- **DINOv3**: https://github.com/facebookresearch/dinov2
- **Gemini Pro Vision**: https://ai.google.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs

## 🆘 Getting Help

- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Documentation**: Check README.md and this guide

---

**Happy Coding! 🚀**
