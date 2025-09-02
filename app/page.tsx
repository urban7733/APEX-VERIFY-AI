"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Upload, ArrowRight, Menu, X, Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react"
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

  const createScrollingColumn = (images: typeof backgroundPosts, animationClass: string, columnKey: string) => (
    <div key={columnKey} className="flex-1 flex flex-col space-y-4">
      <div className={`flex flex-col space-y-4 ${animationClass}`}>
        {[...images, ...images, ...images].map((post, index) => (
          <div key={`${post.id}-${index}`} className="relative">
            <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
              {/* Post Header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{post.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-white text-sm font-medium">{post.username}</span>
                    {post.verified && (
                      <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-white/60 text-xs">• {post.timeAgo}</span>
                </div>
                <button className="p-2 -m-2">
                  <MoreHorizontal className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Post Image */}
              <div className="relative">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt=""
                  width={300}
                  height={post.aspectRatio === "portrait" ? 400 : post.aspectRatio === "square" ? 300 : 200}
                  className="w-full object-cover"
                  loading="lazy"
                />
                {/* Apex Verify AI Seal */}
                <div className="absolute bottom-3 right-3 z-20">
                  <div className="bg-white/95 backdrop-blur-none rounded-full p-2.5 shadow-xl border border-white/20 filter-none">
                    <Image
                      src="/apex-verify-seal.png"
                      alt="Apex Verify AI Verified"
                      width={24}
                      height={24}
                      className="w-6 h-6 filter-none opacity-100"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>

              {/* Post Actions */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button className="p-1 -m-1">
                      <Heart className="w-6 h-6 text-white/70 hover:text-red-400 transition-colors" />
                    </button>
                    <button className="p-1 -m-1">
                      <MessageCircle className="w-6 h-6 text-white/70 hover:text-white transition-colors" />
                    </button>
                    <button className="p-1 -m-1">
                      <Share className="w-6 h-6 text-white/70 hover:text-white transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Likes Count */}
                <div className="text-white text-sm font-medium">{post.likes.toLocaleString()} likes</div>

                {/* Caption */}
                <div className="text-white text-sm">
                  <span className="font-medium">{post.username}</span>{" "}
                  <span className="text-white/90">{post.caption}</span>
                </div>

                {/* Comments */}
                <button className="text-white/60 text-sm hover:text-white/80 transition-colors text-left">
                  View all {post.comments} comments
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen text-white antialiased relative overflow-hidden tech-grid-bg">
      <div className="absolute inset-0 tech-grid opacity-10 pointer-events-none" />

      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="flex gap-2 sm:gap-4 md:gap-6 h-full p-2 sm:p-4">
          <div className="flex gap-2 w-full sm:hidden">
            {createScrollingColumn(backgroundPosts.slice(0, 2), "animate-scroll-up", "mobile-col-1")}
            {createScrollingColumn(backgroundPosts.slice(2, 4), "animate-scroll-up-delayed", "mobile-col-2")}
            {createScrollingColumn(backgroundPosts.slice(4, 6), "animate-scroll-up-slow", "mobile-col-3")}
            {createScrollingColumn(backgroundPosts.slice(0, 2), "animate-scroll-up", "mobile-col-4")}
          </div>
          {/* Show all columns on larger screens */}
          <div className="hidden sm:flex gap-4 md:gap-6 w-full">
            {createScrollingColumn(backgroundPosts.slice(0, 2), "animate-scroll-up", "col-1")}
            {createScrollingColumn(backgroundPosts.slice(2, 4), "animate-scroll-up-delayed", "col-2")}
            {createScrollingColumn(backgroundPosts.slice(4, 6), "animate-scroll-up-slow", "col-3")}
            {createScrollingColumn(backgroundPosts.slice(0, 2), "animate-scroll-up", "col-4")}
            {createScrollingColumn(backgroundPosts.slice(2, 4), "animate-scroll-up-delayed", "col-5")}
            {createScrollingColumn(backgroundPosts.slice(4, 6), "animate-scroll-up-slow", "col-6")}
          </div>
        </div>
      </div>

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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4 sm:px-6">
        <div className="text-center max-w-6xl mx-auto w-full space-y-8 sm:space-y-12">
          <div className="relative">
            <h1 className="text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-black text-white leading-none tracking-tighter premium-heading">
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
                <div className="flex items-center justify-between h-18 sm:h-20 px-6 sm:px-8">
                  <div className="flex items-center space-x-4 sm:space-x-6 flex-1 min-w-0">
                    <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-white/70 flex-shrink-0" />
                    <span className="text-white/70 text-lg sm:text-xl font-light tracking-wide truncate">
                      UPLOAD • ANALYZE • VERIFY
                    </span>
                  </div>
                  <button className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 flex-shrink-0 ml-4 premium-upload-button">
                    <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto px-4">
            <p className="text-white/80 text-xl sm:text-2xl font-light leading-relaxed tracking-wide">
              Advanced AI-powered deepfake detection technology.
            </p>
            <p className="text-white/60 text-lg sm:text-xl font-light leading-relaxed tracking-wide">
              Engineered for precision. Built for the future.
            </p>
          </div>
        </div>
      </div>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultMode={authMode} />
    </div>
  )
}
