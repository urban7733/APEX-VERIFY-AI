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
    <div className="h-screen bg-black text-white antialiased relative overflow-hidden">
      {/* Starfield Background */}
      <Starfield />

      {/* Navigation */}
      <nav className="relative z-10 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <button
                onClick={handleLogin}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-lg hover:bg-white/5"
              >
                Log In
              </button>
              <button
                onClick={() => router.push("/deepfake-memory")}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-lg hover:bg-white/5 inline-flex items-center gap-1 sm:gap-2"
              >
                <Database className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Deepfake Memory</span>
                <span className="xs:hidden">Memory</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-[calc(100vh-60px)] px-4 sm:px-6">
        <div className="text-center max-w-5xl mx-auto w-full">
          {/* Logo */}
          <div className="mb-4 sm:mb-6">
            <div className="relative group">
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 mx-auto mb-1 sm:mb-2 flex items-center justify-center">
                <Image
                  src="/verify-logo.png"
                  alt="Truth Intelligence"
                  width={150}
                  height={150}
                  className="drop-shadow-2xl filter brightness-110 w-18 h-18 sm:w-24 sm:h-24 md:w-32 md:h-32"
                />
              </div>
              <div className="mt-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white animate-pulse">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,1)] shadow-white/50 filter brightness-125 contrast-125">
                    Apex Verify AI
                  </span>
                </h2>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-1 mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight tracking-tight space-y-1">
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
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl">
                  Build trust with us.
                </span>
              </div>
            </h1>
          </div>

          {/* Mission Statement */}
          <div className="mb-3 sm:mb-4 w-full max-w-3xl mx-auto">
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
              <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-3 sm:p-4 md:p-6 group-hover:border-white/20 transition-all duration-300 shadow-lg group-hover:shadow-xl overflow-hidden">
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

                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
                    <div className="relative">
                      {/* Minimalist upload icon */}
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/5 border border-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/30 transition-all duration-300">
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white/70 group-hover:text-white transition-all duration-300" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm sm:text-base md:text-lg font-bold text-white mb-1 group-hover:text-white/90 transition-colors duration-300">
                        Verify Your Media for free by using AI !
                      </p>
                      <p className="text-white/50 group-hover:text-white/60 transition-colors duration-300 flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3">
                        <span className="text-xs sm:text-sm">Images, videos, and audio files supported</span>
                        <span className="hidden sm:block w-1 h-1 bg-white/30 rounded-full"></span>
                        <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-full font-light">
                          Max 100MB
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Minimalist analyze button */}
                  <div className="relative w-full sm:w-auto">
                    <div className="absolute inset-0 bg-white/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    <button className="relative bg-white/10 border border-white/20 text-white font-light hover:bg-white/15 hover:border-white/30 transition-all duration-300 flex items-center justify-center space-x-2 px-4 sm:px-5 py-2 rounded-xl w-full sm:w-auto">
                      <span className="text-sm sm:text-base font-bold">Analyze</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultMode={authMode} />
      </div>
    </div>
  )
}
