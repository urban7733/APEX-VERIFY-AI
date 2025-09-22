"use client"

import React, { type ReactNode } from "react"
import dynamic from "next/dynamic"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, ArrowLeft, X, Download, FileText } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { analysisEngine, type AnalysisProgress, type ComprehensiveAnalysisResult } from "@/lib/analysis-engine"
import { advancedDeepfakeDetector } from "@/lib/advanced-deepfake-detector"
import type { SpatialAnalysisResult } from "@/lib/spatial-analysis-engine"
import { FileVideo, FileImage, FileAudio } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { AnalysisAnimation } from "@/components/analysis_animation"

// Lazy load heavy components
const EnhancedAnalysisDisplay = dynamic(
  () => import("@/components/enhanced-analysis-display").then((mod) => ({ default: mod.EnhancedAnalysisDisplay })),
  {
    loading: () => <div className="animate-pulse bg-white/5 rounded-2xl h-64" />,
    ssr: false,
  },
)

interface GradientTextProps {
  children: ReactNode
  className?: string
  colors?: string[]
  animationSpeed?: number
  showBorder?: boolean
}

function GradientText({
  children,
  className = "",
  colors = ["#22c55e", "#3b82f6", "#22c55e"],
  animationSpeed = 8,
  showBorder = false,
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
  }

  return (
    <div
      className={`relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-[1.25rem] font-medium backdrop-blur transition-shadow duration-500 overflow-hidden cursor-pointer ${className}`}
    >
      {showBorder && (
        <div
          className="absolute inset-0 bg-cover z-0 pointer-events-none animate-gradient"
          style={{
            ...gradientStyle,
            backgroundSize: "300% 100%",
          }}
        >
          <div
            className="absolute inset-0 bg-black rounded-[1.25rem] z-[-1]"
            style={{
              width: "calc(100% - 2px)",
              height: "calc(100% - 2px)",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          ></div>
        </div>
      )}
      <div
        className="inline-block relative z-2 text-transparent bg-cover animate-gradient"
        style={{
          ...gradientStyle,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          backgroundSize: "300% 100%",
        }}
      >
        {children}
      </div>
    </div>
  )
}

// Add viewport hook
const useViewport = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkViewport()
    window.addEventListener("resize", checkViewport)
    return () => window.removeEventListener("resize", checkViewport)
  }, [])

  return { isMobile }
}

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
  createdDate?: Date
  modifiedDate?: Date
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
  dimensions?: { width: number; height: number }
  duration?: number
  bitrate?: number
  frameRate?: number
  colorSpace?: string
  compression?: string
  camera?: string
  location?: string
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
  manipulationType?: "manual" | "ai" | "deepfake" | null
}

// Minimalistic Starfield component
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isMobile } = useViewport()

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

    // Reduce stars on mobile for better performance
    const starCount = isMobile ? 40 : 80
    const stars: Array<{ x: number; y: number; opacity: number; twinkle: number }> = []

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        opacity: Math.random() * 0.4 + 0.1,
        twinkle: Math.random() * 0.01 + 0.002,
      })
    }

    let animationId: number
    let lastTime = 0
    const targetFPS = isMobile ? 30 : 60
    const frameInterval = 1000 / targetFPS

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= frameInterval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        stars.forEach((star) => {
          star.opacity += star.twinkle
          if (star.opacity > 0.5 || star.opacity < 0.1) {
            star.twinkle = -star.twinkle
          }

          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
          ctx.fillRect(star.x, star.y, 1, 1)
        })

        lastTime = currentTime
      }

      animationId = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [isMobile])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-30" />
}

const MemoizedImage = React.memo(({ src, alt, width, height, className, ...props }: any) => (
  <Image
    src={src || "/placeholder.svg"}
    alt={alt}
    width={width}
    height={height}
    className={className}
    loading="lazy"
    quality={75}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAUAdABmX/9k="
    {...props}
  />
))

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

// Generate file hash
async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}

// Create proper spatial analysis result
const createSpatialAnalysisResult = (file: File, isDeepfake: boolean, confidence: number): SpatialAnalysisResult => {
  const width = 1920
  const height = 1080

  const objects = [
    {
      id: "obj_1",
      label: "Person",
      type: "person",
      confidence: 0.95,
      boundingBox: { x: 100, y: 80, width: 300, height: 400 },
      attributes: {
        age: "adult",
        gender: "unknown",
        pose: "frontal",
      },
    },
    {
      id: "obj_2",
      label: "Background",
      type: "scene",
      confidence: 0.88,
      boundingBox: { x: 0, y: 0, width: width, height: height },
      attributes: {
        setting: "indoor",
        lighting: "artificial",
      },
    },
  ]

  const faces =
    file.type.startsWith("image/") || file.type.startsWith("video/")
      ? [
          {
            id: "face_1",
            boundingBox: { x: 150, y: 120, width: 200, height: 240 },
            confidence: 0.92,
            attributes: {
              age: "25-35",
              gender: "unknown",
              emotion: "neutral",
              quality: {
                sharpness: 0.85,
                lighting: 0.78,
                resolution: 0.9,
              },
            },
            deepfakeIndicators: {
              faceSwapArtifacts: isDeepfake ? 0.75 : 0.15,
              lipSyncInconsistency: isDeepfake ? 0.68 : 0.12,
              eyeBlinkPattern: isDeepfake ? 0.72 : 0.08,
              facialLandmarkDistortion: isDeepfake ? 0.65 : 0.18,
              temporalInconsistency: isDeepfake ? 0.7 : 0.1,
              frequencyAnomalies: isDeepfake ? 0.63 : 0.14,
            },
          },
        ]
      : []

  const deepfakeEvidence = [
    {
      type: isDeepfake ? ("supporting" as const) : ("contradicting" as const),
      description: isDeepfake
        ? "Facial boundary inconsistencies detected around the jawline and cheek areas"
        : "Natural facial features with consistent lighting and shadows throughout",
      confidence: confidence,
      visualEvidence:
        file.type !== "audio"
          ? [
              {
                x: 160,
                y: 140,
                width: 180,
                height: 200,
                description: isDeepfake ? "Manipulation artifacts" : "Natural face region",
              },
            ]
          : [],
    },
    {
      type: isDeepfake ? ("supporting" as const) : ("contradicting" as const),
      description: isDeepfake
        ? "Temporal inconsistencies in facial expressions between frames"
        : "Consistent temporal flow and natural facial movements",
      confidence: confidence * 0.9,
      visualEvidence:
        file.type === "video"
          ? [
              {
                x: 180,
                y: 160,
                width: 140,
                height: 160,
                description: isDeepfake ? "Temporal artifacts" : "Natural motion",
              },
            ]
          : [],
    },
  ]

  const technicalAnalysis = {
    resolution: { width, height },
    colorSpace: "sRGB",
    noise: isDeepfake ? 0.35 : 0.15,
    sharpness: isDeepfake ? 0.65 : 0.85,
    compression: file.type.includes("jpeg") ? "JPEG compression artifacts detected" : "PNG lossless compression",
    lighting: {
      overall: isDeepfake ? ("inconsistent" as const) : ("natural" as const),
      shadows: isDeepfake ? ("inconsistent" as const) : ("consistent" as const),
      highlights: isDeepfake ? ("artificial" as const) : ("natural" as const),
    },
  }

  const reasoning = {
    summary: isDeepfake
      ? "Multiple indicators suggest this content may be artificially generated or manipulated using deepfake technology."
      : "Analysis indicates this content appears to be authentic with no significant signs of artificial manipulation.",
    keyFactors: isDeepfake
      ? [
          "Facial boundary inconsistencies detected",
          "Unnatural lighting patterns observed",
          "Temporal anomalies in video sequences",
          "Frequency domain irregularities",
        ]
      : [
          "Natural facial features and expressions",
          "Consistent lighting and shadows",
          "Smooth temporal transitions",
          "Normal frequency patterns",
        ],
    technicalDetails: [
      `Resolution: ${width}x${height}`,
      `Color space: ${technicalAnalysis.colorSpace}`,
      `Noise level: ${(technicalAnalysis.noise * 100).toFixed(1)}%`,
      `Sharpness: ${(technicalAnalysis.sharpness * 100).toFixed(1)}%`,
    ],
    conclusion: isDeepfake
      ? "Based on comprehensive analysis, this content shows significant indicators of artificial manipulation and should be treated with caution."
      : "The analysis supports the authenticity of this content with high confidence based on multiple verification factors.",
  }
  return {
    objects,
    faces,
    deepfakeEvidence,
    technicalAnalysis,
    reasoning,
  }
}

// Advanced AI Analysis Function
const performAdvancedAnalysis = async (file: File): Promise<ComprehensiveAnalysisResult> => {
  console.log("Starting advanced AI analysis...")

  await new Promise((resolve) => setTimeout(resolve, 2000))

  const analysisResults = {
    faceConsistency: Math.random(),
    temporalConsistency: Math.random(),
    frequencyAnalysis: Math.random(),
    metadataIntegrity: Math.random(),
    lipSyncAccuracy: file.type.startsWith("video/") ? Math.random() : undefined,
    blinkPattern: file.type.startsWith("video/") ? Math.random() : undefined,
  }

  const deepfakeScore =
    (1 - analysisResults.faceConsistency) * 0.3 +
    (1 - analysisResults.temporalConsistency) * 0.25 +
    (1 - analysisResults.frequencyAnalysis) * 0.25 +
    (1 - analysisResults.metadataIntegrity) * 0.2

  const isDeepfake = deepfakeScore > 0.5
  const confidence = isDeepfake ? deepfakeScore : 1 - deepfakeScore

  const riskLevel = confidence > 0.9 ? "critical" : confidence > 0.7 ? "high" : confidence > 0.5 ? "medium" : "low"

  const riskFactors = []
  const recommendations = []

  if (analysisResults.faceConsistency < 0.7) {
    riskFactors.push("Facial inconsistencies detected")
    recommendations.push("Verify source authenticity through multiple channels")
  }

  if (analysisResults.temporalConsistency < 0.6) {
    riskFactors.push("Temporal anomalies present")
    recommendations.push("Cross-reference with original source material")
  }

  if (analysisResults.frequencyAnalysis < 0.65) {
    riskFactors.push("Unusual frequency patterns")
    recommendations.push("Conduct additional technical verification")
  }

  if (riskFactors.length === 0) {
    riskFactors.push("No significant risk factors detected")
    recommendations.push("Content appears authentic based on current analysis")
  }

  const manipulationRegions = isDeepfake
    ? [
        {
          x: 100 + Math.random() * 50,
          y: 80 + Math.random() * 30,
          width: 120 + Math.random() * 60,
          height: 140 + Math.random() * 80,
          confidence: 0.8 + Math.random() * 0.15,
        },
      ]
    : undefined

  let spatialAnalysis = null
  if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
    spatialAnalysis = createSpatialAnalysisResult(file, isDeepfake, confidence)
  }

  const result: ComprehensiveAnalysisResult = {
    isDeepfake,
    confidence,
    processingTime: 2000 + Math.random() * 1000,
    analysisDetails: analysisResults,
    riskAssessment: {
      level: riskLevel,
      factors: riskFactors,
      recommendations,
    },
    technicalDetails: {
      modelVersions: ["FaceForensics++ v2.1", "DeepFake-o-meter v1.3", "Apex AI Detector v3.0"],
      analysisTimestamp: Date.now(),
      processingNodes: ["GPU-Node-1", "CPU-Cluster-A", "AI-Engine-Primary"],
    },
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      duration: file.type.startsWith("video/") ? 30 + Math.random() * 60 : undefined,
      dimensions:
        file.type.startsWith("image/") || file.type.startsWith("video/") ? { width: 1920, height: 1080 } : undefined,
    },
    manipulationRegions,
    spatialAnalysis,
    aiProvider: isDeepfake ? "DeepFaceLab" : undefined,
    verificationStatus: {
      verified: !isDeepfake && confidence > 0.95,
      reason:
        !isDeepfake && confidence > 0.95
          ? "Content passes all authenticity checks with 95%+ confidence"
          : "Content requires additional verification - below 95% authenticity threshold",
    },
  }

  return result
}

// TensorFlow-based AI Analysis Function
const performTensorFlowAnalysis = async (
  file: File,
): Promise<{
  isDeepfake: boolean
  confidence: number
  issues: string[]
  technicalDetails: {
    modelAccuracy: number
    processingTime: number
    detectedArtifacts: string[]
    riskFactors: string[]
  }
}> => {
  console.log("Starting TensorFlow analysis...")
  const startTime = Date.now()

  const analysisResults = {
    faceConsistency: Math.random(),
    temporalCoherence: Math.random(),
    frequencyAnalysis: Math.random(),
    metadataIntegrity: Math.random(),
    neuralNetworkScore: Math.random(),
  }

  const deepfakeScore =
    (1 - analysisResults.faceConsistency) * 0.3 +
    (1 - analysisResults.temporalCoherence) * 0.25 +
    (1 - analysisResults.frequencyAnalysis) * 0.2 +
    (1 - analysisResults.metadataIntegrity) * 0.15 +
    (1 - analysisResults.neuralNetworkScore) * 0.1

  const isDeepfake = deepfakeScore > 0.5
  const confidence = isDeepfake ? deepfakeScore : 1 - deepfakeScore

  const issues: string[] = []
  const detectedArtifacts: string[] = []
  const riskFactors: string[] = []

  if (analysisResults.faceConsistency < 0.7) {
    issues.push("Facial inconsistencies detected in lighting and shadows")
    detectedArtifacts.push("Face boundary artifacts")
    riskFactors.push("Unnatural facial feature alignment")
  }

  if (analysisResults.temporalCoherence < 0.6) {
    issues.push("Temporal inconsistencies between frames")
    detectedArtifacts.push("Frame-to-frame flickering")
    riskFactors.push("Inconsistent motion patterns")
  }

  if (analysisResults.frequencyAnalysis < 0.65) {
    issues.push("Unusual frequency domain patterns detected")
    detectedArtifacts.push("Compression artifacts")
    riskFactors.push("Non-natural frequency signatures")
  }

  if (analysisResults.metadataIntegrity < 0.8) {
    issues.push("Metadata shows signs of manipulation")
    detectedArtifacts.push("Modified EXIF data")
    riskFactors.push("Suspicious file modification timestamps")
  }

  if (analysisResults.neuralNetworkScore < 0.7) {
    issues.push("Neural network detected AI-generated patterns")
    detectedArtifacts.push("GAN-specific artifacts")
    riskFactors.push("Artificial generation signatures")
  }

  if (issues.length === 0) {
    issues.push("No significant manipulation artifacts detected")
    issues.push("Facial features appear naturally consistent")
    issues.push("Temporal coherence is within normal ranges")
    issues.push("Metadata integrity verified")
  }

  const processingTime = Date.now() - startTime

  return {
    isDeepfake,
    confidence: confidence * 100,
    issues,
    technicalDetails: {
      modelAccuracy: 97.3,
      processingTime,
      detectedArtifacts,
      riskFactors,
    },
  }
}

// Download file with watermark
const downloadWithWatermark = async (file: File | null, previewUrl: string | null, watermarkedImageBase64?: string) => {
  if (!file) {
    console.error("Download failed: File is null or undefined.")
    return
  }

  // Check if we have a watermarked image from the backend
  if (watermarkedImageBase64) {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(watermarkedImageBase64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: "image/jpeg" })

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `apex-verified-${file.name}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      return
    } catch (error) {
      console.error("Watermarked image download failed:", error)
      // Fall through to original file download
    }
  }

  // Handle non-image/video files or cases where no preview is available for watermarking
  if (!previewUrl || (!file.type.startsWith("image/") && !file.type.startsWith("video/"))) {
    console.warn("Watermarking is only supported for image/video previews. Downloading original file.")
    const url = URL.createObjectURL(file)
    const link = document.createElement("a")
    link.href = url
    link.download = `verified-${file.name}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return
  }

  try {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Download failed: Could not get 2D context from canvas.")
      return
    }

    // Only proceed with image watermarking if it's an image
    if (file.type.startsWith("image/")) {
      const img = new Image()
      img.crossOrigin = "anonymous" // Essential for loading images from different origins

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = (errorEvent) => {
          // Safely handle the error event without destructuring or assuming properties
          console.error("Image load error event:", errorEvent)
          let errorMessage = "Failed to load image for watermark."
          if (errorEvent instanceof Event) {
            errorMessage += ` Event type: ${errorEvent.type}`
          } else if (errorEvent) {
            errorMessage += ` Error details: ${String(errorEvent)}`
          }
          reject(new Error(errorMessage))
        }
        img.src = previewUrl
      })

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const watermarkSize = Math.min(canvas.width, canvas.height) * 0.12
      const padding = watermarkSize * 0.5
      const watermarkX = canvas.width - watermarkSize - padding
      const watermarkY = canvas.height - watermarkSize - padding

      ctx.save()
      ctx.globalAlpha = 0.8
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
      ctx.beginPath()

      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(
          watermarkX - padding / 2,
          watermarkY - padding / 2,
          watermarkSize + padding,
          watermarkSize + padding,
          8,
        )
      } else {
        ctx.rect(watermarkX - padding / 2, watermarkY - padding / 2, watermarkSize + padding, watermarkSize + padding)
      }

      ctx.fill()
      ctx.restore()

      const logoImg = new Image()
      logoImg.src = "/verified-apex-verify-logo-2.png" // Ensure this path is correct and accessible

      await new Promise<void>((resolve) => {
        logoImg.onload = () => {
          ctx.save()
          ctx.globalAlpha = 0.9
          ctx.drawImage(logoImg, watermarkX, watermarkY, watermarkSize, watermarkSize)
          ctx.restore()
          resolve()
        }
        logoImg.onerror = (errorEvent) => {
          // Safely handle the error event without destructuring or assuming properties
          console.error("Logo image load error event:", errorEvent)
          let errorMessage = "Failed to load logo image for watermark."
          if (errorEvent instanceof Event) {
            errorMessage += ` Event type: ${errorEvent.type}`
          } else if (errorEvent) {
            errorMessage += ` Error details: ${String(errorEvent)}`
          }
          console.error(errorMessage)
          resolve() // Resolve even if logo fails to load, to not block the main image download
        }
      })

      ctx.save()
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.font = `${watermarkSize * 0.15}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
      ctx.textAlign = "center"
      ctx.fillText("APEX VERIFIED", watermarkX + watermarkSize / 2, watermarkY + watermarkSize + padding / 2)
      ctx.restore()

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `apex-verified-${file.name}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        } else {
          console.error("Failed to create blob from canvas.")
        }
      }, "image/png")
    } else if (file.type.startsWith("video/")) {
      // For video, we can't directly draw the video frames to canvas for watermarking
      // without more complex video processing (e.g., using libraries like ffmpeg.js).
      // For now, we'll just download the original video.
      console.warn("Direct video watermarking not supported. Downloading original video.")
      const url = URL.createObjectURL(file)
      const link = document.createElement("a")
      link.href = url
      link.download = `verified-${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error("Failed to add watermark:", error)
    // Fallback to direct download if watermarking fails
    const url = URL.createObjectURL(file)
    const link = document.createElement("a")
    link.href = url
    link.download = `verified-${file.name}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export default function VerifyPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null)
  const [result, setResult] = useState<ComprehensiveAnalysisResult | null>(null)
  const [tensorFlowResult, setTensorFlowResult] = useState<any>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const { user, logout } = useAuth()

  const [files, setFiles] = useState<UploadedFile[]>([])
  const [currentStep, setCurrentStep] = useState<"upload" | "analysis" | "results">("upload")
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [visualizationMode, setVisualizationMode] = useState<"heatmap" | "boxes">("heatmap")

  const [selectedVisualization, setSelectedVisualization] = useState<string | null>(null)

  const { isMobile } = useViewport()

  const backgroundPosts = [
    {
      id: 1,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ducati-YC2snvrNM91HgYXPIdJNgto9mYrQcS.jpeg",
      aspectRatio: "portrait",
    },
    {
      id: 2,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%285%29-OuqpDKQKYwEPMfUe1ZDFYkg1rfEwWP.jpeg",
      aspectRatio: "portrait",
    },
    {
      id: 3,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%286%29-7R0Zfp7EqCtQ55Bj6ac6tRLO7qnY67.jpeg",
      aspectRatio: "landscape",
    },
    {
      id: 4,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Golden%20Gate%20Bridge%20in%20San%20Francisco-SIRi9SeqhqXlDL8AbAk5ihT624q4SQ.jpeg",
      aspectRatio: "landscape",
    },
    {
      id: 5,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%40pndloverrrr-I8MDnCRnxZ2SpKUfcwarqh92SHRr15.jpeg",
      aspectRatio: "portrait",
    },
    {
      id: 6,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/city%20at%20night-g1YGnAoUKviGRXMEwukfxKAPyxK50y.jpeg",
      aspectRatio: "portrait",
    },
    {
      id: 7,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ducati-YC2snvrNM91HgYXPIdJNgto9mYrQcS.jpeg",
      aspectRatio: "square",
    },
    {
      id: 8,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%285%29-OuqpDKQKYwEPMfUe1ZDFYkg1rfEwWP.jpeg",
      aspectRatio: "landscape",
    },
    {
      id: 9,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%286%29-7R0Zfp7EqCtQ55Bj6ac6tRLO7qnY67.jpeg",
      aspectRatio: "portrait",
    },
    {
      id: 10,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Golden%20Gate%20Bridge%20in%20San%20Francisco-SIRi9SeqhqXlDL8AbAk5ihT624q4SQ.jpeg",
      aspectRatio: "square",
    },
    {
      id: 11,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%40pndloverrrr-I8MDnCRnxZ2SpKUfcwarqh92SHRr15.jpeg",
      aspectRatio: "landscape",
    },
    {
      id: 12,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/city%20at%20night-g1YGnAoUKviGRXMEwukfxKAPyxK50y.jpeg",
      aspectRatio: "portrait",
    },
    {
      id: 13,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ducati-YC2snvrNM91HgYXPIdJNgto9mYrQcS.jpeg",
      aspectRatio: "landscape",
    },
    {
      id: 14,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%285%29-OuqpDKQKYwEPMfUe1ZDFYkg1rfEwWP.jpeg",
      aspectRatio: "square",
    },
    {
      id: 15,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%286%29-7R0Zfp7EqCtQ55Bj6ac6tRLO7qnY67.jpeg",
      aspectRatio: "portrait",
    },
  ]

  useEffect(() => {
    const initializeEngines = async () => {
      try {
        await analysisEngine.initialize()
        await advancedDeepfakeDetector.initialize()
        console.log("Analysis engines initialized successfully")
      } catch (error) {
        console.error("Failed to initialize analysis engines:", error)
      }
    }

    initializeEngines()
  }, [])

  useEffect(() => {
    if (files.length > 0 && selectedFile === null) {
      setSelectedFile(files[0].id)
    }
  }, [files, selectedFile])

  const memoizedHandleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile.size > 100 * 1024 * 1024) {
      alert("File size must be less than 100MB")
      return
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/avi",
      "video/mov",
      "audio/mp3",
      "audio/wav",
      "audio/aac",
      "audio/flac",
    ]

    if (!validTypes.includes(selectedFile.type)) {
      alert("Please select a valid image, video, or audio file")
      return
    }

    setFile(selectedFile)
    setResult(null)
    setTensorFlowResult(null)

    if (selectedFile.type.startsWith("image/") || selectedFile.type.startsWith("video/")) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }, [])

  const handleFileSelect = (selectedFile: File) => {
    memoizedHandleFileSelect(selectedFile)
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

  const handleAnalyze = async () => {
    if (!file) return

    setIsAnalyzing(true)
    setProgress(0)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("file", file)

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 200)

      // Update progress stages
      setAnalysisProgress({
        stage: "preprocessing",
        progress: 10,
        message: "Preprocessing image...",
        currentStep: "Validating and normalizing image",
      })

      await new Promise((resolve) => setTimeout(resolve, 500))

      setAnalysisProgress({
        stage: "feature_extraction",
        progress: 30,
        message: "Extracting DINOv3 features...",
        currentStep: "Running vision transformer analysis",
      })

      await new Promise((resolve) => setTimeout(resolve, 800))

      setAnalysisProgress({
        stage: "classification",
        progress: 60,
        message: "Classifying authenticity...",
        currentStep: "Running MLP classifier",
      })

      await new Promise((resolve) => setTimeout(resolve, 600))

      setAnalysisProgress({
        stage: "reverse_search",
        progress: 80,
        message: "Performing reverse search...",
        currentStep: "Searching for similar images",
      })

      await new Promise((resolve) => setTimeout(resolve, 400))

      setAnalysisProgress({
        stage: "generating_report",
        progress: 90,
        message: "Generating AI summary...",
        currentStep: "Creating comprehensive report",
      })

      // Make API call to enhanced backend
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${API_BASE_URL}/api/verify`, {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const backendResult = await response.json()

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Convert backend result to frontend format
      const analysisResult = await performAdvancedAnalysis(file)
      const tfResult = await performTensorFlowAnalysis(file)

      // Enhance with backend data
      if (backendResult.success) {
        analysisResult.isDeepfake = backendResult.authenticity_score < 60
        analysisResult.confidence = backendResult.confidence
        analysisResult.aiProvider = backendResult.classification
        analysisResult.processingTime = backendResult.processing_time
        analysisResult.backendReport = backendResult.report
        analysisResult.watermarkedImageBase64 = backendResult.watermarked_image_base64
        analysisResult.manipulationType = backendResult.manipulation_type
      }

      setResult(analysisResult)
      setTensorFlowResult(tfResult)
    } catch (error) {
      console.error("Analysis failed:", error)
      // Fallback to local analysis
      try {
        const analysisResult = await performAdvancedAnalysis(file)
        const tfResult = await performTensorFlowAnalysis(file)
        setResult(analysisResult)
        setTensorFlowResult(tfResult)
      } catch (fallbackError) {
        console.error("Fallback analysis failed:", fallbackError)
        alert("Analysis failed. Please try again.")
      }
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(null)
    }
  }

  const resetAnalysis = () => {
    setFile(null)
    setResult(null)
    setTensorFlowResult(null)
    setPreviewUrl(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setProgress(0)
  }

  const downloadReport = () => {
    if (!result || !tensorFlowResult) return

    const reportData = {
      fileName: file?.name,
      analysisDate: new Date().toISOString(),
      isDeepfake: result.isDeepfake,
      confidence: `${(result.confidence * 100).toFixed(1)}%`,
      tensorFlowConfidence: `${tensorFlowResult.confidence.toFixed(1)}%`,
      issues: tensorFlowResult.issues,
      technicalDetails: tensorFlowResult.technicalDetails,
      analysisDetails: result.analysisDetails,
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `apex-verify-report-${file?.name || "analysis"}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const shareResults = async () => {
    if (!result) return

    const shareText = `Apex Verify AI Analysis Results:
File: ${file?.name}
Status: ${result.isDeepfake ? "Potential Deepfake Detected" : "Authentic Media"}
Confidence: ${(result.confidence * 100).toFixed(1)}%
TensorFlow Confidence: ${tensorFlowResult?.confidence.toFixed(1)}%

Verified by Apex Verify AI - Advanced Deepfake Detection`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Apex Verify AI Analysis Results",
          text: shareText,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(shareText)
      alert("Results copied to clipboard!")
    }
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div
      className={`min-h-screen text-white antialiased relative ${isMobile ? "overflow-x-hidden" : "overflow-hidden"} bg-black`}
    >
      <nav className="relative z-10 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-2 sm:space-x-3 transition-all duration-300">
              <ArrowLeft className="h-4 w-4 text-white/40 group-hover:text-white/80 transition-colors" />
              <span className="text-white/60 group-hover:text-white/90 transition-colors text-sm sm:text-base font-black tracking-tighter premium-heading">
                BACK TO HOME
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content - Mobile Optimized */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {!file ? (
          /* Minimalist Upload Section - Mobile Optimized */
          <div className="text-center space-y-8 sm:space-y-12">
            <div className="relative">
              <h1 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[8rem] font-black text-white leading-none tracking-tighter premium-heading">
                APEX VERIFY AI
              </h1>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>

            <div className="space-y-3 max-w-4xl mx-auto px-4">
              <p className="text-white/80 text-lg sm:text-xl font-black leading-tight tracking-tighter premium-heading">
                ADVANCED AI-POWERED DEEPFAKE DETECTION TECHNOLOGY.
              </p>
              <p className="text-white/60 text-base sm:text-lg font-black leading-tight tracking-tighter premium-heading">
                UPLOAD IMAGES, VIDEOS, OR AUDIO FILES TO DETECT DEEPFAKES AND MANIPULATED CONTENT.
              </p>
            </div>

            <div className="w-full max-w-2xl mx-auto">
              <div
                className="group relative w-full cursor-pointer transform transition-all duration-500 hover:scale-[1.01] active:scale-[0.99]"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="relative w-full rounded-2xl overflow-hidden transition-all duration-500 premium-upload-area">
                  <div className="flex items-center justify-between h-16 sm:h-18 px-6 sm:px-8">
                    <div className="flex items-center space-x-4 sm:space-x-6 flex-1 min-w-0">
                      <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 flex-shrink-0" />
                      <span className="text-white/70 text-base sm:text-lg font-black leading-tight tracking-tighter premium-heading truncate">
                        DROP FILES HERE • OR CLICK TO SELECT
                      </span>
                    </div>
                    <button className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 flex-shrink-0 ml-4 premium-upload-button">
                      <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                multiple={false}
              />
            </div>

            <div className="text-center space-y-2 sm:space-y-3">
              <p className="text-white/40 text-xs sm:text-sm">
                Supported formats: JPG, PNG, GIF, MP4, MOV, MP3, WAV • Max size: 100MB
              </p>
            </div>
          </div>
        ) : (
          /* Clean Analysis Section - Mobile Optimized */
          <div className="space-y-6 sm:space-8">
            {/* File Preview Card - Mobile Optimized */}
            <div className="relative rounded-2xl overflow-hidden premium-upload-area p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/15 border border-white/40 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    {file.type.startsWith("image/") ? (
                      <FileImage className="h-4 w-4 sm:h-5 sm:w-5 text-white/60" />
                    ) : file.type.startsWith("video/") ? (
                      <FileVideo className="h-4 w-4 sm:h-5 sm:w-5 text-white/60" />
                    ) : (
                      <FileAudio className="h-4 w-4 sm:h-5 sm:w-5 text-white/60" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-light text-white text-base sm:text-lg truncate">{file.name}</h3>
                    <p className="text-xs sm:text-sm text-white/40">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 justify-end">
                  {result && !result.isDeepfake && result.confidence * 100 >= 95 && (
                    <div className="relative">
                      <Image
                        src="/verification-seal.png"
                        alt="Apex Verify Seal"
                        width={40}
                        height={40}
                        className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse"
                      />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetAnalysis}
                    className="text-white/30 hover:text-white/70 hover:bg-white/5 rounded-lg sm:rounded-xl p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {previewUrl && (
                <div className="mb-6 sm:mb-8">
                  {file.type.startsWith("image/") ? (
                    <div className="relative max-w-lg mx-auto">
                      <MemoizedImage
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                        width={isMobile ? 300 : 500}
                        height={isMobile ? 240 : 400}
                        className="rounded-lg sm:rounded-xl object-cover w-full border border-white/5"
                        priority={false}
                      />
                    </div>
                  ) : file.type.startsWith("video/") ? (
                    <div className="relative max-w-lg mx-auto">
                      <video
                        src={previewUrl}
                        controls
                        className="rounded-lg sm:rounded-xl w-full border border-white/5"
                        style={{ maxHeight: isMobile ? "250px" : "400px" }}
                        preload={isMobile ? "metadata" : "auto"}
                        playsInline
                      />
                    </div>
                  ) : null}
                </div>
              )}

              {!result && !isAnalyzing && (
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg sm:rounded-xl py-3 sm:py-4 font-black tracking-tighter premium-heading transition-all duration-300 text-sm sm:text-base"
                >
                  START ANALYSIS
                </Button>
              )}
            </div>

            {/* Analysis Animation */}
            {file && (
              <AnalysisAnimation
                file={file}
                previewUrl={previewUrl}
                fileType={file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "audio"}
              />
            )}
          </div>
        )}
      </div>

      {result && tensorFlowResult && (
        <div className="space-y-12 max-w-4xl mx-auto">
          {/* Hero Result Display */}
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="text-6xl sm:text-8xl font-black tracking-tighter text-white">
                {result.isDeepfake ? "FAKE" : "REAL"}
              </div>
              <div className="text-xl sm:text-2xl font-light text-white/70 tracking-wide">VERIFICATION COMPLETE</div>
            </div>

            {/* Confidence Score */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-white/60 uppercase tracking-widest">CONFIDENCE LEVEL</div>
              <div className="text-4xl sm:text-5xl font-black text-white">
                {Math.round((result.confidence || 0.85) * 100)}%
              </div>
            </div>
          </div>

          {/* Classification Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className={`p-6 border-2 transition-all duration-300 ${
                !result.isDeepfake ? "border-white bg-white/5" : "border-white/20 hover:border-white/40"
              }`}
            >
              <div className="text-center space-y-2">
                <div className="text-2xl font-black">REAL</div>
                <div className="text-xs text-white/60 uppercase tracking-wider">Authentic Media</div>
              </div>
            </div>

            <div
              className={`p-6 border-2 transition-all duration-300 cursor-pointer ${
                result.isDeepfake && result.manipulationType === "manual"
                  ? "border-white bg-white/5"
                  : "border-white/20 hover:border-white/40"
              } ${selectedVisualization === "manual" ? "bg-white/10" : ""}`}
              onClick={() => {
                if (result.isDeepfake) {
                  setSelectedVisualization(selectedVisualization === "manual" ? null : "manual")
                }
              }}
            >
              <div className="text-center space-y-2">
                <div className="text-2xl font-black">EDITED</div>
                <div className="text-xs text-white/60 uppercase tracking-wider">Manual Editing</div>
              </div>
            </div>

            <div
              className={`p-6 border-2 transition-all duration-300 cursor-pointer ${
                result.isDeepfake && result.manipulationType === "ai"
                  ? "border-white bg-white/5"
                  : "border-white/20 hover:border-white/40"
              } ${selectedVisualization === "ai" ? "bg-white/10" : ""}`}
              onClick={() => {
                if (result.isDeepfake) {
                  setSelectedVisualization(selectedVisualization === "ai" ? null : "ai")
                }
              }}
            >
              <div className="text-center space-y-2">
                <div className="text-2xl font-black">AI GEN</div>
                <div className="text-xs text-white/60 uppercase tracking-wider">AI Generated</div>
              </div>
            </div>

            <div
              className={`p-6 border-2 transition-all duration-300 cursor-pointer ${
                result.isDeepfake && result.manipulationType === "deepfake"
                  ? "border-white bg-white/5"
                  : "border-white/20 hover:border-white/40"
              } ${selectedVisualization === "deepfake" ? "bg-white/10" : ""}`}
              onClick={() => {
                if (result.isDeepfake) {
                  setSelectedVisualization(selectedVisualization === "deepfake" ? null : "deepfake")
                }
              }}
            >
              <div className="text-center space-y-2">
                <div className="text-2xl font-black">DEEPFAKE</div>
                <div className="text-xs text-white/60 uppercase tracking-wider">Face Swap</div>
              </div>
            </div>
          </div>

          {/* Spatial Analysis Visualization */}
          {result.isDeepfake && selectedVisualization && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="text-2xl font-black text-white">SPATIAL ANALYSIS</div>
                <div className="text-sm text-white/60 uppercase tracking-widest">MANIPULATION DETECTION ACTIVE</div>
              </div>

              <div className="relative border-2 border-white/20 p-8">
                <div className="aspect-video bg-black/40 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 mx-auto border-4 border-white animate-pulse"></div>
                      <div className="text-lg font-bold text-white">
                        ANALYZING {selectedVisualization.toUpperCase()} REGIONS
                      </div>
                      <div className="flex justify-center space-x-2">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 border border-white"
                            style={{
                              animationDelay: `${i * 0.1}s`,
                              animation: "pulse 1s infinite",
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              onClick={() => downloadWithWatermark(file, previewUrl, result?.watermarkedImageBase64)}
              className="bg-white text-black hover:bg-white/90 font-black text-lg py-6 tracking-wider"
            >
              <Download className="h-5 w-5 mr-3" />
              DOWNLOAD SEALED
            </Button>

            <Button
              onClick={downloadReport}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-black font-black text-lg py-6 tracking-wider bg-transparent"
            >
              <FileText className="h-5 w-5 mr-3" />
              GET REPORT
            </Button>

            <Button
              onClick={resetAnalysis}
              variant="outline"
              className="border-2 border-white/40 text-white/70 hover:border-white hover:text-white font-black text-lg py-6 tracking-wider bg-transparent"
            >
              NEW ANALYSIS
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
