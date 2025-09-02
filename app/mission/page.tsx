"use client"
import Link from "next/link"
import { ArrowLeft, Shield, Eye, Zap, Globe, Users, Lock } from "lucide-react"

export default function MissionPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Masonry Grid */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1 h-full overflow-hidden">
          {/* Same background images as landing page */}
          <div className="relative aspect-[3/4]">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ducati-YC2snvrNM91HgYXPIdJNgto9mYrQcS.jpeg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative aspect-[4/3]">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%285%29-OuqpDKQKYwEPMfUe1ZDFYkg1rfEwWP.jpeg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative aspect-[3/4]">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%286%29-7R0Zfp7EqCtQ55Bj6ac6tRLO7qnY67.jpeg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative aspect-[4/3]">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Golden%20Gate%20Bridge%20in%20San%20Francisco-SIRi9SeqhqXlDL8AbAk5ihT624q4SQ.jpeg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative aspect-[3/4]">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%40pndloverrrr-I8MDnCRnxZ2SpKUfcwarqh92SHRr15.jpeg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative aspect-[4/3]">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/city%20at%20night-g1YGnAoUKviGRXMEwukfxKAPyxK50y.jpeg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          {/* Repeat pattern for full coverage */}
          <div className="relative aspect-[3/4]">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ducati-YC2snvrNM91HgYXPIdJNgto9mYrQcS.jpeg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative aspect-[4/3]">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%285%29-OuqpDKQKYwEPMfUe1ZDFYkg1rfEwWP.jpeg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative aspect-[3/4]">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%286%29-7R0Zfp7EqCtQ55Bj6ac6tRLO7qnY67.jpeg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative aspect-[4/3]">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Golden%20Gate%20Bridge%20in%20San%20Francisco-SIRi9SeqhqXlDL8AbAk5ihT624q4SQ.jpeg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative aspect-[3/4]">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%40pndloverrrr-I8MDnCRnxZ2SpKUfcwarqh92SHRr15.jpeg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative aspect-[4/3]">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/city%20at%20night-g1YGnAoUKviGRXMEwukfxKAPyxK50y.jpeg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-6">
        <Link href="/" className="text-xl font-bold">
          Apex Verify AI
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content - Glassmorphic Card */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-6">
        <div className="w-full max-w-4xl">
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
            {/* Subtle inner glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

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
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white mb-4">The Truth Layer</h2>
                <p className="text-lg text-white/90 leading-relaxed">
                  In an era where synthetic media threatens the foundation of digital trust, Apex Verify AI stands as
                  the definitive truth layer for visual content. We're not just detecting deepfakes—we're preserving
                  reality itself.
                </p>
              </div>

              {/* Core Values Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                  <Eye className="w-8 h-8 text-white mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Uncompromising Detection</h3>
                  <p className="text-white/80 text-sm">
                    Advanced AI models that identify even the most sophisticated synthetic content
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                  <Zap className="w-8 h-8 text-white mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Instant Verification</h3>
                  <p className="text-white/80 text-sm">
                    Real-time analysis that provides immediate authenticity confirmation
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                  <Globe className="w-8 h-8 text-white mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Global Impact</h3>
                  <p className="text-white/80 text-sm">
                    Protecting digital ecosystems worldwide from synthetic media threats
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                  <Users className="w-8 h-8 text-white mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Creator Protection</h3>
                  <p className="text-white/80 text-sm">
                    Safeguarding content creators from unauthorized synthetic reproductions
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                  <Lock className="w-8 h-8 text-white mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Digital Integrity</h3>
                  <p className="text-white/80 text-sm">
                    Establishing cryptographic proof of authenticity for verified content
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                  <Shield className="w-8 h-8 text-white mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Trust Infrastructure</h3>
                  <p className="text-white/80 text-sm">Building the foundation for a more trustworthy digital future</p>
                </div>
              </div>

              {/* Vision Statement */}
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8 text-center">
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
    </div>
  )
}
