# APEX VERIFY AI

APEX VERIFY AI is a cutting-edge image authenticity verification platform built for the creator economy. Our mission is to restore trust in digital content by providing enterprise-grade AI verification using Meta's DINOv3 and Google's Gemini Pro Vision.

## 🎯 Mission

In a world where AI-generated content is becoming indistinguishable from reality, APEX VERIFY AI provides the infrastructure for truth. We serve content creators, journalists, and social media managers who need to verify image authenticity with confidence.

## 🏗️ Architecture

```
Next.js + Tailwind (Frontend) 
    ↓
REST API 
    ↓
FastAPI (Backend) 
    ↓
AI Pipeline Orchestrator
    ├── DINOv3 Feature Extraction
    ├── Anomaly Detection
    ├── Gemini Pro Vision Analysis
    └── Authenticity Scoring
    ↓
PostgreSQL + pgvector (Metadata & Embeddings)
Redis + Celery (Background Tasks)
MinIO/S3 (File Storage)
```

## 🚀 Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **TypeScript** - Type-safe development

### Backend
- **FastAPI** - High-performance Python web framework
- **DINOv3** - Meta's 25GB vision transformer for feature extraction
- **Gemini Pro Vision** - Google's multimodal AI for contextual analysis
- **PostgreSQL + pgvector** - Vector database for embeddings
- **Redis + Celery** - Task queue and caching
- **MinIO/S3** - Object storage for media files

## 🎨 Features

- **Drag & Drop Interface** - Intuitive image upload
- **Real-time Analysis** - GPU-accelerated processing
- **Comprehensive Reports** - Human-readable verification results
- **Enterprise Security** - SOC 2 compliant infrastructure
- **Scalable Architecture** - Built for high-volume verification

## 🔐 Security & Configuration

### Environment Variables
This project uses environment variables for sensitive configuration. **Never commit API keys or secrets to version control.**

**Required Environment Files:**
- `backend/.env` - Backend configuration (API keys, database URLs)
- `app/.env.local` - Frontend configuration (backend URL)

**Example Backend Environment:**
```bash
# Copy backend/env.example to backend/.env and fill in your values
GEMINI_API_KEY=your_gemini_api_key_here
ENVIRONMENT=development
LOG_LEVEL=INFO
```

**Example Frontend Environment:**
```bash
# Copy env.local.example to app/.env.local and fill in your values
BACKEND_URL=http://localhost:8000
```

### API Keys Required
1. **Gemini Pro Vision API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Database Connection** - PostgreSQL connection string (for production)
3. **Storage Credentials** - S3/MinIO credentials (for production)

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- GPU access (for DINOv3 inference)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/urban7733/apexv0dev.git
   cd apexv0dev
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp backend/env.example backend/.env
   # Edit backend/.env with your API keys
   
   # Frontend
   cp env.local.example app/.env.local
   # Edit app/.env.local with your backend URL
   ```

3. **Install dependencies**
   ```bash
   npm run setup
   ```

4. **Start development services**
   ```bash
   # Start both frontend and backend
   npm run full:dev
   
   # Or start them separately:
   npm run dev          # Frontend
   npm run backend:dev  # Backend
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Production Deployment

```bash
# Build frontend
npm run build

# Deploy backend to cloud (Google Cloud recommended)
gcloud app deploy backend/

# Set environment variables
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
export GEMINI_API_KEY="your-production-gemini-key"
export DATABASE_URL="postgresql://user:pass@host:port/db"
```

## 📊 API Endpoints

- `GET /` - Service information
- `GET /health` - Health check with model status
- `POST /api/verify` - Image authenticity verification

## 🔒 Security

- CORS enabled for cross-origin requests
- File type validation (images only)
- Rate limiting and request validation
- Secure file handling with temporary storage
- Environment variable protection
- API key security best practices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**⚠️ Security Note:** Never commit API keys, passwords, or other secrets. Use environment variables and ensure `.env` files are in `.gitignore`.

## 📄 License

This project is proprietary software. All rights reserved.

## 🌟 About

APEX VERIFY AI is built by a team passionate about restoring trust in digital content. We believe that in the age of AI, verification becomes the foundation of truth.

---

**APEX VERIFY AI** - Because Truth Matters.
