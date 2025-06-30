"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Upload, ArrowRight, Database } from "lucide-react"
import Image from "next/image"
import { AuthDialog } from "@/components/auth/auth-dialog"

interface Star {
  x: number
  y: number
  opacity: number
  twinkleSpeed: number
}

// Starfield component (same as verify page)
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const stars: Array<{ x: number; y: number; opacity: number; twinkle: number }> = []
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        opacity: Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * 0.02 + 0.005,
      })
    }

    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        star.opacity += star.twinkle
        if (star.opacity > 1 || star.opacity < 0.2) {
          star.twinkle = -star.twinkle
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fillRect(star.x, star.y, 1, 1)
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-60" />
}

export default function Home() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")

  useEffect(() => {}, [])

  const handleFileUpload = () => {
    router.push("/verify")
  }

  const handleLogin = () => {
    setAuthMode("login")
    setAuthDialogOpen(true)
  }

  const handleSignup = () => {
    setAuthMode("signup")
    setAuthDialogOpen(true)
  }

  return (
    <div className="min-h-screen max-h-screen bg-black text-white antialiased relative overflow-hidden">
      {/* Starfield Background */}
      <Starfield />

      {/* Navigation */}
      <nav className="relative z-10 py-2 sm:py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <button
                onClick={handleLogin}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5"
              >
                Log In
              </button>
              <button
                onClick={() => router.push("/deepfake-memory")}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 inline-flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                <span>Deepfake Memory</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-[calc(100vh-80px)] px-4 sm:px-6">
        <div className="text-center max-w-5xl mx-auto w-full">
          {/* Logo */}
          <div className="mb-1 sm:mb-1">
            <div className="relative group">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto mb-0 sm:mb-0 flex items-center justify-center">
                <Image
                  src="/verify-logo.png"
                  alt="Truth Intelligence"
                  width={150}
                  height={150}
                  className="drop-shadow-2xl filter brightness-110 w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40"
                />
              </div>
              <div className="mt-0">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white animate-pulse">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,1)] shadow-white/50 filter brightness-125 contrast-125">
                    Apex Verify AI
                  </span>
                </h2>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-2 mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight space-y-1">
              <div className="mb-1">
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                  World's first deepfake
                </span>
              </div>
              <div className="mb-1">
                <span className="bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-clip-text text-transparent">
                  detection for creators
                </span>
              </div>
              <div>
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                  Build trust with us.
                </span>
              </div>
            </h1>
          </div>

          {/* Mission Statement */}
          <div className="space-y-3 mb-4 w-full max-w-3xl mx-auto">
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed px-4 sm:px-0">
              We are building the world's first deepfake AI infrastructure — a foundational system for truth in the
              digital age.
            </p>
          </div>

          {/* File Upload Container */}
          <div className="mb-4 w-full max-w-3xl mx-auto px-2 sm:px-4">
            <div
              onClick={handleFileUpload}
              className="group relative w-full cursor-pointer transform transition-all duration-300 hover:scale-[1.01]"
            >
              {/* Main container */}
              <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 group-hover:border-white/20 transition-all duration-300 shadow-lg group-hover:shadow-xl overflow-hidden">
                {/* Subtle scan line effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

                {/* Minimal grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.05] group-hover:opacity-[0.12] transition-all duration-500"
                  style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                  }}
                ></div>

                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
                    <div className="relative">
                      {/* Minimalist upload icon */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 border border-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/30 transition-all duration-300">
                        <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-white/70 group-hover:text-white transition-all duration-300" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-white/90 transition-colors duration-300">
                        Verify Your Media for free by using AI !
                      </p>
                      <p className="text-white/50 group-hover:text-white/60 transition-colors duration-300 flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3">
                        <span className="text-xs sm:text-sm">Images, videos, and audio files supported</span>
                        <span className="hidden sm:block w-1 h-1 bg-white/30 rounded-full"></span>
                        <span className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full font-light">
                          Max 100MB
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Minimalist analyze button */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    <button className="relative bg-white/10 border border-white/20 text-white font-light hover:bg-white/15 hover:border-white/30 transition-all duration-300 flex items-center space-x-3 px-6 py-3 rounded-xl">
                      <span className="text-sm sm:text-base font-bold">Analyze</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Feature Pills */}
        </div>
        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultMode={authMode} />
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-sm bg-black/20"></footer>
    </div>
  )
}
