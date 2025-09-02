"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Menu, X, Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react"
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
                  <div className="bg-white/90 backdrop-blur-none rounded-full p-2 shadow-lg filter-none">
                    <Image
                      src="/apex-verify-seal.png"
                      alt="Apex Verify AI Verified"
                      width={20}
                      height={20}
                      className="w-5 h-5 filter-none"
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
    <div className="min-h-screen text-white antialiased relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="flex gap-2 sm:gap-4 md:gap-6 h-full p-2 sm:p-4">
          {/* Show fewer columns on mobile */}
          <div className="block sm:hidden">
            {createScrollingColumn(backgroundPosts.slice(0, 3), "animate-scroll-up", "mobile-col-1")}
            {createScrollingColumn(backgroundPosts.slice(3, 6), "animate-scroll-up-delayed", "mobile-col-2")}
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

      <div className="absolute inset-0 z-0 glass-overlay" />

      {/* Navigation */}
      <nav className="relative z-10 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/")}
                className="text-lg sm:text-xl md:text-2xl font-bold text-white hover:text-white/90 transition-colors duration-200"
              >
                Apex Verify AI
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={handleLogin}
                className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-white text-sm font-medium transition-all duration-200 min-h-[44px]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Log in</span>
              </button>
              <button
                onClick={() => router.push("/verify")}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-full text-white text-sm font-medium transition-all duration-200 min-h-[44px]"
              >
                Verify
              </button>
              <button
                onClick={() => router.push("/about")}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-full text-white text-sm font-medium transition-all duration-200 min-h-[44px]"
              >
                Our Mission
              </button>
            </div>

            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-3 text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 rounded-xl p-4 space-y-3">
              <button
                onClick={() => {
                  handleLogin()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-4 rounded-lg text-white text-base font-medium transition-all duration-200 min-h-[48px]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Log in</span>
              </button>
              <button
                onClick={() => {
                  router.push("/verify")
                  setMobileMenuOpen(false)
                }}
                className="w-full px-4 py-4 rounded-lg text-white text-base font-medium transition-all duration-200 min-h-[48px]"
              >
                Verify
              </button>
              <button
                onClick={() => {
                  router.push("/about")
                  setMobileMenuOpen(false)
                }}
                className="w-full px-4 py-4 rounded-lg text-white text-base font-medium transition-all duration-200 min-h-[48px]"
              >
                Our Mission
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

          <p className="text-base sm:text-lg font-light mb-4 sm:mb-6 leading-relaxed">
            Apex Verify AI exists to be the ultimate truth layer for visual media.
          </p>

          <p className="text-base sm:text-lg font-light mb-4 sm:mb-6 leading-relaxed">
            In a world where AI can fabricate images and videos indistinguishably from reality, our mission is to give
            creators, professionals, and investigators an unambiguous, trustworthy verdict: real or fake.
          </p>

          <p className="text-base sm:text-lg font-light mb-4 sm:mb-6 leading-relaxed">
            We empower users to instantly validate authenticity, trace origins, and gain deep insights into any media
            file — all through a hyper-minimal, black-and-white interface that communicates authority, precision, and
            clarity.
          </p>

          <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-white mb-4 sm:mb-6 tracking-wide">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              🔍 Our Vision
            </span>
          </h3>

          <div className="relative my-8 sm:my-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-white/20 backdrop-blur-sm shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 rounded-2xl blur-xl"></div>
            <p className="relative text-lg sm:text-xl md:text-2xl font-medium text-center leading-relaxed">
              <span className="bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-clip-text text-transparent">
                "For the past decade, the industry paid to remove watermarks. The next ten years, we will pay to have
                them on —
              </span>
              <br />
              <span className="text-gray-300 text-base sm:text-lg font-light mt-2 block">
                protecting creators, enforcing authenticity, and reclaiming trust in digital content."
              </span>
            </p>
          </div>

          <p className="text-base sm:text-lg font-light mb-4 sm:mb-6 leading-relaxed">
            Our goal is simple: To protect reality, enhance digital trust, and provide the most reliable AI-powered
            verification tools available.
          </p>

          <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-white mb-4 sm:mb-6 tracking-wide">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              ✨ How It Works
            </span>
          </h3>

          <p className="text-base sm:text-lg font-light mb-4 sm:mb-6 leading-relaxed">
            Every upload is analyzed with cutting-edge AI, returning a forensic-grade summary that combines:
          </p>

          <ul className="text-base sm:text-lg font-light mb-4 sm:mb-6 ml-6 space-y-2">
            <li>• An authenticity score</li>
            <li>• A clear assessment</li>
            <li>• A concise narrative about the content</li>
            <li>• Provenance and source evidence</li>
          </ul>

          <p className="text-base sm:text-lg font-light mb-4 sm:mb-6 leading-relaxed">
            The experience is designed to feel powerful yet effortless, like stepping into a command center for truth —
            stripped of distraction, stripped of noise, but brimming with authority.
          </p>

          <p className="text-base sm:text-lg font-light mb-4 sm:mb-6 leading-relaxed">
            Apex Verify AI doesn't just analyze media — it ensures confidence in every digital interaction, restores
            respect to creators, and turns authenticity into a visible asset.
          </p>
        </div>
      </div>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultMode={authMode} />
    </div>
  )
}

export default AboutPage
