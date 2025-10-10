"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"

const AboutPage = () => {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogin = () => {
    router.push("/verify")
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-none tracking-tighter premium-heading mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent block">
                APEX VERIFY AI
              </span>
            </h2>
            <p className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white/90 max-w-4xl mx-auto">
              THE TRUTH STANDARD FOR THE CREATOR ECONOMY
            </p>
          </div>

          <div className="space-y-12 sm:space-y-16">
            {/* Mission Statement - Full Width */}
            <div className="border border-white/10 rounded-2xl p-8 sm:p-12 bg-white/[0.02]">
              <div className="max-w-4xl mx-auto space-y-6">
                <p className="text-white text-xl sm:text-2xl font-black leading-tight tracking-tight">
                  IN A DIGITAL WORLD FLOODED WITH AI EDITS, DEEPFAKES, AND PHOTOSHOP TRICKS, APEX VERIFY AI EXISTS FOR
                  ONE MISSION: TO PROTECT CREATORS AND RESTORE AUTHENTICITY.
                </p>
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <p className="text-white/70 text-lg sm:text-xl font-medium leading-relaxed">
                  WHETHER YOU'RE AN INFLUENCER, ATHLETE, ARTIST, OR ENTREPRENEUR — YOUR CONTENT DESERVES TO BE TRUSTED.
                  OUR PLATFORM DELIVERS A SINGLE, UNSHAKABLE VERDICT ON ANY PHOTO OR VIDEO: REAL OR MANIPULATED.
                </p>
              </div>
            </div>

            {/* Two Column Layout for Why & What */}
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
              {/* Why It Matters */}
              <div className="border border-white/10 rounded-2xl p-8 sm:p-10 bg-white/[0.02] flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tighter">WHY IT MATTERS</h3>
                  <div className="h-1 w-16 bg-white/80 mt-3 rounded-full" />
                </div>
                <p className="text-white/80 text-base sm:text-lg font-medium leading-relaxed flex-1">
                  THE CREATOR ECONOMY THRIVES ON CREDIBILITY. BRANDS, COMMUNITIES, AND FANS FOLLOW THOSE WHO ARE
                  GENUINE. APEX VERIFY AI MAKES SURE THAT YOUR WORK — YOUR IMAGE, YOUR REPUTATION — CAN'T BE HIJACKED BY
                  FAKE MEDIA.
                </p>
              </div>

              {/* What We Do */}
              <div className="border border-white/10 rounded-2xl p-8 sm:p-10 bg-white/[0.02] flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tighter">WHAT WE DO</h3>
                  <div className="h-1 w-16 bg-white/80 mt-3 rounded-full" />
                </div>
                <ul className="space-y-4 flex-1">
                  <li className="flex items-start gap-3">
                    <span className="text-white/40 flex-shrink-0 mt-1 text-lg font-black">→</span>
                    <span className="text-white/90 text-base sm:text-lg font-medium leading-relaxed">
                      INSTANT AUTHENTICITY CHECKS ON UPLOADS
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-white/40 flex-shrink-0 mt-1 text-lg font-black">→</span>
                    <span className="text-white/90 text-base sm:text-lg font-medium leading-relaxed">
                      CLASSIFICATION OF MANIPULATION TYPES
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-white/40 flex-shrink-0 mt-1 text-lg font-black">→</span>
                    <span className="text-white/90 text-base sm:text-lg font-medium leading-relaxed">
                      CLEAR VERDICT: REAL OR MANIPULATED
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Vision - Full Width Featured */}
            <div className="border-2 border-white/20 rounded-2xl p-10 sm:p-16 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tighter mb-3">THE VISION</h3>
                  <div className="h-1 w-24 bg-white/80 mx-auto rounded-full" />
                </div>

                <blockquote className="relative py-8 sm:py-12">
                  <div className="absolute top-0 left-0 text-6xl sm:text-8xl text-white/10 font-black leading-none">
                    "
                  </div>
                  <p className="relative text-xl sm:text-2xl md:text-3xl font-black text-center leading-tight tracking-tight px-8 sm:px-12">
                    <span className="bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-clip-text text-transparent">
                      THE LAST 10 YEARS, WE PAID TO REMOVE WATERMARKS. THE NEXT 10 YEARS, WE'LL PAY TO HAVE THEM ON —
                      PROTECTING CREATORS, ENFORCING AUTHENTICITY, AND RECLAIMING DIGITAL TRUST.
                    </span>
                  </p>
                  <div className="absolute bottom-0 right-0 text-6xl sm:text-8xl text-white/10 font-black leading-none">
                    "
                  </div>
                </blockquote>

                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <p className="text-white/80 text-lg sm:text-xl font-medium text-center leading-relaxed">
                  APEX VERIFY AI IS THAT WATERMARK FOR TRUTH — PROOF OF OWNERSHIP, AUTHENTICITY, AND VALUE.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
