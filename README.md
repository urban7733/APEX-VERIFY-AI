# APEX VERIFY AI

APEX VERIFY AI is a cutting-edge image authenticity verification platform built for the creator economy. Our mission is to restore trust in digital content by empowering creators to prove their work is authentic.

## 🎯 Mission

In a time when artificial intelligence can generate endless content, the line between what's real and what's synthetic is fading fast. We're building the new standard for authenticity in the digital world.

APEX VERIFY AI empowers creative artists, photographers, filmmakers, and brands to prove that their work is truly theirs — created by human imagination, not algorithms.

## 🚀 Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible component library
- **TypeScript** - Type-safe development

## 🎨 Features

- **Drag & Drop Interface** - Intuitive image upload
- **Beautiful UI** - Modern, minimalist design with glassmorphism
- **Responsive Design** - Works perfectly on all devices
- **Smooth Animations** - Scroll-based parallax effects
- **Mission-Driven** - Clear communication of our purpose

## 🔐 Security & Configuration

### Environment Variables
This project uses environment variables for sensitive configuration. **Never commit API keys or secrets to version control.**

**Required Environment File:**
- `.env.local` - Frontend configuration

**Example Environment:**
```bash
# Copy env.local.example to .env.local and fill in your values
NEXT_PUBLIC_APP_NAME=APEX VERIFY AI
NEXT_PUBLIC_APP_VERSION=1.0.0

# Authentication (for future use)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Email Configuration (for contact form)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/urban7733/APEX-VERIFY-AI.git
   cd APEX-VERIFY-AI-3
   ```

2. **Set up environment variables**
   ```bash
   cp env.local.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000

### Production Deployment

```bash
# Build frontend
pnpm build

# Deploy to Vercel (recommended)
vercel deploy
```

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

We believe the future doesn't belong to AI itself, but to those who can prove they create for real.

---

**APEX VERIFY AI** - Because Truth Matters.
