"use client"
import { useState, useRef, useEffect } from "react"
import React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  LogOut,
  LinkIcon,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Database,
  Shield,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"

// Starfield component
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const stars: Array<{ x: number; y: number; opacity: number; twinkle: number }> = []
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        opacity: Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * 0.02 + 0.005,
      })
    }

    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        star.opacity += star.twinkle
        if (star.opacity > 1 || star.opacity < 0.2) {
          star.twinkle = -star.twinkle
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fillRect(star.x, star.y, 1, 1)
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-60" />
}

interface VerificationResult {
  id: string
  url?: string
  filename?: string
  status: "verified_authentic" | "verified_deepfake" | "not_found"
  confidence?: number
  verifiedDate?: string
  verificationCount?: number
  aiProvider?: string
}

export default function DeepfakeMemoryPage() {
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResult, setSearchResult] = useState<VerificationResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchType, setSearchType] = useState<"link" | "file">("link")
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock database of previously verified content
  const verifiedContentDatabase: Record<string, VerificationResult> = {
    "https://youtube.com/watch?v=example1": {
      id: "vid_001",
      url: "https://youtube.com/watch?v=example1",
      status: "verified_authentic",
      confidence: 99.8,
      verifiedDate: "2024-01-15",
      verificationCount: 1,
    },
    "https://twitter.com/user/status/123": {
      id: "img_002",
      url: "https://twitter.com/user/status/123",
      status: "verified_deepfake",
      confidence: 97.2,
      verifiedDate: "2024-01-10",
      verificationCount: 3,
      aiProvider: "DeepFaceLab",
    },
    "celebrity_deepfake.mp4": {
      id: "vid_003",
      filename: "celebrity_deepfake.mp4",
      status: "verified_deepfake",
      confidence: 94.7,
      verifiedDate: "2024-01-08",
      verificationCount: 7,
      aiProvider: "FaceSwap",
    },
    "family_vacation.jpg": {
      id: "img_004",
      filename: "family_vacation.jpg",
      status: "verified_authentic",
      confidence: 98.5,
      verifiedDate: "2024-01-12",
      verificationCount: 2,
    },
    "https://instagram.com/p/fake_post": {
      id: "img_005",
      url: "https://instagram.com/p/fake_post",
      status: "verified_deepfake",
      confidence: 96.3,
      verifiedDate: "2024-01-05",
      verificationCount: 5,
      aiProvider: "StyleGAN",
    },
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const result = verifiedContentDatabase[searchQuery.trim()]
    if (result) {
      setSearchResult(result)
    } else {
      setSearchResult({
        id: "not_found",
        url: searchType === "link" ? searchQuery.trim() : undefined,
        filename: searchType === "file" ? searchQuery.trim() : undefined,
        status: "not_found",
      })
    }

    setIsSearching(false)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSearchQuery(file.name)
      setSearchType("file")
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSearchQuery(file.name)
      setSearchType("file")
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "verified_authentic":
        return {
          icon: CheckCircle,
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/5",
          borderColor: "border-emerald-500/10",
          text: "Verified Authentic",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        }
      case "verified_deepfake":
        return {
          icon: XCircle,
          color: "text-red-400",
          bgColor: "bg-red-500/5",
          borderColor: "border-red-500/10",
          text: "Verified Deepfake",
          badge: "bg-red-500/10 text-red-400 border-red-500/20",
        }
      default:
        return {
          icon: AlertCircle,
          color: "text-amber-400",
          bgColor: "bg-amber-500/5",
          borderColor: "border-amber-500/10",
          text: "Not Found in Memory",
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        }
    }
  }

  const resetSearch = () => {
    setSearchQuery("")
    setSearchResult(null)
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased relative overflow-hidden">
      <Starfield />

      {/* Logo Watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <Image
          src="/truth-intelligence-logo.png"
          alt=""
          width={600}
          height={600}
          className="opacity-[0.015] select-none"
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <Image
                src="/truth-intelligence-logo.png"
                alt="Truth Intelligence"
                width={32}
                height={32}
                className="opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <div className="flex items-center space-x-2">
                <span className="text-lg font-light text-white/90 group-hover:text-white transition-colors">
                  Apex Verify
                </span>
                <span className="text-sm font-extralight text-white/50">Memory</span>
              </div>
            </Link>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-white/40 font-light">AI Ready</span>
              </div>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/40 hover:text-white/80 p-2 transition-colors"
                  onClick={() => {
                    logout()
                    window.location.href = "/"
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
        <div className="text-center max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight space-y-1">
                <div className="mb-1">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                    Deepfake Memory
                  </span>
                </div>
                <div>
                  <span className="bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-clip-text text-transparent text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                    Search verified content.
                  </span>
                </div>
              </h1>
              <p className="text-lg md:text-xl font-light text-white/50 max-w-2xl mx-auto leading-relaxed">
                Check if content has been previously verified by our AI system
              </p>
            </motion.div>
          </div>

          {/* Search Interface */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-2xl mx-auto mb-20"
          >
            {/* Search Type Toggle */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex bg-white/5 backdrop-blur-sm border border-white/10 rounded-full p-1">
                <button
                  onClick={() => {
                    setSearchType("link")
                    if (searchQuery && !searchQuery.startsWith("http")) {
                      setSearchQuery("")
                    }
                    setSearchResult(null)
                  }}
                  className={`px-6 py-3 text-sm font-light transition-all duration-300 rounded-full ${
                    searchType === "link" ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white/90"
                  }`}
                >
                  <LinkIcon className="w-4 h-4 inline mr-2" />
                  Link
                </button>
                <button
                  onClick={() => {
                    setSearchType("file")
                    if (searchQuery && searchQuery.startsWith("http")) {
                      setSearchQuery("")
                    }
                    setSearchResult(null)
                  }}
                  className={`px-6 py-3 text-sm font-light transition-all duration-300 rounded-full ${
                    searchType === "file" ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white/90"
                  }`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  File
                </button>
              </div>
            </div>

            {searchType === "link" ? (
              /* Link Search */
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/30" />
                  <Input
                    placeholder="Enter URL or media link..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-14 pr-32 h-16 bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder:text-white/30 focus:border-white/30 focus:bg-white/10 rounded-2xl text-lg font-light transition-all duration-300"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white hover:bg-white/90 text-black px-8 h-12 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>
            ) : (
              /* File Upload */
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragActive ? "border-white/30 bg-white/10" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileInput}
                  accept="image/*,video/*,audio/*"
                />
                <button onClick={() => fileInputRef.current?.click()} className="w-full cursor-pointer">
                  <Upload className="w-12 h-12 text-white/30 mx-auto mb-6" />
                  <p className="text-white/60 mb-2 font-light text-lg">
                    {searchQuery ? `Selected: ${searchQuery}` : "Drop file here or click to browse"}
                  </p>
                  <p className="text-white/30 text-sm font-light">Images, videos, and audio supported</p>
                </button>
                {searchQuery && (
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-white hover:bg-white/90 text-black px-8 mt-8 h-12 rounded-xl font-medium transition-all duration-300"
                  >
                    {isSearching ? "Searching..." : "Search Memory"}
                  </Button>
                )}
              </div>
            )}
          </motion.div>

          {/* Search Results */}
          <AnimatePresence>
            {searchResult && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl mx-auto mb-20"
              >
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                  {/* Status Header */}
                  <div
                    className={`p-8 ${getStatusConfig(searchResult.status).bgColor} border-b ${getStatusConfig(searchResult.status).borderColor}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div
                          className={`p-4 rounded-2xl ${getStatusConfig(searchResult.status).bgColor} border ${getStatusConfig(searchResult.status).borderColor}`}
                        >
                          {React.createElement(getStatusConfig(searchResult.status).icon, {
                            className: `h-8 w-8 ${getStatusConfig(searchResult.status).color}`,
                          })}
                        </div>
                        <div className="text-left">
                          <h3 className="text-2xl font-light text-white mb-2">
                            {getStatusConfig(searchResult.status).text}
                          </h3>
                          <p className="text-white/50 text-sm font-light break-all max-w-md">
                            {searchResult.url || searchResult.filename}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={`${getStatusConfig(searchResult.status).badge} border font-light px-4 py-2 rounded-full`}
                      >
                        {searchResult.status === "not_found" ? "Unknown" : "Verified"}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    {searchResult.status === "not_found" ? (
                      <div className="text-center py-8">
                        <p className="text-white/50 mb-8 font-light text-lg">
                          This content hasn't been verified yet in our memory database.
                        </p>
                        <Link href="/verify">
                          <Button className="bg-white hover:bg-white/90 text-black px-8 py-3 rounded-xl font-medium transition-all duration-300 inline-flex items-center gap-3">
                            <Shield className="h-4 w-4" />
                            Verify Now
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-10">
                        {/* Confidence Score */}
                        <div className="text-center">
                          <div className="flex justify-center items-baseline gap-2 mb-6">
                            <span className="text-6xl font-extralight text-white">{searchResult.confidence}</span>
                            <span className="text-2xl text-white/50 font-light">%</span>
                          </div>
                          <div className="max-w-xs mx-auto h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${searchResult.confidence}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className={`h-full rounded-full ${
                                searchResult.status === "verified_authentic" ? "bg-emerald-400" : "bg-red-400"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-3">
                              <Clock className="h-4 w-4 text-white/40" />
                              <span className="text-white/40 font-light text-sm tracking-wide">Verified</span>
                            </div>
                            <p className="text-white font-light text-lg">{searchResult.verifiedDate}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-3">
                              <Database className="h-4 w-4 text-white/40" />
                              <span className="text-white/40 font-light text-sm tracking-wide">Checks</span>
                            </div>
                            <p className="text-white font-light text-lg">
                              {searchResult.verificationCount} time{searchResult.verificationCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        {/* AI Provider (if deepfake) */}
                        {searchResult.aiProvider && (
                          <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-white/60 text-sm font-light mb-2">AI Provider Detected:</p>
                            <p className="text-white font-medium">{searchResult.aiProvider}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Example Searches */}
          {!searchResult && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center"
            >
              <p className="text-white/30 mb-8 font-light text-sm tracking-wide">Try these examples</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {Object.keys(verifiedContentDatabase)
                  .slice(0, 4)
                  .map((item, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSearchQuery(item)
                        setSearchType(item.startsWith("http") ? "link" : "file")
                      }}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-white/50 hover:text-white/80 font-light text-sm"
                    >
                      {item.startsWith("http") ? new URL(item).hostname : item}
                    </motion.button>
                  ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
