"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Upload, ArrowRight } from "lucide-react"
import Image from "next/image"
import { AuthDialog } from "@/components/auth/auth-dialog"
import dynamic from "next/dynamic"

// Dynamically import Orb to prevent SSR issues with ogl
const Orb = dynamic(() => import("@/components/Orb"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-3xl" />
})

export default function Home() {
  const router = useRouter()

  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [showMission, setShowMission] = useState(false)

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

  const handleMissionClick = () => {
    setShowMission(!showMission)
  }

  if (showMission) {
    return (
      <div className="min-h-screen text-white antialiased relative overflow-hidden">
        <div className="absolute inset-0 z-0 scale-150 sm:scale-100 -translate-y-20 sm:-translate-y-10">
          <Orb hoverIntensity={0.5} rotateOnHover={true} hue={0} forceHoverState={false} />
        </div>

        <div className="absolute inset-0 z-0 bg-black/40 sm:bg-black/20" />

        <nav className="relative z-10 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image
                  src="/neon-triangle-logo-grey-bg.png"
                  alt="Apex Verify AI"
                  width={28}
                  height={28}
                  className="opacity-90 mix-blend-screen"
                />
                <span className="text-lg font-medium text-white">Apex Verify AI</span>
              </div>

              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setShowMission(false)}
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Back to Home
                </button>
                <button
                  onClick={handleLogin}
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Log In
                </button>
                <button
                  onClick={handleSignup}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg text-white text-sm font-medium transition-all duration-200"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 pt-24 sm:pt-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <div className="relative inline-block">
                  <Image
                    src="/apex-verify-neon-logo-hero.png"
                    alt="Apex Verify AI"
                    width={120}
                    height={120}
                    className="relative z-10 mx-auto drop-shadow-2xl mix-blend-screen w-24 h-24 sm:w-30 sm:h-30"
                  />
                </div>

                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">
                      Our Mission
                    </span>
                  </h1>
                </div>
              </div>

              <div className="relative group">
                <div className="relative bg-black/50 sm:bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-12 shadow-2xl">
                  <div className="prose prose-lg max-w-none space-y-6 text-left">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Apex Verify – Proof You Can Trust</h2>

                    <p className="text-white/95 sm:text-white leading-relaxed text-base sm:text-lg">
                      In a world full of fake photos and AI-generated videos, it's harder than ever to know what's real.
                      Apex Verify AI brings back trust by verifying digital content with speed and precision.
                    </p>

                    <div className="space-y-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-white">How It Works</h3>

                      <div className="space-y-3 text-white/95 sm:text-white">
                        <p>
                          <strong>Check Authenticity</strong> – Scan images and videos for AI generation, edits, or
                          manipulation.
                        </p>
                        <p>
                          <strong>Trace the Source</strong> – Find when and where the content first appeared.
                        </p>
                        <p>
                          <strong>Confirm the Creator</strong> – Link media to the verified author when possible.
                        </p>
                        <p>
                          <strong>Show the Evidence</strong> – Provide direct proof from trusted sources.
                        </p>
                        <p>
                          <strong>Seal the Truth</strong> – Only media scoring 95%+ authenticity earns the Apex Verify™
                          Seal.
                        </p>
                      </div>
                    </div>

                    <p className="text-white/95 sm:text-white leading-relaxed">
                      We don't just detect fakes—we uncover the real story. From viral videos to critical news, we make
                      the truth visible and strip away misinformation's power.
                    </p>

                    <p className="text-base sm:text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      "For years, we paid to hide watermarks. Now, we invest to secure our identity."
                    </p>

                    <p className="text-base sm:text-lg font-bold text-white">Apex Verify AI – Because Truth Matters.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultMode={authMode} />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white antialiased relative">
      <div className="absolute inset-0 z-0 scale-150 sm:scale-100">
        <Orb hoverIntensity={0.5} rotateOnHover={true} hue={0} forceHoverState={false} />
      </div>

      <div className="absolute inset-0 z-0 bg-black/30 sm:bg-black/20" />

      <nav className="relative z-10 py-2 sm:py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={handleMissionClick}
                className="bg-black border border-white/20 text-white hover:bg-black/80 hover:border-white/30 transition-all duration-200 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg"
              >
                <span className="hidden sm:inline">Our Mission</span>
                <span className="sm:hidden">Mission</span>
              </button>
              <button
                onClick={handleLogin}
                className="bg-black border border-white/20 text-white hover:bg-black/80 hover:border-white/30 transition-all duration-200 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg"
              >
                <span className="hidden sm:inline">Log In</span>
                <span className="sm:hidden">Login</span>
              </button>
              <button
                onClick={() => router.push("/deepfake-memory")}
                className="bg-black border border-white/20 text-white hover:bg-black/80 hover:border-white/30 transition-all duration-200 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg"
              >
                <span className="hidden sm:inline">Deepfake Memory</span>
                <span className="sm:hidden">Memory</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 py-8">
        <div className="text-center max-w-5xl mx-auto w-full">
          <div className="mb-1 sm:mb-1">
            <div className="relative group">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto mb-0 sm:mb-0 flex items-center justify-center">
                <Image
                  src="/apex-verify-neon-logo-v2.png"
                  alt="Truth Intelligence"
                  width={150}
                  height={150}
                  className="drop-shadow-2xl filter brightness-110 w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 mix-blend-screen"
                />
              </div>
              <div className="-mt-2">
                <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,1)] shadow-white/50 filter brightness-125 contrast-125">
                    Apex Verify AI
                  </span>
                </h2>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight space-y-1">
              <div className="mb-1">
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                  World's first deepfake
                </span>
              </div>
              <div className="mb-1">
                <span className="bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">
                  detection for creators
                </span>
              </div>
              <div>
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent text-lg sm:text-2xl md:text-3xl lg:text-4xl drop-shadow-lg">
                  Build trust with us.
                </span>
              </div>
            </h1>
          </div>

          <div className="space-y-3 mb-4 w-full max-w-3xl mx-auto">
            <p className="text-xs sm:text-sm text-gray-100 font-medium max-w-xl mx-auto leading-relaxed px-4 sm:px-0 drop-shadow-md">
              We are building the world's first deepfake AI infrastructure — a foundational system for truth in the
              digital age.
            </p>
          </div>

          <div className="mb-4 w-full max-w-md mx-auto px-2 sm:px-4">
            <div
              onClick={handleFileUpload}
              className="group relative w-full h-16 sm:h-16 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="relative w-full h-full bg-gradient-to-r from-white/[0.08] via-white/[0.12] to-white/[0.08] backdrop-blur-md border-2 border-white/20 rounded-2xl sm:rounded-3xl overflow-hidden group-hover:bg-gradient-to-r group-hover:from-white/[0.12] group-hover:via-white/[0.18] group-hover:to-white/[0.12] group-hover:border-white/30 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/15 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10 flex items-center justify-between h-full px-4 sm:px-4 gap-2 sm:gap-3">
                  <div className="flex items-center space-x-3 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-8 sm:h-8 bg-gradient-to-br from-white/20 to-white/10 border border-white/30 rounded-lg sm:rounded-lg flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-white/30 group-hover:to-white/20 group-hover:border-white/40 transition-all duration-300 group-hover:scale-110">
                      <Upload className="w-4 h-4 sm:w-4 sm:h-4 text-white/80 group-hover:text-white transition-colors duration-200" />
                    </div>
                    <div className="space-y-0 sm:space-y-0.5">
                      <p className="text-sm sm:text-sm font-semibold text-white group-hover:text-white transition-colors duration-200">
                        Verify Media with AI
                      </p>
                      <p className="text-xs sm:text-xs text-white/60 group-hover:text-white/80 transition-colors duration-200 font-medium">
                        Images & videos • Max 100MB
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <button className="inline-flex items-center justify-center gap-1.5 sm:gap-2 h-8 sm:h-9 px-4 sm:px-4 bg-gradient-to-r from-white to-gray-100 text-black rounded-xl sm:rounded-xl text-sm sm:text-sm font-bold hover:from-white hover:to-white transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105 active:scale-95">
                      <span>Analyze</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
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
