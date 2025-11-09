"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Upload, X, Download } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

interface AnalysisResult {
  isManipulated: boolean
  confidence: number
  processingTime: number
  manipulationType?: "manual" | "ai" | null
}

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const analyzeFile = useCallback(async (fileToAnalyze: File) => {
    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append("file", fileToAnalyze)

      // Call REAL BACKEND ML PIPELINE
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(60000), // 60s timeout
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`)
      }

      const backendResult = await response.json()

      // Convert backend result to frontend format
      const analysisResult: AnalysisResult = {
        isManipulated: backendResult.is_manipulated || backendResult.is_ai_generated,
        confidence: backendResult.confidence,
        processingTime: backendResult.processing_time * 1000,
        manipulationType: backendResult.manipulation_type,
      }

      setResult(analysisResult)
    } catch (error) {
      console.error("❌ Backend ML Pipeline Failed:", error)
      alert(
        `Analysis failed: ${error instanceof Error ? error.message : "Backend unavailable"}. Please ensure the backend is running.`,
      )
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
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
    },
    [analyzeFile],
  )

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

      // Load watermark - HIGH QUALITY
      const watermark = new window.Image()
      watermark.crossOrigin = "anonymous"

      await new Promise((resolve, reject) => {
        watermark.onload = resolve
        watermark.onerror = reject
        watermark.src = "/watermark-logo.png"
      })

      // Calculate watermark size - BIGGER for better quality (15% instead of 10%)
      const watermarkWidth = img.width * 0.15
      const watermarkHeight = (watermark.height / watermark.width) * watermarkWidth

      // Position in BOTTOM-LEFT corner with padding
      const padding = img.width * 0.03
      const watermarkX = padding
      const watermarkY = img.height - watermarkHeight - padding

      // Enable smooth rendering for better quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      // Draw watermark at BOTTOM-LEFT
      ctx.drawImage(watermark, watermarkX, watermarkY, watermarkWidth, watermarkHeight)

      // Convert to blob and download - HIGH QUALITY PNG
      canvas.toBlob(
        (blob) => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `verified-${file.name}`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        },
        "image/png",
        1.0,
      )
    } catch (error) {
      console.error("Failed to add watermark:", error)
      alert("Failed to download with watermark. Please try again.")
    }
  }, [previewUrl, file])


  return (
    <div className="min-h-screen bg-[#000000] text-white antialiased relative">
      <div className="absolute top-6 right-6 z-30 flex items-center gap-4">
        <Link href="/memory" className="inline-flex">
          <Button className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl text-white px-5 py-2 rounded-full">
            Memory
          </Button>
        </Link>
      </div>
      <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden pt-20 sm:pt-24 gap-6 sm:gap-8">
        {/* Hero Video */}
        <div className="relative z-10 w-full max-w-[760px] px-8">
          <video
            className="w-full h-auto max-w-[720px] mx-auto"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/video/herovideo.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* Software Description Box */}
      <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-24 sm:py-32 lg:py-40">
        <div className="max-w-4xl mx-auto">
          <div className="animated-border p-8 sm:p-12 lg:p-16">
            <div className="space-y-6 sm:space-y-8 text-center">
              <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                Apex Verify AI uses advanced machine learning to detect AI-generated and manipulated content in images and videos. Our technology analyzes digital fingerprints, metadata patterns, and visual artifacts to determine authenticity with high accuracy.
              </p>
              
              <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                Creators can verify their work, add tamper-proof watermarks, and build trust with audiences. Brands and platforms can ensure content integrity and protect against deepfakes and synthetic media.
              </p>

              <div className="pt-6 sm:pt-8">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight max-w-2xl mx-auto">
                  We are transforming the whole creator economy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 sm:px-8 py-20">
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
                        {/* Clean Result - White Only */}
                        <div className="inline-flex items-center justify-center">
                          <div className="relative px-8 py-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl">
                            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                              {result.isManipulated ? "Manipulated" : "Verified"}
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
                              className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 bg-gradient-to-r from-white/80 to-white/60"
                              style={{ width: `${Math.round(result.confidence * 100)}%` }}
                            />
                          </div>
                          <div className="text-2xl font-semibold text-white/90 tracking-tight">
                            {Math.round(result.confidence * 100)}%
                          </div>
                        </div>

                        {/* Clean Download Button */}
                        {!result.isManipulated && file?.type.startsWith("image/") && (
                          <Button
                            onClick={downloadWithWatermark}
                            className="group relative w-full overflow-hidden bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 rounded-xl px-6 py-5 transition-all duration-300 backdrop-blur-xl shadow-lg"
                          >
                            <div className="relative flex items-center justify-center gap-3">
                              <Download className="w-5 h-5 text-white" />
                              <span className="text-base font-bold tracking-tight" style={{ color: "#FFFFFF" }}>
                                DOWNLOAD
                              </span>
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
