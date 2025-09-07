"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { AuthDialog } from "@/components/auth/auth-dialog"

const AboutPage = () => {
  const router = useRouter()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogin = () => {
    setAuthMode("login")
    setAuthDialogOpen(true)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased relative overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/")}
                className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight"
              >
                APEX VERIFY AI
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={handleLogin}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl text-white text-sm font-light tracking-wide transition-all duration-500 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 min-h-[44px]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>ACCESS</span>
              </button>
              <button
                onClick={() => router.push("/verify")}
                className="px-6 py-3 rounded-2xl text-white text-sm font-light tracking-wide transition-all duration-500 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 min-h-[44px]"
              >
                VERIFY
              </button>
              <button
                onClick={() => router.push("/about")}
                className="px-6 py-3 rounded-2xl text-white text-sm font-light tracking-wide transition-all duration-500 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 min-h-[44px]"
              >
                MISSION
              </button>
            </div>

            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-3 text-white rounded-2xl transition-all duration-500 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-6 rounded-2xl p-6 space-y-4 bg-white/5 backdrop-blur-sm border border-white/10">
              <button
                onClick={() => {
                  handleLogin()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-4 rounded-2xl text-white text-base font-light tracking-wide transition-all duration-500 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 min-h-[48px]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>ACCESS</span>
              </button>
              <button
                onClick={() => {
                  router.push("/verify")
                  setMobileMenuOpen(false)
                }}
                className="w-full px-4 py-4 rounded-2xl text-white text-base font-light tracking-wide transition-all duration-500 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 min-h-[48px]"
              >
                VERIFY
              </button>
              <button
                onClick={() => {
                  router.push("/about")
                  setMobileMenuOpen(false)
                }}
                className="w-full px-4 py-4 rounded-2xl text-white text-base font-light tracking-wide transition-all duration-500 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 min-h-[48px]"
              >
                MISSION
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-6 sm:mb-8">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              The Ultimate Truth Layer for Visual Media
            </span>
          </h2>

          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-all duration-500 hover:bg-white/10">
              <p className="text-base sm:text-lg font-light mb-4 sm:mb-6 leading-relaxed text-white/90">
                Apex Verify AI exists to be the ultimate truth layer for visual media.
              </p>

              <p className="text-base sm:text-lg font-light mb-4 sm:mb-6 leading-relaxed text-white/90">
                In a world where AI can fabricate images and videos indistinguishably from reality, our mission is to
                give creators, professionals, and investigators an unambiguous, trustworthy verdict: real or fake.
              </p>

              <p className="text-base sm:text-lg font-light mb-4 sm:mb-6 leading-relaxed text-white/90">
                We empower users to instantly validate authenticity, trace origins, and gain deep insights into any
                media file — all through a hyper-minimal, black-and-white interface that communicates authority,
                precision, and clarity.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-all duration-500 hover:bg-white/10">
              <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-white mb-4 sm:mb-6 tracking-wide">
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                  🔍 Our Vision
                </span>
              </h3>

              <div className="relative my-8 sm:my-12 p-6 sm:p-8 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm shadow-2xl transition-all duration-500 hover:bg-white/15">
                <p className="relative text-lg sm:text-xl md:text-2xl font-medium text-center leading-relaxed">
                  <span className="bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-clip-text text-transparent">
                    "For the past decade, the industry paid to remove watermarks. The next ten years, we will pay to
                    have them on —
                  </span>
                  <br />
                  <span className="text-gray-300 text-base sm:text-lg font-light mt-2 block">
                    protecting creators, enforcing authenticity, and reclaiming trust in digital content."
                  </span>
                </p>
              </div>

              <p className="text-base sm:text-lg font-light mb-4 sm:mb-6 leading-relaxed text-white/90">
                Our goal is simple: To protect reality, enhance digital trust, and provide the most reliable AI-powered
                verification tools available.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-all duration-500 hover:bg-white/10">
              <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-white mb-4 sm:mb-6 tracking-wide">
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                  ✨ How It Works
                </span>
              </h3>

              <p className="text-base sm:text-lg font-light mb-4 sm:mb-6 leading-relaxed text-white/90">
                Every upload is analyzed with cutting-edge AI, returning a forensic-grade summary that combines:
              </p>

              <ul className="text-base sm:text-lg font-light mb-4 sm:mb-6 ml-6 space-y-2 text-white/90">
                <li>• An authenticity score</li>
                <li>• A clear assessment</li>
                <li>• A concise narrative about the content</li>
                <li>• Provenance and source evidence</li>
              </ul>

              <p className="text-base sm:text-lg font-light mb-4 sm:mb-6 leading-relaxed text-white/90">
                The experience is designed to feel powerful yet effortless, like stepping into a command center for
                truth — stripped of distraction, stripped of noise, but brimming with authority.
              </p>

              <p className="text-base sm:text-lg font-light mb-4 sm:mb-6 leading-relaxed text-white/90">
                Apex Verify AI doesn't just analyze media — it ensures confidence in every digital interaction, restores
                respect to creators, and turns authenticity into a visible asset.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultMode={authMode} />
    </div>
  )
}

export default AboutPage
