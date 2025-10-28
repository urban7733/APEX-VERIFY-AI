# APEX VERIFY AI - Development Guide

## ⚠️ SECURITY WARNING
**NEVER commit API keys, passwords, or secrets to version control!**
- Your `.env` files are automatically ignored by git
- Keep your API keys secure
- Use environment variables for all sensitive configuration

## 🚀 Quick Start

### 1. **Clone and Setup**
```bash
git clone https://github.com/urban7733/APEX-VERIFY-AI.git
cd APEX-VERIFY-AI-3
pnpm install
```

### 2. **Configure Environment Variables**
```bash
# Copy environment example
cp env.local.example .env.local
# Edit .env.local with your configuration
```

### 3. **Start Development Server**
```bash
pnpm dev
```

### 4. **Access the Application**
- **Frontend**: http://localhost:3000

## 🏗️ Project Structure

```
APEX-VERIFY-AI-3/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── verify/            # Image verification page
│   ├── mission/           # Mission page
│   ├── about/             # About page
│   ├── privacy/           # Privacy pages
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/                # UI components (shadcn/ui)
│   ├── auth/              # Authentication components
│   ├── verification-results.tsx
│   └── analysis_animation.tsx
├── lib/                   # Shared utilities
├── contexts/              # React contexts
├── public/                # Static assets
└── styles/                # Global styles
```

## 🔧 Configuration

### Environment Variables

**Frontend** (`.env.local`):
```bash
NEXT_PUBLIC_APP_NAME=APEX VERIFY AI
NEXT_PUBLIC_APP_VERSION=1.0.0

# Authentication (for future use)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Email Configuration (for contact form)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# External Services (for future use)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## 🔍 Development Workflow

### Frontend Development
- **Hot Reload**: Changes auto-refresh in browser
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Components**: Modular, reusable components

## 🐛 Debugging

### Frontend Issues
- Check browser console for errors
- Verify API endpoints are correct
- Check network tab for failed requests

## 📦 Production Deployment

### Build
```bash
pnpm build
```

### Deploy to Vercel
```bash
vercel deploy
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
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/

## 🆘 Getting Help

- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Documentation**: Check README.md and this guide

---

**Happy Coding! 🚀**
