"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Upload, ArrowRight } from "lucide-react"
import Image from "next/image"
import { AuthDialog } from "@/components/auth/auth-dialog"

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
        {/* Full-screen Background Image */}
        <div
          className="fixed inset-0 z-0 will-change-transform"
          style={{
            backgroundImage: "url(/enhanced-cosmic-vortex.jpeg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
            imageRendering: "crisp-edges",
            backfaceVisibility: "hidden",
          }}
        />

        {/* Dark overlay for better text readability */}
        <div className="fixed inset-0 z-0 bg-black/20" />

        {/* Navigation */}
        <nav className="relative z-10 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image src="/verify-logo.png" alt="Apex Verify AI" width={28} height={28} className="opacity-90" />
                <span className="text-lg font-medium text-white/90">Apex Verify AI</span>
              </div>

              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setShowMission(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Back to Home
                </button>
                <button
                  onClick={handleLogin}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium"
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

        {/* Mission Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-8">
              {/* Hero Section */}
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-green-600/20 blur-2xl rounded-full"></div>
                  <Image
                    src="/verified-apex-verify-logo-2.png"
                    alt="Apex Verify AI"
                    width={120}
                    height={120}
                    className="relative z-10 mx-auto drop-shadow-2xl"
                  />
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                      Our Mission
                    </span>
                  </h1>
                </div>
              </div>

              {/* Mission Statement Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10 blur-xl rounded-2xl"></div>
                <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-12 shadow-2xl max-h-[70vh] overflow-y-auto">
                  <div className="prose prose-lg max-w-none space-y-6 text-left">
                    <p className="text-white/90 leading-relaxed text-lg first-letter:text-2xl first-letter:font-bold first-letter:text-white">
                      In a world flooded with digital content, the line between truth and deception has never been
                      thinner. At Apex Verify AI, we stand as guardians of authenticity and trust.
                    </p>

                    <p className="text-white/85 leading-relaxed">
                      Our mission is to empower creators, businesses, and everyday users by providing the most advanced,
                      reliable, and transparent AI-driven verification technology. We don't just detect deepfakes—we
                      unveil their origin, revealing who created them and how, restoring clarity in a sea of
                      uncertainty.
                    </p>

                    <p className="text-white/85 leading-relaxed">
                      Rooted in integrity and inspired by the pursuit of truth, we build technology that honors reality
                      and protects the genuine. We believe in a future where digital content can be trusted, identities
                      are verified with confidence, and misinformation loses its power.
                    </p>

                    <p className="text-white/85 leading-relaxed">
                      With every line of code, every model we train, and every user we serve, we dedicate ourselves to
                      this vision—because truth matters, and trust is everything.
                    </p>

                    <p className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                      "For years, we paid to hide watermarks. Now, we invest to secure our identity."
                    </p>

                    <p className="text-base text-white/70 mt-4">
                      Join us in shaping a safer, more truthful digital world.
                    </p>
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
    <div className="min-h-screen max-h-screen text-white antialiased relative overflow-hidden">
      {/* Full-screen Background Image */}
      <div
        className="fixed inset-0 z-0 will-change-transform"
        style={{
          backgroundImage: "url(/enhanced-cosmic-vortex.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          imageRendering: "crisp-edges",
          backfaceVisibility: "hidden",
        }}
      />

      {/* Dark overlay for better text readability */}
      <div className="fixed inset-0 z-0 bg-black/20" />

      {/* Navigation */}
      <nav className="relative z-10 py-2 sm:py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Image
                src="/verify-logo.png"
                alt="Apex Verify AI"
                width={24}
                height={24}
                className="sm:w-7 sm:h-7 opacity-90"
              />
              <span className="text-base sm:text-lg font-medium text-white/90">Apex Verify AI</span>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={handleMissionClick}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg"
              >
                <span className="hidden sm:inline">Our Mission</span>
                <span className="sm:hidden">Mission</span>
              </button>
              <button
                onClick={handleLogin}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg"
              >
                <span className="hidden sm:inline">Log In</span>
                <span className="sm:hidden">Login</span>
              </button>
              <button
                onClick={() => router.push("/deepfake-memory")}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg"
              >
                <span className="hidden sm:inline">Deepfake Memory</span>
                <span className="sm:hidden">Memory</span>
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
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent text-xl sm:text-2xl md:text-3xl lg:text-4xl drop-shadow-lg">
                  Build trust with us.
                </span>
              </div>
            </h1>
          </div>

          {/* Mission Statement */}
          <div className="space-y-3 mb-4 w-full max-w-3xl mx-auto">
            <p className="text-xs sm:text-sm text-gray-100 font-medium max-w-xl mx-auto leading-relaxed px-4 sm:px-0 drop-shadow-md">
              We are building the world's first deepfake AI infrastructure — a foundational system for truth in the
              digital age.
            </p>
          </div>

          {/* File Upload Container */}
          <div className="mb-4 w-full max-w-md mx-auto px-2 sm:px-4">
            <div
              onClick={handleFileUpload}
              className="group relative w-full cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Main container */}
              <div className="relative bg-black/60 backdrop-blur-md border border-white/30 rounded-xl p-4 group-hover:border-white/40 transition-all duration-300 shadow-xl group-hover:shadow-2xl overflow-hidden">
                {/* Subtle scan line effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-800 ease-out"></div>

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {/* Compact upload icon */}
                      <div className="w-8 h-8 bg-white/15 border border-white/40 rounded-lg flex items-center justify-center group-hover:bg-white/25 group-hover:border-white/50 transition-all duration-300">
                        <Upload className="w-4 h-4 text-white/90 group-hover:text-white transition-all duration-300" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1 group-hover:text-white/95 transition-colors duration-300 drop-shadow-md">
                        Verify Media with AI
                      </p>
                      <p className="text-white/70 group-hover:text-white/80 transition-colors duration-300 text-xs">
                        Images & videos • Max 100MB
                      </p>
                    </div>
                  </div>

                  {/* Compact analyze button */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    <button className="relative bg-white/25 border border-white/40 text-white font-medium hover:bg-white/30 hover:border-white/50 transition-all duration-300 flex items-center space-x-2 px-3 py-2 rounded-lg">
                      <span className="text-xs font-bold">Analyze</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-300" />
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
    </div>
  )
}
