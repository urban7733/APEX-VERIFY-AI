"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Upload, ArrowLeft, CheckCircle, AlertTriangle, X, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AnalysisResult {
  confidence: number
  isDeepfake: boolean
  details: {
    facialInconsistencies: number
    temporalAnomalies: number
    compressionArtifacts: number
    eyeBlinkPatterns: number
  }
  metadata: {
    resolution: string
    duration?: string
    fileSize: string
    format: string
  }
}

interface Star {
  x: number
  y: number
  opacity: number
  twinkleSpeed: number
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

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const simulateAnalysis = async () => {
    setIsAnalyzing(true)
    setProgress(0)
    setResult(null)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + Math.random() * 15
      })
    }, 200)

    // Simulate analysis time
    await new Promise((resolve) => setTimeout(resolve, 3000))

    clearInterval(progressInterval)
    setProgress(100)

    // Simulate result
    const mockResult: AnalysisResult = {
      confidence: Math.random() > 0.5 ? 92.5 : 15.3,
      isDeepfake: Math.random() > 0.5,
      details: {
        facialInconsistencies: Math.floor(Math.random() * 100),
        temporalAnomalies: Math.floor(Math.random() * 100),
        compressionArtifacts: Math.floor(Math.random() * 100),
        eyeBlinkPatterns: Math.floor(Math.random() * 100),
      },
      metadata: {
        resolution: "1920x1080",
        duration: file?.type.startsWith("video") ? "0:45" : undefined,
        fileSize: `${(file?.size || 0 / (1024 * 1024)).toFixed(1)} MB`,
        format: file?.type.split("/")[1].toUpperCase() || "UNKNOWN",
      },
    }

    setTimeout(() => {
      setResult(mockResult)
      setIsAnalyzing(false)
    }, 500)
  }

  const resetAnalysis = () => {
    setFile(null)
    setResult(null)
    setProgress(0)
    setIsAnalyzing(false)
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Starfield Background */}
      <Starfield />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="group flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <Image
                src="/verify-logo.png"
                alt="Apex Verify"
                width={32}
                height={32}
                className="opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <div className="flex items-center space-x-2">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white animate-pulse">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,1)] shadow-white/50 filter brightness-125 contrast-125">
                    Apex Verify AI
                  </span>
                </span>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push("/deepfake-memory")}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Database className="h-4 w-4 mr-2" />
                Deepfake Memory
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        {!file && !result && (
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  AI-Powered Media Verification
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Upload your image, video, or audio file to detect potential deepfakes using our advanced AI analysis
                  engine.
                </p>
              </div>

              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-blue-400 bg-blue-400/10"
                    : "border-white/20 hover:border-white/40 hover:bg-white/5"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Drop your file here</h3>
                <p className="text-gray-400 mb-6">or click to browse</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                >
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="mt-6 text-sm text-gray-500">
                  <p>Supported formats: JPG, PNG, MP4, MOV, MP3, WAV</p>
                  <p>Maximum file size: 100MB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {file && !result && (
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">File Selected</h2>
                  <p className="text-gray-400">{file.name}</p>
                </div>
                <Button onClick={resetAnalysis} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {!isAnalyzing && (
                <div className="text-center">
                  <Button
                    onClick={simulateAnalysis}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                  >
                    Start Analysis
                  </Button>
                </div>
              )}

              {isAnalyzing && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-4">Analyzing Media...</h3>
                    <Progress value={progress} className="w-full max-w-md mx-auto" />
                    <p className="text-sm text-gray-400 mt-2">{Math.round(progress)}% complete</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="text-sm text-gray-400">Facial Analysis</div>
                      <div className="text-lg font-semibold">{progress > 25 ? "✓" : "..."}</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="text-sm text-gray-400">Temporal Patterns</div>
                      <div className="text-lg font-semibold">{progress > 50 ? "✓" : "..."}</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="text-sm text-gray-400">Compression Analysis</div>
                      <div className="text-lg font-semibold">{progress > 75 ? "✓" : "..."}</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="text-sm text-gray-400">Final Verification</div>
                      <div className="text-lg font-semibold">{progress > 95 ? "✓" : "..."}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-6">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Analysis Results</h2>
                  <Button onClick={resetAnalysis} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    New Analysis
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-center mb-4">
                        {result.isDeepfake ? (
                          <AlertTriangle className="h-12 w-12 text-red-400" />
                        ) : (
                          <CheckCircle className="h-12 w-12 text-green-400" />
                        )}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {result.isDeepfake ? "Potential Deepfake Detected" : "Authentic Media"}
                      </h3>
                      <div className="text-3xl font-bold mb-2">{result.confidence.toFixed(1)}%</div>
                      <Badge
                        variant={result.isDeepfake ? "destructive" : "default"}
                        className={
                          result.isDeepfake
                            ? "bg-red-500/20 text-red-300 border-red-500/30"
                            : "bg-green-500/20 text-green-300 border-green-500/30"
                        }
                      >
                        {result.isDeepfake ? "High Risk" : "Low Risk"}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Analysis Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Facial Inconsistencies</span>
                          <span>{result.details.facialInconsistencies}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Temporal Anomalies</span>
                          <span>{result.details.temporalAnomalies}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Compression Artifacts</span>
                          <span>{result.details.compressionArtifacts}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Eye Blink Patterns</span>
                          <span>{result.details.eyeBlinkPatterns}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-4">File Information</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Format</span>
                          <span>{result.metadata.format}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Resolution</span>
                          <span>{result.metadata.resolution}</span>
                        </div>
                        {result.metadata.duration && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Duration</span>
                            <span>{result.metadata.duration}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">File Size</span>
                          <span>{result.metadata.fileSize}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h5 className="font-semibold text-blue-300 mb-2">Recommendation</h5>
                      <p className="text-sm text-gray-300">
                        {result.isDeepfake
                          ? "This media shows signs of artificial manipulation. Exercise caution when sharing or using this content."
                          : "This media appears to be authentic based on our analysis. However, always verify sources when possible."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
