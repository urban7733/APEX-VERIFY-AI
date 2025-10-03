"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Shield, Eye, Zap, Menu, X } from "lucide-react"
import { AuthDialog } from "@/components/auth/auth-dialog"

export default function MissionPage() {
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
    <div className="min-h-screen bg-black text-white antialiased relative overflow-hidden grid-nano">
      {/* Navigation */}
      <nav className="relative z-10 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/")}
                className="text-2xl sm:text-3xl md:text-4xl font-light text-white heading-ultra tracking-wider"
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
              {/* Mobile Menu Content */}
              <button
                onClick={() => router.push("/")}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl text-white text-sm font-medium transition-all duration-300 premium-button min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-black tracking-tighter">BACK TO HOME</span>
              </button>
              <button
                onClick={handleLogin}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl text-white text-sm font-medium transition-all duration-300 premium-button min-h-[44px]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>ACCESS</span>
              </button>
              <button
                onClick={() => router.push("/verify")}
                className="px-6 py-3 rounded-2xl text-white text-sm font-medium transition-all duration-300 premium-button-primary min-h-[44px]"
              >
                VERIFY
              </button>
              <button
                onClick={() => router.push("/about")}
                className="px-6 py-3 rounded-2xl text-white text-sm font-medium transition-all duration-300 premium-button min-h-[44px]"
              >
                MISSION
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content - Creator Economy Focus */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-140px)] p-6">
        <div className="w-full max-w-4xl">
          <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl transition-all duration-500 hover:bg-white/10">
            <div className="relative space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tighter premium-heading">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                    APEX VERIFY AI – THE TRUTH STANDARD FOR THE CREATOR ECONOMY
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-tight font-black tracking-tighter premium-heading">
                  IN A DIGITAL WORLD FLOODED WITH AI EDITS, DEEPFAKES, AND PHOTOSHOP TRICKS, APEX VERIFY AI EXISTS FOR
                  ONE MISSION: TO PROTECT CREATORS AND RESTORE AUTHENTICITY.
                </p>
              </div>

              {/* Mission Statement */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8 transition-all duration-500 hover:bg-white/15">
                <p className="text-base sm:text-lg text-white/90 leading-tight font-black tracking-tighter premium-heading mb-6">
                  WHETHER YOU'RE AN INFLUENCER, ATHLETE, ARTIST, OR ENTREPRENEUR — YOUR CONTENT DESERVES TO BE TRUSTED.
                  OUR PLATFORM DELIVERS A SINGLE, UNSHAKABLE VERDICT ON ANY PHOTO OR VIDEO:{" "}
                  <span className="font-black text-white">REAL OR MANIPULATED</span>.
                </p>
              </div>

              {/* Why It Matters */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8 transition-all duration-500 hover:bg-white/15">
                <h2 className="text-xl sm:text-2xl font-black text-white mb-4 tracking-tighter premium-heading">
                  WHY IT MATTERS
                </h2>
                <p className="text-base sm:text-lg text-white/90 leading-tight font-black tracking-tighter premium-heading">
                  THE CREATOR ECONOMY THRIVES ON CREDIBILITY. BRANDS, COMMUNITIES, AND FANS FOLLOW THOSE WHO ARE
                  GENUINE. APEX VERIFY AI MAKES SURE THAT YOUR WORK — YOUR IMAGE, YOUR REPUTATION — CAN'T BE HIJACKED BY
                  FAKE MEDIA.
                </p>
              </div>

              {/* What We Do */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8 transition-all duration-500 hover:bg-white/15">
                <h2 className="text-xl sm:text-2xl font-black text-white mb-6 tracking-tighter premium-heading">
                  WHAT WE DO
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <Eye className="w-8 h-8 text-white mb-4" />
                    <h3 className="text-base sm:text-lg font-black text-white mb-2 tracking-tighter premium-heading">
                      INSTANT AUTHENTICITY CHECKS
                    </h3>
                    <p className="text-white/80 text-sm font-black tracking-tighter premium-heading">
                      REAL-TIME VERIFICATION ON UPLOADS WITH IMMEDIATE RESULTS.
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <Zap className="w-8 h-8 text-white mb-4" />
                    <h3 className="text-base sm:text-lg font-black text-white mb-2 tracking-tighter premium-heading">
                      CLASSIFICATION OF MANIPULATION
                    </h3>
                    <p className="text-white/80 text-sm font-black tracking-tighter premium-heading">
                      DEEPFAKE, AI EDIT, OR MANUAL PHOTOSHOP — WE IDENTIFY THEM ALL.
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <Shield className="w-8 h-8 text-white mb-4" />
                    <h3 className="text-base sm:text-lg font-black text-white mb-2 tracking-tighter premium-heading">
                      CLEAR VERDICT
                    </h3>
                    <p className="text-white/80 text-sm font-black tracking-tighter premium-heading">
                      A VERDICT BUILT FOR CLARITY: REAL. OR MANIPULATED.
                    </p>
                  </div>
                </div>
              </div>

              {/* Vision Statement */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8 text-center transition-all duration-500 hover:bg-white/15">
                <h2 className="text-xl sm:text-2xl font-black text-white mb-6 tracking-tighter premium-heading">
                  THE VISION
                </h2>
                <blockquote className="text-lg sm:text-xl text-white/90 leading-tight max-w-3xl mx-auto font-black tracking-tighter premium-heading">
                  "THE LAST 10 YEARS, WE PAID TO REMOVE WATERMARKS.
                  <br />
                  THE NEXT 10 YEARS, WE'LL PAY TO HAVE THEM ON — PROTECTING CREATORS, ENFORCING AUTHENTICITY, AND
                  RECLAIMING DIGITAL TRUST."
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultMode={authMode} />
    </div>
  )
}
