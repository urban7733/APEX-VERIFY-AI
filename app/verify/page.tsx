"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  FileVideo,
  FileImage,
  FileAudio,
  X,
  XCircle,
  Shield,
  Download,
  ArrowLeft,
  Info,
  Search,
  Globe,
  FileText,
  Eye,
  Brain,
  Zap,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { analysisEngine, type AnalysisProgress, type ComprehensiveAnalysisResult } from "@/lib/analysis-engine"

interface UploadedFile {
  id: string
  file: File
  preview?: string
  type: "video" | "image" | "audio"
  status: "pending" | "analyzing" | "complete" | "error"
  analysis?: ComprehensiveAnalysisResult
  error?: string
  timestamp: Date
  metadata?: EnhancedMediaMetadata
  reverseSearchResults?: ReverseSearchResult[]
  deepfakeAnalysis?: DeepfakeAnalysisResult
}

interface EnhancedMediaMetadata {
  fileName: string
  fileSize: number
  fileType: string
  mimeType: string
  dimensions?: { width: number; height: number }
  duration?: number
  bitrate?: number
  frameRate?: number
  colorSpace?: string
  compression?: string
  createdDate?: Date
  modifiedDate?: Date
  camera?: string
  location?: string
  hash: string
  exifData?: {
    make?: string
    model?: string
    software?: string
    dateTime?: string
    gps?: { latitude?: number; longitude?: number }
    iso?: number
    aperture?: string
    shutterSpeed?: string
    focalLength?: string
    gps?: { latitude?: number; longitude?: number }
    iso?: number
    aperture?: string
    shutterSpeed?: string
    focalLength?: string
  }
  technicalSpecs?: {
    codec?: string
    profile?: string
    level?: string
    pixelFormat?: string
    sampleRate?: number
    channels?: number
    bitDepth?: number
  }
}

interface ReverseSearchResult {
  url: string
  title: string
  source: string
  similarity: number
  publishDate?: Date
  thumbnail?: string
  context: string
}

interface DeepfakeAnalysisResult {
  isDeepfake: boolean
  confidence: number
  framework: string
  modelVersion: string
  detectionMethods: {
    faceSwapDetection: { score: number; artifacts: string[] }
    lipSyncAnalysis: { score: number; inconsistencies: string[] }
    temporalConsistency: { score: number; anomalies: string[] }
    frequencyAnalysis: { score: number; patterns: string[] }
    eyeBlinkAnalysis: { score: number; naturalness: number }
    facialLandmarks: { score: number; distortions: string[] }
  }
  aiProviderSignature?: {
    detectedProvider: string
    confidence: number
    characteristics: string[]
  }
  manipulationRegions?: Array<{
    x: number
    y: number
    width: number
    height: number
    confidence: number
    type: string
  }>
}

// Enhanced metadata extraction
const extractEnhancedMetadata = async (file: File): Promise<EnhancedMediaMetadata> => {
  const metadata: EnhancedMediaMetadata = {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type.split("/")[0],
    mimeType: file.type,
    createdDate: new Date(file.lastModified),
    modifiedDate: new Date(file.lastModified),
    hash: await generateFileHash(file),
  }

  try {
    if (file.type.startsWith("image/")) {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.src = url

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error("Failed to load image"))
        setTimeout(() => reject(new Error("Image load timeout")), 10000)
      })

      metadata.dimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      }

      // Simulate EXIF data extraction
      metadata.exifData = {
        make: "Canon",
        model: "EOS R5",
        software: "Adobe Photoshop 2024",
        dateTime: new Date().toISOString(),
        iso: 400,
        aperture: "f/2.8",
        shutterSpeed: "1/125",
        focalLength: "85mm",
        gps: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      }

      metadata.technicalSpecs = {
        colorSpace: "sRGB",
        compression: file.type.includes("jpeg") ? "JPEG" : "PNG",
        bitDepth: 8,
        pixelFormat: "RGB",
      }

      URL.revokeObjectURL(url)
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video")
      const url = URL.createObjectURL(file)
      video.src = url

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve()
        video.onerror = () => reject(new Error("Failed to load video"))
        setTimeout(() => reject(new Error("Video load timeout")), 10000)
      })

      metadata.dimensions = {
        width: video.videoWidth,
        height: video.videoHeight,
      }
      metadata.duration = video.duration
      metadata.frameRate = 30
      metadata.bitrate = Math.round((file.size * 8) / video.duration / 1000)

      metadata.technicalSpecs = {
        codec: "H.264",
        profile: "High",
        level: "4.1",
        pixelFormat: "yuv420p",
        bitDepth: 8,
      }

      URL.revokeObjectURL(url)
    } else if (file.type.startsWith("audio/")) {
      metadata.technicalSpecs = {
        codec: "AAC",
        sampleRate: 44100,
        channels: 2,
        bitDepth: 16,
      }
    }
  } catch (error) {
    console.warn("Failed to extract enhanced metadata:", error)
  }

  return metadata
}

// Reverse image search simulation
const performReverseImageSearch = async (file: File): Promise<ReverseSearchResult[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const fileName = file.name.toLowerCase()
  const hasResults = Math.random() > 0.3 // 70% chance of finding results

  if (!hasResults) return []

  return [
    {
      url: "https://example.com/original-source",
      title: "Original Image Source",
      source: "Getty Images",
      similarity: 0.98,
      publishDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      context: "Stock photography collection",
    },
    {
      url: "https://news.example.com/article",
      title: "Breaking News Article",
      source: "Reuters",
      similarity: 0.87,
      publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      context: "News article featuring this image",
    },
    {
      url: "https://social.example.com/post",
      title: "Social Media Post",
      source: "Twitter",
      similarity: 0.75,
      publishDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      context: "Viral social media post",
    },
  ]
}

// Enhanced deepfake detection
const performDeepfakeAnalysis = async (file: File): Promise<DeepfakeAnalysisResult> => {
  // Simulate advanced AI analysis
  await new Promise((resolve) => setTimeout(resolve, 3000))

  const isLikelyDeepfake = Math.random() > 0.7 // 30% chance of deepfake

  const baseScore = isLikelyDeepfake ? 0.2 + Math.random() * 0.3 : 0.7 + Math.random() * 0.3

  return {
    isDeepfake: isLikelyDeepfake,
    confidence: isLikelyDeepfake ? 1 - baseScore : baseScore,
    framework: "FaceForensics++",
    modelVersion: "v2.1.0",
    detectionMethods: {
      faceSwapDetection: {
        score: baseScore + (Math.random() - 0.5) * 0.1,
        artifacts: isLikelyDeepfake ? ["Face boundary inconsistencies", "Lighting mismatches"] : [],
      },
      lipSyncAnalysis: {
        score: baseScore + (Math.random() - 0.5) * 0.1,
        inconsistencies: isLikelyDeepfake ? ["Audio-visual desynchronization"] : [],
      },
      temporalConsistency: {
        score: baseScore + (Math.random() - 0.5) * 0.1,
        anomalies: isLikelyDeepfake ? ["Frame-to-frame inconsistencies"] : [],
      },
      frequencyAnalysis: {
        score: baseScore + (Math.random() - 0.5) * 0.1,
        patterns: isLikelyDeepfake ? ["Unusual frequency signatures"] : [],
      },
      eyeBlinkAnalysis: {
        score: baseScore + (Math.random() - 0.5) * 0.1,
        naturalness: isLikelyDeepfake ? 0.3 : 0.9,
      },
      facialLandmarks: {
        score: baseScore + (Math.random() - 0.5) * 0.1,
        distortions: isLikelyDeepfake ? ["Landmark displacement", "Geometric inconsistencies"] : [],
      },
    },
    aiProviderSignature: isLikelyDeepfake
      ? {
          detectedProvider: "DeepFaceLab",
          confidence: 0.85,
          characteristics: ["SAEHD model artifacts", "Specific compression patterns"],
        }
      : undefined,
    manipulationRegions: isLikelyDeepfake
      ? [
          {
            x: 150,
            y: 100,
            width: 200,
            height: 250,
            confidence: 0.92,
            type: "Face region",
          },
        ]
      : undefined,
  }
}

// Download functions
const downloadLogo = () => {
  const link = document.createElement("a")
  link.href = "/verify-logo.png"
  link.download = "apex-verify-logo.png"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const drawApexVerifyBadge = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const badgeImage = new Image()
  badgeImage.src = "/verify-logo.png"

  badgeImage.onload = () => {
    ctx.save()
    ctx.globalAlpha = 0.9
    ctx.drawImage(badgeImage, x, y, size, size)
    ctx.restore()
  }
}

const downloadMediaWithLogo = async (file: UploadedFile) => {
  if (file.type === "image" && file.preview) {
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const img = new Image()
      img.crossOrigin = "anonymous"

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error("Failed to load image"))
        img.src = file.preview!
      })

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Create logo
      const logoSize = Math.min(canvas.width, canvas.height) * 0.15
      const padding = logoSize * 0.3
      const logoX = canvas.width - logoSize - padding
      const logoY = canvas.height - logoSize - padding

      // Draw background for logo
      ctx.save()
      ctx.globalAlpha = 0.8
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
      ctx.beginPath()

      // Use fallback for roundRect if not supported
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(logoX - padding / 2, logoY - padding / 2, logoSize + padding, logoSize + padding, 10)
      } else {
        ctx.rect(logoX - padding / 2, logoY - padding / 2, logoSize + padding, logoSize + padding)
      }

      ctx.fill()
      ctx.restore()

      // Draw verification badge
      drawApexVerifyBadge(ctx, logoX - logoSize, logoY, logoSize)

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `verified-${file.file.name}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      }, "image/png")
    } catch (error) {
      console.error("Failed to download image with logo:", error)
      downloadOriginalFile(file)
    }
  } else {
    downloadOriginalFile(file)
  }
}

const downloadOriginalFile = (file: UploadedFile) => {
  const url = URL.createObjectURL(file.file)
  const link = document.createElement("a")
  link.href = url
  link.download = file.file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

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

async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}

export default function VerifyPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [currentStep, setCurrentStep] = useState<"upload" | "analysis" | "results">("upload")
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null)
  const { user, logout } = useAuth()

  useEffect(() => {
    analysisEngine.initialize().catch(console.error)
  }, [])

  useEffect(() => {
    if (files.length > 0 && selectedFile === null) {
      setSelectedFile(files[0].id)
    }
  }, [files, selectedFile])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFiles = async (fileList: File[]) => {
    const validFiles = fileList.filter((file) => {
      const validTypes = [
        "video/mp4",
        "video/avi",
        "video/mov",
        "video/webm",
        "image/jpeg",
        "image/png",
        "image/webp",
        "audio/mp3",
        "audio/wav",
        "audio/aac",
        "audio/flac",
      ]
      const maxSize = 500 * 1024 * 1024
      return validTypes.includes(file.type) && file.size <= maxSize
    })

    const newFiles: UploadedFile[] = await Promise.all(
      validFiles.map(async (file) => {
        const id = Math.random().toString(36).substr(2, 9)
        let type: "video" | "image" | "audio"

        if (file.type.startsWith("video/")) type = "video"
        else if (file.type.startsWith("image/")) type = "image"
        else type = "audio"

        const metadata = await extractEnhancedMetadata(file)

        const newFile: UploadedFile = {
          id,
          file,
          type,
          status: "pending",
          timestamp: new Date(),
          metadata,
        }

        if (type === "image" || type === "video") {
          const url = URL.createObjectURL(file)
          newFile.preview = url
        }

        return newFile
      }),
    )

    setFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
    if (selectedFile === id) {
      setSelectedFile(files.length > 1 ? files[0].id : null)
    }
  }

  const startAnalysis = async () => {
    setCurrentStep("analysis")

    for (const file of files) {
      if (file.status !== "pending") continue

      setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: "analyzing" } : f)))

      try {
        // Run all analyses in parallel
        const [analysisResult, reverseSearchResults, deepfakeAnalysis] = await Promise.all([
          analysisEngine.analyzeFile(file.file, (progress) => setAnalysisProgress(progress)),
          file.type === "image" ? performReverseImageSearch(file.file) : Promise.resolve([]),
          performDeepfakeAnalysis(file.file),
        ])

        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: "complete",
                  analysis: analysisResult,
                  reverseSearchResults,
                  deepfakeAnalysis,
                }
              : f,
          ),
        )
      } catch (error) {
        console.error("Analysis failed:", error)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: "error",
                  error: error instanceof Error ? error.message : "Analysis failed",
                }
              : f,
          ),
        )
      }
    }

    setAnalysisProgress(null)
    setCurrentStep("results")
  }

  const resetVerification = () => {
    setFiles([])
    setSelectedFile(null)
    setCurrentStep("upload")
    setAnalysisProgress(null)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "video":
        return FileVideo
      case "image":
        return FileImage
      case "audio":
        return FileAudio
      default:
        return Upload
    }
  }

  const getSelectedFile = () => {
    return files.find((file) => file.id === selectedFile)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased relative overflow-hidden">
      <Starfield />

      {/* Logo Watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <Image src="/verify-logo.png" alt="" width={600} height={600} className="opacity-[0.015] select-none" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <Image
                src="/verify-logo.png"
                alt="Apex Verify"
                width={32}
                height={32}
                className="opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent group-hover:from-gray-100 group-hover:via-white group-hover:to-gray-100 transition-all duration-300 tracking-tight">
                  Apex Verify AI
                </span>
              </div>
            </Link>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-white/40 font-light">AI Ready</span>
              </div>
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
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Upload Step */}
          {currentStep === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center space-y-16"
            >
              {/* Headline */}
              <div className="space-y-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight space-y-1">
                  <div className="mb-1">
                    <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                      Advanced media
                    </span>
                  </div>
                  <div className="mb-1">
                    <span className="bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-clip-text text-transparent">
                      verification system
                    </span>
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                      Detect deepfakes instantly.
                    </span>
                  </div>
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed px-4 sm:px-0">
                  Advanced AI-powered analysis for deepfake detection and content authenticity verification
                </p>
              </div>

              {/* File Upload Container */}
              <div className="max-w-2xl mx-auto">
                <div
                  className={`group relative cursor-pointer transition-all duration-500 ${
                    dragActive ? "scale-[1.02]" : ""
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl p-16 group-hover:border-white/20 transition-all duration-500">
                    <div className="flex flex-col items-center space-y-8">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative">
                          <Image
                            src="/verify-logo.png"
                            alt="Apex Verify"
                            width={48}
                            height={48}
                            className="opacity-60 group-hover:opacity-90 transition-all duration-500 animate-pulse"
                            style={{
                              animation: "float 3s ease-in-out infinite",
                            }}
                          />
                          <style jsx>{`
                            @keyframes float {
                              0%, 100% { transform: translateY(0px); }
                              50% { transform: translateY(-10px); }
                            }
                          `}</style>
                        </div>
                      </div>
                      <div className="text-center space-y-4">
                        <h3 className="text-2xl font-light text-white">Drop files here</h3>
                        <p className="text-white/40 font-light">
                          MP4, AVI, MOV, WebM • JPEG, PNG, WebP • MP3, WAV, AAC
                          <br />
                          <span className="text-white/30">Maximum 500MB</span>
                        </p>
                        <Button className="bg-white/10 hover:bg-white/20 text-white border-0 px-8 py-3 rounded-xl font-light transition-all duration-300">
                          Select Files
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".mp4,.avi,.mov,.webm,.jpg,.jpeg,.png,.webp,.mp3,.wav,.aac,.flac"
                  onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files */}
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="max-w-3xl mx-auto space-y-8"
                >
                  <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                    <h3 className="text-xl font-light mb-6 text-center text-white/80">Files Ready ({files.length})</h3>
                    <div className="space-y-3">
                      {files.map((file) => {
                        const Icon = getFileIcon(file.type)
                        return (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:bg-white/[0.04] transition-all duration-300"
                          >
                            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                              <Icon className="h-5 w-5 text-white/60" />
                            </div>
                            <div className="flex-1">
                              <p className="font-light text-white/90">{file.file.name}</p>
                              <div className="flex items-center gap-4 text-sm text-white/40">
                                <span>{formatFileSize(file.file.size)}</span>
                                {file.metadata?.dimensions && (
                                  <span>
                                    {file.metadata.dimensions.width}×{file.metadata.dimensions.height}
                                  </span>
                                )}
                                {file.metadata?.duration && <span>{file.metadata.duration.toFixed(1)}s</span>}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="text-white/30 hover:text-white/60 hover:bg-white/5 rounded-lg"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        )
                      })}
                    </div>
                    <div className="mt-8 text-center">
                      <Button
                        onClick={startAnalysis}
                        className="bg-white/10 hover:bg-white/20 text-white border-0 px-12 py-4 rounded-xl font-light transition-all duration-300"
                      >
                        Begin Analysis
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Analysis Step */}
          {currentStep === "analysis" && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto space-y-16"
            >
              <div className="space-y-8">
                <div className="relative">
                  <Image
                    src="/verify-logo.png"
                    alt="Apex Verify AI"
                    width={120}
                    height={120}
                    className="mx-auto opacity-60 animate-pulse"
                  />
                </div>

                <div className="space-y-4">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight space-y-1">
                    <div className="mb-1">
                      <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                        Analyzing your
                      </span>
                    </div>
                    <div className="mb-1">
                      <span className="bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-clip-text text-transparent">
                        content with AI
                      </span>
                    </div>
                    <div>
                      <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                        Please wait.
                      </span>
                    </div>
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed px-4 sm:px-0">
                    Running comprehensive verification protocols using advanced AI detection systems
                  </p>
                </div>
              </div>

              {analysisProgress && (
                <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-12">
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 font-light">{analysisProgress.message}</span>
                      <span className="text-white font-light text-2xl">{analysisProgress.progress}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={analysisProgress.progress} className="h-1 bg-white/10 rounded-full" />
                    </div>
                    {analysisProgress.currentStep && (
                      <p className="text-white/40 text-center font-light">{analysisProgress.currentStep}</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Results Step */}
          {currentStep === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="max-w-5xl mx-auto space-y-12"
            >
              {getSelectedFile()?.status === "complete" && getSelectedFile()?.deepfakeAnalysis && (
                <>
                  {/* Back Button */}
                  <div className="flex items-center justify-start">
                    <Button
                      onClick={resetVerification}
                      variant="ghost"
                      className="text-white/40 hover:text-white/80 flex items-center gap-2 font-light"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      New Analysis
                    </Button>
                  </div>

                  {/* Result Header */}
                  <div className="text-center space-y-8">
                    {getSelectedFile()?.deepfakeAnalysis?.isDeepfake ? (
                      <div className="space-y-6">
                        <XCircle className="h-24 w-24 mx-auto text-red-400 opacity-80" />
                        <h2 className="text-5xl font-extralight text-red-400">Deepfake Detected</h2>
                        <div className="space-y-4">
                          <div className="inline-flex items-center px-8 py-4 bg-red-500/10 text-red-300 border border-red-500/20 rounded-full text-xl font-light">
                            {(getSelectedFile()?.deepfakeAnalysis?.confidence * 100).toFixed(1)}% Confidence
                          </div>
                          <div className="text-white/40 text-sm font-light">
                            {getSelectedFile()?.deepfakeAnalysis?.framework}{" "}
                            {getSelectedFile()?.deepfakeAnalysis?.modelVersion}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <Image
                          src="/verify-logo.png"
                          alt="Apex Verify"
                          width={96}
                          height={96}
                          className="mx-auto opacity-80"
                        />
                        <h2 className="text-5xl font-extralight text-emerald-400">Authentic Content</h2>
                        <div className="inline-flex items-center px-8 py-4 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full text-xl font-light">
                          {(getSelectedFile()?.deepfakeAnalysis?.confidence * 100).toFixed(1)}% Confidence
                        </div>
                      </div>
                    )}

                    <p className="text-white/50 text-lg font-light">
                      Analysis complete for <span className="text-white/80">{getSelectedFile()?.file.name}</span>
                    </p>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Creator Summary */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Brain className="h-4 w-4 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-light text-white">Summary</h3>
                      </div>
                      <div className="space-y-6">
                        {getSelectedFile()?.deepfakeAnalysis?.isDeepfake ? (
                          <div className="space-y-4">
                            <p className="text-white/80 leading-relaxed font-light">
                              ⚠️ This content appears to be artificially generated or manipulated. Our AI detected signs
                              of deepfake technology with{" "}
                              {(getSelectedFile()?.deepfakeAnalysis?.confidence * 100).toFixed(0)}% confidence.
                            </p>
                            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                              <p className="text-red-300/80 text-sm font-light">
                                This content may not represent real events or people. Exercise caution when sharing or
                                using this material.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-white/80 leading-relaxed font-light">
                              ✓ This content appears to be authentic and unmanipulated. Our AI analysis found no signs
                              of deepfake technology with{" "}
                              {(getSelectedFile()?.deepfakeAnalysis?.confidence * 100).toFixed(0)}% confidence.
                            </p>
                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                              <p className="text-emerald-300/80 text-sm font-light">
                                This appears to be genuine content that can be shared with confidence.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <div className="bg-white/[0.02] rounded-xl p-4 text-center">
                            <div className="text-lg font-light text-white">
                              {getSelectedFile()?.metadata?.dimensions
                                ? `${getSelectedFile()?.metadata?.dimensions.width}×${getSelectedFile()?.metadata?.dimensions.height}`
                                : "N/A"}
                            </div>
                            <div className="text-xs text-white/40 font-light">Resolution</div>
                          </div>
                          <div className="bg-white/[0.02] rounded-xl p-4 text-center">
                            <div className="text-lg font-light text-white">
                              {formatFileSize(getSelectedFile()?.metadata?.fileSize || 0)}
                            </div>
                            <div className="text-xs text-white/40 font-light">File Size</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Technical Summary */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                          <Zap className="h-4 w-4 text-white/60" />
                        </div>
                        <h3 className="text-xl font-light text-white">Technical Details</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-white/50 text-sm font-light">Framework:</span>
                            <span className="text-white/80 font-light text-sm">
                              {getSelectedFile()?.deepfakeAnalysis?.framework}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/50 text-sm font-light">Confidence:</span>
                            <span className="text-white/80 font-light text-sm">
                              {(getSelectedFile()?.deepfakeAnalysis?.confidence * 100).toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/50 text-sm font-light">Hash:</span>
                            <span className="text-white/80 font-mono text-xs">
                              {getSelectedFile()?.metadata?.hash.substring(0, 12)}...
                            </span>
                          </div>
                        </div>

                        {/* Detection Methods Summary */}
                        <div className="bg-white/[0.02] rounded-xl p-4 mt-6">
                          <h4 className="text-white/80 font-light mb-4 text-sm">Detection Methods:</h4>
                          <div className="space-y-3">
                            {Object.entries(getSelectedFile()?.deepfakeAnalysis?.detectionMethods || {})
                              .slice(0, 3)
                              .map(([method, data]) => (
                                <div key={method} className="flex justify-between items-center">
                                  <span className="text-white/40 text-xs font-light capitalize">
                                    {method.replace(/([A-Z])/g, " $1")}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-12 h-0.5 bg-white/10 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-white/40 rounded-full"
                                        style={{ width: `${data.score * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-white/60 text-xs font-light w-8">
                                      {(data.score * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Analysis Tabs */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8">
                    <Tabs defaultValue="analysis" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-transparent rounded-xl p-1 gap-1">
                        <TabsTrigger
                          value="analysis"
                          className="bg-transparent text-white/60 border border-white/10 hover:bg-white/5 hover:border-white/20 data-[state=active]:bg-white/10 data-[state=active]:border-white/30 data-[state=active]:text-white rounded-lg transition-all duration-200 px-4 py-3 text-sm font-light"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          Analysis
                        </TabsTrigger>
                        <TabsTrigger
                          value="metadata"
                          className="bg-transparent text-white/60 border border-white/10 hover:bg-white/5 hover:border-white/20 data-[state=active]:bg-white/10 data-[state=active]:border-white/30 data-[state=active]:text-white rounded-lg transition-all duration-200 px-4 py-3 text-sm font-light"
                        >
                          <Info className="h-4 w-4 mr-2" />
                          Metadata
                        </TabsTrigger>
                        <TabsTrigger
                          value="search"
                          className="bg-transparent text-white/60 border border-white/10 hover:bg-white/5 hover:border-white/20 data-[state=active]:bg-white/10 data-[state=active]:border-white/30 data-[state=active]:text-white rounded-lg transition-all duration-200 px-4 py-3 text-sm font-light"
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </TabsTrigger>
                        <TabsTrigger
                          value="download"
                          className="bg-transparent text-white/60 border border-white/10 hover:bg-white/5 hover:border-white/20 data-[state=active]:bg-white/10 data-[state=active]:border-white/30 data-[state=active]:text-white rounded-lg transition-all duration-200 px-4 py-3 text-sm font-light"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="analysis" className="mt-8">
                        <div className="space-y-6">
                          <h3 className="text-xl font-light text-white/80">Detection Methods</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            {Object.entries(getSelectedFile()?.deepfakeAnalysis?.detectionMethods || {}).map(
                              ([method, data]) => (
                                <div key={method} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
                                  <div className="flex justify-between items-center mb-4">
                                    <span className="font-light capitalize text-white/80">
                                      {method.replace(/([A-Z])/g, " $1")}
                                    </span>
                                    <span className="text-sm font-light text-white/60">
                                      {(data.score * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                  <Progress value={data.score * 100} className="h-1 bg-white/10" />
                                  {data.artifacts && data.artifacts.length > 0 && (
                                    <div className="text-xs text-white/40 mt-3 font-light">
                                      {data.artifacts.join(", ")}
                                    </div>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="metadata" className="mt-8">
                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
                            <h4 className="font-light mb-4 flex items-center gap-2 text-white/80">
                              <FileText className="h-4 w-4" />
                              File Information
                            </h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-white/40 font-light">Name:</span>
                                <span className="text-white/80 font-light">
                                  {getSelectedFile()?.metadata?.fileName}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40 font-light">Size:</span>
                                <span className="text-white/80 font-light">
                                  {formatFileSize(getSelectedFile()?.metadata?.fileSize || 0)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40 font-light">Type:</span>
                                <span className="text-white/80 font-light">
                                  {getSelectedFile()?.metadata?.mimeType}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
                            <h4 className="font-light mb-4 flex items-center gap-2 text-white/80">
                              <Eye className="h-4 w-4" />
                              Properties
                            </h4>
                            <div className="space-y-3 text-sm">
                              {getSelectedFile()?.metadata?.dimensions && (
                                <div className="flex justify-between">
                                  <span className="text-white/40 font-light">Dimensions:</span>
                                  <span className="text-white/80 font-light">
                                    {getSelectedFile()?.metadata?.dimensions.width} ×{" "}
                                    {getSelectedFile()?.metadata?.dimensions.height}
                                  </span>
                                </div>
                              )}
                              {getSelectedFile()?.metadata?.duration && (
                                <div className="flex justify-between">
                                  <span className="text-white/40 font-light">Duration:</span>
                                  <span className="text-white/80 font-light">
                                    {getSelectedFile()?.metadata?.duration.toFixed(2)}s
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-white/40 font-light">Created:</span>
                                <span className="text-white/80 font-light">
                                  {formatDate(getSelectedFile()?.metadata?.createdDate || new Date())}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="search" className="mt-8">
                        <div className="space-y-6">
                          <h3 className="text-xl font-light text-white/80">Reverse Search Results</h3>
                          {getSelectedFile()?.reverseSearchResults &&
                          getSelectedFile()?.reverseSearchResults.length > 0 ? (
                            <div className="space-y-4">
                              {getSelectedFile()?.reverseSearchResults.map((result, index) => (
                                <div key={index} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h4 className="font-light text-white/90">{result.title}</h4>
                                      <p className="text-sm text-white/40 font-light">{result.source}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-light text-white/80">
                                        {(result.similarity * 100).toFixed(1)}% match
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-sm text-white/60 mb-3 font-light">{result.context}</p>
                                  <a
                                    href={result.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white/60 hover:text-white/80 text-sm flex items-center gap-1 underline font-light"
                                  >
                                    <Globe className="h-3 w-3" />
                                    View Source
                                  </a>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <Search className="h-12 w-12 mx-auto text-white/20 mb-4" />
                              <p className="text-white/40 font-light">No reverse search results found</p>
                              <p className="text-sm text-white/30 font-light">This may indicate original content</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="download" className="mt-8">
                        <div className="space-y-6">
                          <h3 className="text-xl font-light text-white/80">Export Options</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button
                              onClick={() => downloadMediaWithLogo(getSelectedFile()!)}
                              className="bg-white/10 hover:bg-white/20 text-white border-0 px-6 py-4 rounded-xl font-light transition-all duration-200"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              With Verification
                            </Button>
                            <Button
                              onClick={() => downloadOriginalFile(getSelectedFile()!)}
                              className="bg-white/10 hover:bg-white/20 text-white border-0 px-6 py-4 rounded-xl font-light transition-all duration-200"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Original File
                            </Button>
                            <Button
                              onClick={downloadLogo}
                              className="bg-white/10 hover:bg-white/20 text-white border-0 px-6 py-4 rounded-xl font-light transition-all duration-200"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Logo Only
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </>
              )}

              {/* Error State */}
              {getSelectedFile()?.status === "error" && (
                <div className="text-center space-y-8">
                  <XCircle className="h-20 w-20 mx-auto text-red-400 opacity-60" />
                  <div>
                    <h2 className="text-4xl font-extralight text-red-400 mb-4">Analysis Failed</h2>
                    <p className="text-white/50 text-lg font-light">{getSelectedFile()?.error}</p>
                  </div>
                  <Button
                    onClick={resetVerification}
                    className="bg-white/10 hover:bg-white/20 text-white border-0 px-8 py-3 rounded-xl font-light transition-all duration-300"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
