"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Upload, ArrowRight, Menu, X, Heart, MessageCircle, Share } from "lucide-react"
import Image from "next/image"
import { AuthDialog } from "@/components/auth/auth-dialog"

const backgroundPosts = [
  {
    id: 1,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ducati-YC2snvrNM91HgYXPIdJNgto9mYrQcS.jpeg",
    aspectRatio: "portrait",
    username: "motorcyclelife",
    verified: true,
    caption: "Pure engineering perfection 🏍️",
    likes: 2847,
    comments: 156,
    timeAgo: "2h",
  },
  {
    id: 2,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%285%29-OuqpDKQKYwEPMfUe1ZDFYkg1rfEwWP.jpeg",
    aspectRatio: "portrait",
    username: "urbanexplorer",
    verified: false,
    caption: "City vibes hitting different today",
    likes: 1523,
    comments: 89,
    timeAgo: "4h",
  },
  {
    id: 3,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%286%29-7R0Zfp7EqCtQ55Bj6ac6tRLO7qnY67.jpeg",
    aspectRatio: "landscape",
    username: "streetphotography",
    verified: true,
    caption: "Moments like these remind me why I love this city",
    likes: 3921,
    comments: 234,
    timeAgo: "6h",
  },
  {
    id: 4,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Golden%20Gate%20Bridge%20in%20San%20Francisco-SIRi9SeqhqXlDL8AbAk5ihT624q4SQ.jpeg",
    aspectRatio: "landscape",
    username: "sf_adventures",
    verified: true,
    caption: "Golden hour at the Golden Gate 🌉",
    likes: 5672,
    comments: 412,
    timeAgo: "8h",
  },
  {
    id: 5,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%40pndloverrrr-I8MDnCRnxZ2SpKUfcwarqh92SHRr15.jpeg",
    aspectRatio: "portrait",
    username: "fashionista_daily",
    verified: false,
    caption: "Today's mood ✨",
    likes: 892,
    comments: 67,
    timeAgo: "12h",
  },
  {
    id: 6,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/city%20at%20night-g1YGnAoUKviGRXMEwukfxKAPyxK50y.jpeg",
    aspectRatio: "portrait",
    username: "nightowl_photos",
    verified: true,
    caption: "When the city never sleeps 🌃",
    likes: 4156,
    comments: 298,
    timeAgo: "1d",
  },
]

export default function Home() {
  const router = useRouter()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleFileUpload = () => {
    router.push("/verify")
  }

  const handleLogin = () => {
    setAuthMode("login")
    setAuthDialogOpen(true)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const createBackgroundScrollingPosts = () => (
    <div className="absolute inset-0 w-full h-full overflow-hidden opacity-35 pointer-events-none">
      <div className="flex space-x-2 animate-scroll-horizontal h-full items-center">
        {[...backgroundPosts, ...backgroundPosts, ...backgroundPosts, ...backgroundPosts].map((post, index) => (
          <div key={`${post.id}-${index}`} className="flex-shrink-0 w-32">
            <div className="relative bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden border border-white/15">
              {/* Post Header */}
              <div className="flex items-center justify-between p-1">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">{post.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-white/95 text-[10px] font-medium truncate max-w-[60px]">{post.username}</span>
                    {post.verified && (
                      <svg className="w-2 h-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Post Image */}
              <div className="relative">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt=""
                  width={128}
                  height={post.aspectRatio === "portrait" ? 160 : post.aspectRatio === "square" ? 128 : 80}
                  className="w-full object-cover"
                  loading="lazy"
                />
                {/* Apex Verify AI Seal */}
                <div className="absolute bottom-1 right-1 z-20">
                  <div className="backdrop-blur-none rounded-full filter-none">
                    <Image
                      src="/apex-verify-seal.png"
                      alt="Apex Verify AI Verified"
                      width={16}
                      height={16}
                      className="w-4 h-4 filter-none opacity-100 drop-shadow-lg"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>

              {/* Post Actions */}
              <div className="p-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="p-0.5">
                      <Heart className="w-3 h-3 text-white/80" />
                    </button>
                    <button className="p-0.5">
                      <MessageCircle className="w-3 h-3 text-white/80" />
                    </button>
                    <button className="p-0.5">
                      <Share className="w-3 h-3 text-white/80" />
                    </button>
                  </div>
                </div>

                {/* Likes Count */}
                <div className="text-white/95 text-[9px] font-medium">{post.likes.toLocaleString()}</div>

                {/* Caption */}
                <div className="text-white text-[9px]">
                  <span className="font-medium text-white/95">{post.username}</span>{" "}
                  <span className="text-white/90 truncate block">{post.caption.substring(0, 20)}...</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="h-screen text-white antialiased relative overflow-hidden tech-grid-bg">
      <div className="absolute inset-0 tech-grid opacity-10 pointer-events-none" />

      {createBackgroundScrollingPosts()}

      <div className="absolute inset-0 z-0 premium-glass-overlay" />

      <nav className="relative z-10 py-6 sm:py-8 premium-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight premium-logo">
                APEX VERIFY AI
              </span>
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

      {/* Main Content - Enhanced Premium Design */}
      <div className="relative z-10 flex flex-col items-center justify-center h-[calc(100vh-120px)] px-4 sm:px-6">
        <div className="text-center max-w-6xl mx-auto w-full space-y-6 sm:space-y-8">
          <div className="relative">
            <h1 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[8rem] font-black text-white leading-none tracking-tighter premium-heading">
              APEX VERIFY AI
            </h1>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>

          <div className="w-full max-w-3xl mx-auto px-2">
            <div
              onClick={handleFileUpload}
              className="group relative w-full cursor-pointer transform transition-all duration-500 hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="relative w-full rounded-2xl overflow-hidden transition-all duration-500 premium-upload-area">
                <div className="flex items-center justify-between h-16 sm:h-18 px-6 sm:px-8">
                  <div className="flex items-center space-x-4 sm:space-x-6 flex-1 min-w-0">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 flex-shrink-0" />
                    <span className="text-white/70 text-base sm:text-lg font-light tracking-wide truncate">
                      UPLOAD • ANALYZE • VERIFY
                    </span>
                  </div>
                  <button className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 flex-shrink-0 ml-4 premium-upload-button">
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-w-4xl mx-auto px-4">
            <p className="text-white/80 text-lg sm:text-xl font-black leading-tight tracking-tighter premium-heading">
              ADVANCED AI-POWERED DEEPFAKE DETECTION TECHNOLOGY.
            </p>
            <p className="text-white/60 text-base sm:text-lg font-black leading-tight tracking-tighter premium-heading">
              ENGINEERED FOR PRECISION. BUILT FOR THE FUTURE.
            </p>
          </div>
        </div>
      </div>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultMode={authMode} />
    </div>
  )
}
