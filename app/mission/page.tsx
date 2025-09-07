"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Shield, Eye, Zap, Globe, Users, Lock, Menu, X } from "lucide-react"
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
              {/* Mobile Menu Content */}
              <button
                onClick={() => router.push("/")}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl text-white text-sm font-light tracking-wide transition-all duration-500 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
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
          )}
        </div>
      </nav>

      {/* Main Content - Enhanced Premium Design */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-140px)] p-6">
        <div className="w-full max-w-4xl">
          <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl transition-all duration-500 hover:bg-white/10">
            <div className="relative space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                    Our Mission
                  </span>
                </h1>
                <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                  Building the world's most trusted visual authenticity platform
                </p>
              </div>

              {/* Mission Statement */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8 transition-all duration-500 hover:bg-white/15">
                <h2 className="text-2xl font-bold text-white mb-4">The Truth Layer</h2>
                <p className="text-lg text-white/90 leading-relaxed mb-6">
                  In an era where synthetic media threatens the foundation of digital trust, Apex Verify AI stands as
                  the definitive truth layer for visual content. We're not just detecting deepfakes—we're preserving
                  reality itself.
                </p>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Advanced AI Detection</h3>
                    <p className="text-white/80 text-sm">
                      Our proprietary AI models analyze images at the pixel level, detecting even the most sophisticated
                      synthetic content generated by DALL-E, Midjourney, Stable Diffusion, and other AI systems.
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Comprehensive Analysis</h3>
                    <p className="text-white/80 text-sm">
                      Every image undergoes forensic examination including metadata analysis, compression pattern
                      detection, color signature verification, and frequency domain analysis to ensure complete
                      authenticity assessment.
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Real-Time Verification</h3>
                    <p className="text-white/80 text-sm">
                      Get instant results with our lightning-fast processing pipeline. Upload any image and receive a
                      detailed authenticity report within seconds, complete with confidence scores and forensic
                      evidence.
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Values Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 transition-all duration-500 hover:bg-white/15">
                  <Eye className="w-8 h-8 text-white mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Uncompromising Detection</h3>
                  <p className="text-white/80 text-sm">
                    Advanced AI models that identify even the most sophisticated synthetic content
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 transition-all duration-500 hover:bg-white/15">
                  <Zap className="w-8 h-8 text-white mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Instant Verification</h3>
                  <p className="text-white/80 text-sm">
                    Real-time analysis that provides immediate authenticity confirmation
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 transition-all duration-500 hover:bg-white/15">
                  <Globe className="w-8 h-8 text-white mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Global Impact</h3>
                  <p className="text-white/80 text-sm">
                    Protecting digital ecosystems worldwide from synthetic media threats
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 transition-all duration-500 hover:bg-white/15">
                  <Users className="w-8 h-8 text-white mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Creator Protection</h3>
                  <p className="text-white/80 text-sm">
                    Safeguarding content creators from unauthorized synthetic reproductions
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 transition-all duration-500 hover:bg-white/15">
                  <Lock className="w-8 h-8 text-white mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Digital Integrity</h3>
                  <p className="text-white/80 text-sm">
                    Establishing cryptographic proof of authenticity for verified content
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 transition-all duration-500 hover:bg-white/15">
                  <Shield className="w-8 h-8 text-white mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Trust Infrastructure</h3>
                  <p className="text-white/80 text-sm">Building the foundation for a more trustworthy digital future</p>
                </div>
              </div>

              {/* Analysis Process */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8 transition-all duration-500 hover:bg-white/15">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">How Our Analysis Works</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                        1
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Image Upload & Validation</h3>
                        <p className="text-white/80 text-sm">
                          Secure upload with format validation and size optimization for optimal analysis.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                        2
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">AI Feature Extraction</h3>
                        <p className="text-white/80 text-sm">
                          Advanced algorithms analyze visual patterns, textures, and composition for authenticity
                          markers.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                        3
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Forensic Analysis</h3>
                        <p className="text-white/80 text-sm">
                          Deep examination of metadata, compression artifacts, and digital signatures.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                        4
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Content Analysis</h3>
                        <p className="text-white/80 text-sm">
                          AI-powered content understanding to identify scenes, objects, and context.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                        5
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Authenticity Scoring</h3>
                        <p className="text-white/80 text-sm">
                          Comprehensive scoring system providing confidence levels and detailed assessments.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                        6
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Detailed Report</h3>
                        <p className="text-white/80 text-sm">
                          Professional report with scene analysis, story context, and digital footprint verification.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vision Statement */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8 text-center transition-all duration-500 hover:bg-white/15">
                <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
                <p className="text-lg text-white/90 leading-relaxed max-w-3xl mx-auto">
                  A world where every piece of visual content carries an immutable seal of authenticity, where creators
                  are protected, consumers are informed, and truth prevails over deception. We're not just building
                  technology—we're defending reality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultMode={authMode} />
    </div>
  )
}
