"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface AnalysisResult {
  isDeepfake: boolean
  confidence: number
  processingTime: number
  manipulationType?: "manual" | "ai" | "deepfake" | null
}

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile.size > 100 * 1024 * 1024) {
      alert("File size must be less than 100MB")
      return
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"]
    if (!validTypes.includes(selectedFile.type)) {
      alert("Please select a valid image or video file")
      return
    }

    setFile(selectedFile)
    setResult(null)

    if (selectedFile.type.startsWith("image/") || selectedFile.type.startsWith("video/")) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    }

    analyzeFile(selectedFile)
  }, [])

  const analyzeFile = async (fileToAnalyze: File) => {
    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append("file", fileToAnalyze)

      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockResult: AnalysisResult = {
        isDeepfake: Math.random() > 0.5,
        confidence: 0.85 + Math.random() * 0.15,
        processingTime: 2000,
        manipulationType:
          Math.random() > 0.5 ? (["manual", "ai", "deepfake"][Math.floor(Math.random() * 3)] as any) : null,
      }

      setResult(mockResult)
    } catch (error) {
      console.error("Analysis failed:", error)
      alert("Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
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
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const resetAnalysis = () => {
    setFile(null)
    setResult(null)
    setPreviewUrl(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  const logoOpacity = Math.max(0, 1 - scrollY / 400)
  const logoScale = Math.max(0.5, 1 - scrollY / 800)
  const contentOpacity = Math.min(1, scrollY / 300)

  return (
    <div className="min-h-screen bg-[#000000] text-white antialiased relative">
      <div className="h-screen w-full flex items-center justify-center relative overflow-hidden">
        <div
          className="relative z-10 transition-all duration-300 ease-out flex flex-col items-center gap-8"
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale}) translateY(${scrollY * 0.5}px)`,
          }}
        >
          <Image
            src="/images/design-mode/ChatGPT%20Image%20Oct%2026%2C%202025%20at%2003_34_35%20AM.png"
            alt="Apex Verify AI"
            width={600}
            height={600}
            className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] relative z-10 animate-float"
            priority
          />
          
          {/* Chrome Text Logo */}
          <div className="relative w-full max-w-[800px] px-8">
            <Image
              src="/apexverifyailetter.jpeg"
              alt="Apex Verify AI Text"
              width={1200}
              height={300}
              className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity duration-500"
              priority
            />
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div
        className="relative z-10 px-6 sm:px-8 py-32 sm:py-40 lg:py-48"
        style={{
          opacity: Math.min(1, Math.max(0, (scrollY - 200) / 400)),
          transform: `translateY(${Math.max(0, 100 - (scrollY - 200) / 5)}px)`,
        }}
      >
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Title */}
          <div className="text-center">
            <h2 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-[-0.04em] leading-[0.9]"
              style={{
                textShadow: `
                  0 0 20px rgba(255, 255, 255, 0.3),
                  0 0 40px rgba(255, 255, 255, 0.2),
                  0 0 60px rgba(255, 255, 255, 0.1)
                `,
              }}
            >
              Our Mission
            </h2>
            <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mt-8" />
          </div>

          {/* Mission Text */}
          <div className="space-y-8 text-center">
            <p className="text-lg sm:text-xl md:text-2xl text-white/70 font-light leading-relaxed tracking-wide">
              In a time when artificial intelligence can generate endless content, the line between what's real and what's synthetic is fading fast.
            </p>

            <p className="text-xl sm:text-2xl md:text-3xl text-white/90 font-bold leading-relaxed tracking-tight">
              We're building the new standard for authenticity in the digital world.
            </p>

            <p className="text-lg sm:text-xl md:text-2xl text-white/70 font-light leading-relaxed tracking-wide">
              Apex Verify AI empowers creative artists, photographers, filmmakers, and brands to prove that their work is truly theirs — created by human imagination, not algorithms.
            </p>

            <p className="text-base sm:text-lg md:text-xl text-white/60 font-light leading-relaxed tracking-wide">
              Our technology integrates across the entire digital economy — from social media and branding to design, fashion, film, and advertising — anywhere visual content defines value.
            </p>

            <p 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-black leading-tight tracking-[-0.02em] pt-8"
              style={{
                textShadow: `
                  0 0 15px rgba(255, 255, 255, 0.4),
                  0 0 30px rgba(255, 255, 255, 0.2)
                `,
              }}
            >
              We believe the future doesn't belong to AI itself,
            </p>

            <p 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-black leading-tight tracking-[-0.02em]"
              style={{
                textShadow: `
                  0 0 15px rgba(255, 255, 255, 0.4),
                  0 0 30px rgba(255, 255, 255, 0.2)
                `,
              }}
            >
              but to those who can prove they create for real.
            </p>

            <div className="pt-8">
              <p className="text-lg sm:text-xl md:text-2xl text-white/80 font-medium leading-relaxed tracking-wide">
                With Apex Verify AI, creators gain the tools to verify authenticity, build trust, and stand out in a world increasingly shaped by artificial intelligence.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative z-10 px-6 sm:px-8 py-20"
        style={{
          opacity: contentOpacity,
          transform: `translateY(${Math.max(0, 50 - scrollY / 10)}px)`,
        }}
      >
        <div className="w-full max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div className="space-y-10">
              <div className="text-center lg:text-left space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.85] tracking-[-0.05em]">
                  APEX
                  <br />
                  VERIFY
                </h1>
                <div className="h-[1px] w-20 bg-white/20" />
              </div>

              <div
                className={`relative group cursor-pointer transform transition-all duration-500 aspect-square ${
                  dragActive ? "scale-[1.01]" : ""
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] border border-white/[0.05] group-hover:border-white/[0.1] transition-all duration-700" />

                <div className="relative p-12 sm:p-16 lg:p-20 h-full flex flex-col justify-center">
                  <div className="flex flex-col items-center justify-center space-y-10">
                    <div className="w-28 h-28 bg-white/[0.02] backdrop-blur-sm rounded-[2rem] flex items-center justify-center group-hover:bg-white/[0.04] transition-all duration-500 border border-white/[0.05]">
                      <Upload className="w-14 h-14 text-white/40 group-hover:text-white/70 transition-colors duration-500" />
                    </div>

                    <div className="text-center space-y-4">
                      <p className="text-2xl font-black text-white/90 tracking-[-0.03em]">Drop File</p>
                      <p className="text-[10px] text-white/20 font-light tracking-[0.3em] uppercase">
                        JPG • PNG • MP4 • Max 100MB
                      </p>
                    </div>
                  </div>

                  {file && previewUrl && (
                    <div className="relative mt-8">
                      <div className="absolute top-4 right-4 z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            resetAnalysis()
                          }}
                          className="bg-black/80 backdrop-blur-xl hover:bg-black/90 text-white rounded-2xl border border-white/[0.05] transition-all duration-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {file.type.startsWith("image/") ? (
                        <Image
                          src={previewUrl || "/placeholder.svg"}
                          alt="Preview"
                          width={600}
                          height={500}
                          className="rounded-[2rem] object-cover w-full border border-white/[0.05]"
                        />
                      ) : (
                        <video
                          src={previewUrl}
                          controls
                          className="rounded-[2rem] w-full border border-white/[0.05]"
                          style={{ maxHeight: "500px" }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>

            <div className="space-y-10">
              <div className="text-center lg:text-left space-y-4">
                <h2 className="text-3xl sm:text-4xl font-black text-white/90 tracking-[-0.03em]">Results</h2>
                <div className="h-[1px] w-16 bg-white/20" />
              </div>

              <div className="relative aspect-square">
                <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] border border-white/[0.05]" />

                <div className="relative p-12 sm:p-16 lg:p-20 h-full flex flex-col justify-center">
                  {!result && !isAnalyzing && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-8">
                        <div className="w-20 h-20 rounded-full border border-white/[0.05] flex items-center justify-center mx-auto">
                          <div className="text-white/15 text-3xl">⚡</div>
                        </div>
                        <p className="text-white/20 text-[10px] font-light tracking-[0.3em] uppercase">
                          Awaiting Upload
                        </p>
                      </div>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-10">
                        <div className="w-24 h-24 border-[2px] border-white/[0.05] border-t-white/50 rounded-full animate-spin mx-auto" />
                        <p className="text-white/40 text-[10px] font-light tracking-[0.4em] uppercase">Analyzing</p>
                      </div>
                    </div>
                  )}

                  {result && !isAnalyzing && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-12">
                        <div
                          className="text-7xl sm:text-8xl md:text-9xl font-black tracking-[-0.05em] transition-all duration-700"
                          style={{
                            color: "#ffffff",
                            textShadow: `
                              0 0 10px rgba(255, 255, 255, 0.8),
                              0 0 20px rgba(255, 255, 255, 0.6),
                              0 0 30px rgba(255, 255, 255, 0.4),
                              0 1px 0 #ccc,
                              0 2px 0 #c9c9c9,
                              0 3px 0 #bbb,
                              0 4px 0 #b9b9b9,
                              0 5px 0 #aaa,
                              0 6px 1px rgba(0,0,0,.1),
                              0 0 5px rgba(0,0,0,.1),
                              0 1px 3px rgba(0,0,0,.3),
                              0 3px 5px rgba(0,0,0,.2),
                              0 5px 10px rgba(0,0,0,.25),
                              0 10px 10px rgba(0,0,0,.2),
                              0 20px 20px rgba(0,0,0,.15)
                            `,
                            WebkitTextStroke: "1px rgba(255, 255, 255, 0.1)",
                            filter: "drop-shadow(0 0 40px rgba(255, 255, 255, 0.3))",
                          }}
                        >
                          {result.isDeepfake ? "MANIPULATED" : "REAL"}
                        </div>

                        <div className="space-y-3">
                          <div className="h-[1px] w-32 bg-white/10 mx-auto" />
                          <div className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-light">
                            {Math.round(result.confidence * 100)}% Confidence
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
