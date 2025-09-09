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
    <div className="min-h-screen bg-black text-white antialiased relative overflow-hidden tech-grid-bg">
      <div className="absolute inset-0 tech-grid opacity-10 pointer-events-none" />
      <div className="absolute inset-0 z-0 premium-glass-overlay" />

      {/* Navigation */}
      <nav className="relative z-10 py-6 sm:py-8 premium-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/")}
                className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight premium-logo"
              >
                APEX VERIFY AI
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={handleLogin}
                className="flex items-center space-x-2 px-6 py-3 rounded-full text-white text-sm font-medium transition-all duration-300 premium-button min-h-[44px]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>ACCESS</span>
              </button>
              <button
                onClick={() => router.push("/verify")}
                className="px-6 py-3 rounded-full text-white text-sm font-medium transition-all duration-300 premium-button-primary min-h-[44px]"
              >
                VERIFY
              </button>
              <button
                onClick={() => router.push("/about")}
                className="px-6 py-3 rounded-full text-white text-sm font-medium transition-all duration-300 premium-button min-h-[44px]"
              >
                MISSION
              </button>
            </div>

            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-3 text-white rounded-lg transition-all duration-300 premium-button min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-6 rounded-2xl p-6 space-y-4 premium-mobile-menu">
              <button
                onClick={() => {
                  handleLogin()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-4 rounded-xl text-white text-base font-medium transition-all duration-300 premium-button min-h-[48px]"
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
                className="w-full px-4 py-4 rounded-xl text-white text-base font-medium transition-all duration-300 premium-button-primary min-h-[48px]"
              >
                VERIFY
              </button>
              <button
                onClick={() => {
                  router.push("/about")
                  setMobileMenuOpen(false)
                }}
                className="w-full px-4 py-4 rounded-xl text-white text-base font-medium transition-all duration-300 premium-button min-h-[48px]"
              >
                MISSION
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[8rem] font-black leading-none tracking-tighter premium-heading mb-6 sm:mb-8">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent block">
              APEX VERIFY AI
            </span>
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent block text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mt-2 sm:mt-4 tracking-wide">
              THE TRUTH STANDARD FOR THE CREATOR ECONOMY
            </span>
          </h2>

          <div className="space-y-8">
            <div className="relative rounded-2xl overflow-hidden premium-upload-area p-6 sm:p-8">
              <p className="text-white/80 text-lg sm:text-xl font-black leading-tight tracking-tighter premium-heading mb-4 sm:mb-6">
                IN A DIGITAL WORLD FLOODED WITH AI EDITS, DEEPFAKES, AND PHOTOSHOP TRICKS, APEX VERIFY AI EXISTS FOR ONE
                MISSION: TO PROTECT CREATORS AND RESTORE AUTHENTICITY.
              </p>

              <p className="text-white/60 text-base sm:text-lg font-black leading-tight tracking-tighter premium-heading">
                WHETHER YOU'RE AN INFLUENCER, ATHLETE, ARTIST, OR ENTREPRENEUR — YOUR CONTENT DESERVES TO BE TRUSTED.
                OUR PLATFORM DELIVERS A SINGLE, UNSHAKABLE VERDICT ON ANY PHOTO OR VIDEO: REAL OR MANIPULATED.
              </p>
            </div>

            <div className="relative rounded-2xl overflow-hidden premium-upload-area p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-4 sm:mb-6 tracking-tighter premium-heading">
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                  WHY IT MATTERS
                </span>
              </h3>

              <p className="text-white/80 text-base sm:text-lg font-black leading-tight tracking-tighter premium-heading">
                THE CREATOR ECONOMY THRIVES ON CREDIBILITY. BRANDS, COMMUNITIES, AND FANS FOLLOW THOSE WHO ARE GENUINE.
                APEX VERIFY AI MAKES SURE THAT YOUR WORK — YOUR IMAGE, YOUR REPUTATION — CAN'T BE HIJACKED BY FAKE
                MEDIA.
              </p>
            </div>

            <div className="relative rounded-2xl overflow-hidden premium-upload-area p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-4 sm:mb-6 tracking-tighter premium-heading">
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                  WHAT WE DO
                </span>
              </h3>

              <ul className="text-base sm:text-lg font-black mb-4 sm:mb-6 ml-6 space-y-2 text-white/80 leading-tight tracking-tighter premium-heading">
                <li>• INSTANT AUTHENTICITY CHECKS ON UPLOADS.</li>
                <li>• CLASSIFICATION OF MANIPULATION — DEEPFAKE, AI EDIT, OR MANUAL PHOTOSHOP.</li>
                <li>• A VERDICT BUILT FOR CLARITY: REAL. OR MANIPULATED.</li>
              </ul>
            </div>

            <div className="relative rounded-2xl overflow-hidden premium-upload-area p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-4 sm:mb-6 tracking-tighter premium-heading">
                <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                  THE VISION
                </span>
              </h3>

              <div className="relative my-8 sm:my-12 p-6 sm:p-8 rounded-2xl premium-upload-area">
                <p className="relative text-lg sm:text-xl md:text-2xl font-black text-center leading-tight tracking-tighter premium-heading">
                  <span className="bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-clip-text text-transparent">
                    "THE LAST 10 YEARS, WE PAID TO REMOVE WATERMARKS. THE NEXT 10 YEARS, WE'LL PAY TO HAVE THEM ON —
                    PROTECTING CREATORS, ENFORCING AUTHENTICITY, AND RECLAIMING DIGITAL TRUST."
                  </span>
                </p>
              </div>

              <p className="text-white/80 text-base sm:text-lg font-black leading-tight tracking-tighter premium-heading">
                APEX VERIFY AI IS THAT WATERMARK FOR TRUTH — PROOF OF OWNERSHIP, AUTHENTICITY, AND VALUE.
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
