"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, X, Download } from "lucide-react"
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

  const downloadWithWatermark = useCallback(async () => {
    if (!previewUrl || !file) return

    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Load the original image
      const img = new window.Image()
      img.crossOrigin = "anonymous"

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = previewUrl
      })

      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw original image
      ctx.drawImage(img, 0, 0)

      // Load watermark
      const watermark = new window.Image()
      watermark.crossOrigin = "anonymous"

      await new Promise((resolve, reject) => {
        watermark.onload = resolve
        watermark.onerror = reject
        watermark.src = "/watermark-logo.png"
      })

      // Calculate watermark size (10% of image width)
      const watermarkWidth = img.width * 0.1
      const watermarkHeight = (watermark.height / watermark.width) * watermarkWidth

      // Position in top-left corner with padding
      const padding = img.width * 0.02

      // Draw watermark
      ctx.drawImage(watermark, padding, padding, watermarkWidth, watermarkHeight)

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `verified-${file.name}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, "image/png")
    } catch (error) {
      console.error("Failed to add watermark:", error)
      alert("Failed to download with watermark. Please try again.")
    }
  }, [previewUrl, file])

  const logoOpacity = Math.max(0, 1 - scrollY / 400)
  const logoScale = Math.max(0.5, 1 - scrollY / 800)
  const contentOpacity = Math.min(1, scrollY / 300)

  return (
    <div className="min-h-screen bg-[#000000] text-white antialiased relative">
      <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden pt-16 sm:pt-0">
        {/* Main Logo - Higher on mobile */}
        <div
          className="relative z-10 transition-all duration-300 ease-out -mt-20 sm:-mt-8"
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
            className="w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] relative z-10 animate-float"
            priority
          />
        </div>

        {/* Chrome Text Logo - More spacing from logo on mobile */}
        <div
          className="relative z-10 w-full max-w-[600px] sm:max-w-[700px] md:max-w-[800px] px-8 -mt-12 sm:-mt-32 md:-mt-40 transition-opacity duration-300"
          style={{
            opacity: logoOpacity,
          }}
        >
          <Image
            src="/images/design-mode/Image%2028.10.25%20at%2002.50.png"
            alt="Apex Verify AI Text"
            width={1200}
            height={300}
            className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity duration-500"
            priority
          />
        </div>
      </div>

      {/* Mission Section - YC Startup Style */}
      <div
        className="relative z-10 px-6 sm:px-8 lg:px-12 py-24 sm:py-32 lg:py-40"
        style={{
          opacity: Math.min(1, Math.max(0, (scrollY - 200) / 400)),
          transform: `translateY(${Math.max(0, 100 - (scrollY - 200) / 5)}px)`,
        }}
      >
        <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-[1.1]">
              <span className="inline-block bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent">
                Our Mission
              </span>
            </h2>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mt-6" />
          </div>

          {/* Mission Text - Clean YC Style */}
          <div className="space-y-8 sm:space-y-10 text-center font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]">
            <p className="text-[15px] sm:text-[17px] md:text-[19px] text-white/80 font-normal leading-[1.7] tracking-[-0.01em] max-w-3xl mx-auto">
              In a time when artificial intelligence can generate endless content, the line between what's real and what's synthetic is fading fast.
            </p>

            <div className="py-2 sm:py-4">
              <p className="text-[18px] sm:text-[22px] md:text-[26px] font-medium leading-[1.4] tracking-[-0.02em] max-w-3xl mx-auto">
                <span className="inline-block bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                  We're building the new standard for authenticity in the digital world.
                </span>
              </p>
            </div>

            <p className="text-[15px] sm:text-[17px] md:text-[19px] text-white/80 font-normal leading-[1.7] tracking-[-0.01em] max-w-3xl mx-auto">
              Apex Verify AI empowers creative artists, photographers, filmmakers, and brands to prove that their work is truly theirs—created by human imagination, not algorithms.
            </p>

            <p className="text-[15px] sm:text-[17px] md:text-[19px] text-white/75 font-normal leading-[1.7] tracking-[-0.01em] max-w-3xl mx-auto">
              Our technology integrates across the entire digital economy—from social media and branding to design, fashion, film, and advertising—anywhere visual content defines value.
            </p>

            <div className="pt-6 sm:pt-8 space-y-3">
              <p className="text-[18px] sm:text-[22px] md:text-[26px] font-medium leading-[1.35] tracking-[-0.02em] max-w-2xl mx-auto">
                <span className="inline-block bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent">
                  We believe the future doesn't belong to AI itself, but to those who can prove they create for real.
                </span>
              </p>
            </div>

            <div className="pt-4 sm:pt-6">
              <p className="text-[15px] sm:text-[17px] md:text-[19px] text-white/85 font-normal leading-[1.7] tracking-[-0.01em] max-w-3xl mx-auto">
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
              <div
                className={`relative group cursor-pointer transform transition-all duration-500 aspect-square overflow-hidden ${
                  dragActive ? "scale-[1.01]" : ""
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] border border-white/[0.05] group-hover:border-white/[0.1] transition-all duration-700" />

                <div className="relative p-8 sm:p-12 lg:p-16 h-full flex flex-col items-center justify-center">
                  {!file && (
                    <div className="flex flex-col items-center justify-center space-y-8">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/[0.02] backdrop-blur-sm rounded-[2rem] flex items-center justify-center group-hover:bg-white/[0.04] transition-all duration-500 border border-white/[0.05]">
                        <Upload className="w-12 h-12 sm:w-14 sm:h-14 text-white/40 group-hover:text-white/70 transition-colors duration-500" />
                      </div>

                      <div className="text-center space-y-3">
                        <p className="text-xl sm:text-2xl font-black text-white/90 tracking-[-0.03em]">Drop File</p>
                        <p className="text-[10px] text-white/20 font-light tracking-[0.3em] uppercase">
                          JPG • PNG • MP4 • Max 100MB
                        </p>
                      </div>
                    </div>
                  )}

                  {file && previewUrl && (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="absolute top-4 right-4 z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            resetAnalysis()
                          }}
                          className="bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white rounded-full border border-white/20 hover:border-white/40 transition-all duration-300 p-2.5 shadow-lg hover:shadow-xl"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      {file.type.startsWith("image/") ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <Image
                            src={previewUrl || "/placeholder.svg"}
                            alt="Preview"
                            width={600}
                            height={600}
                            className="rounded-2xl object-contain max-w-full max-h-full border border-white/[0.05]"
                          />
                        </div>
                      ) : (
                        <video
                          src={previewUrl}
                          controls
                          className="rounded-2xl max-w-full max-h-full object-contain border border-white/[0.05]"
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
              <div className="relative aspect-square overflow-hidden">
                <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] border border-white/[0.05]" />

                <div className="relative p-8 sm:p-12 lg:p-16 h-full flex flex-col justify-center items-center">
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
                    <div className="flex items-center justify-center h-full w-full">
                      <div className="text-center space-y-8 max-w-md">
                        {/* Modern Result Badge */}
                        <div className="inline-flex items-center justify-center">
                          <div
                            className={`
                              relative px-8 py-4 rounded-2xl border-2 transition-all duration-700
                              ${
                                result.isDeepfake
                                  ? "border-red-500/30 bg-red-500/5"
                                  : "border-green-500/30 bg-green-500/5"
                              }
                            `}
                          >
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent" />
                            <div className="relative">
                              <div
                                className={`
                                  text-3xl sm:text-4xl font-bold tracking-tight
                                  ${result.isDeepfake ? "text-red-400" : "text-green-400"}
                                `}
                              >
                                {result.isDeepfake ? "Manipulated" : "Authentic"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Confidence Bar */}
                        <div className="space-y-3 px-4">
                          <div className="text-[11px] text-white/40 uppercase tracking-wider font-medium">
                            Confidence
                          </div>
                          <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${
                                result.isDeepfake
                                  ? "bg-gradient-to-r from-red-500 to-red-400"
                                  : "bg-gradient-to-r from-green-500 to-green-400"
                              }`}
                              style={{ width: `${Math.round(result.confidence * 100)}%` }}
                            />
                          </div>
                          <div className="text-2xl font-semibold text-white/90 tracking-tight">
                            {Math.round(result.confidence * 100)}%
                          </div>
                        </div>

                        {/* Modern Download Button */}
                        {!result.isDeepfake && file?.type.startsWith("image/") && (
                          <Button
                            onClick={downloadWithWatermark}
                            className="group relative w-full overflow-hidden bg-gradient-to-r from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 text-white border border-white/20 hover:border-white/30 rounded-xl px-6 py-4 transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-xl"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <div className="relative flex items-center justify-center gap-2">
                              <Download className="w-4 h-4" />
                              <span className="text-sm font-semibold tracking-tight">Download Verified</span>
                            </div>
                          </Button>
                        )}
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
