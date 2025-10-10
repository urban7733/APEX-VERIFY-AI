"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, ArrowLeft, X, Download, FileText, CheckCircle, AlertTriangle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import LaserFlow from "@/components/LaserFlow"

interface EnhancedVerificationResult {
  success: boolean
  authenticity_score: number
  classification: string
  report: string
  processing_time: number
  confidence: number
  feature_anomalies: string[]
  watermarked_image_base64?: string
  model_info: {
    dinov3?: any
    workflow?: any
  }
}

interface AnalysisProgress {
  stage: string
  progress: number
  message: string
  currentStep: string
}

export default function EnhancedVerifyPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null)
  const [result, setResult] = useState<EnhancedVerificationResult | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, logout } = useAuth()

  // Backend API URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const handleFileSelect = useCallback((selectedFile: File) => {
    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WEBP)')
      return
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size too large. Maximum size is 10MB.')
      return
    }

    setFile(selectedFile)
    setError(null)
    setResult(null)

    // Create preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)
  }, [previewUrl])

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
    setError(null)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)

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
        stage: 'preprocessing',
        progress: 10,
        message: 'Preprocessing image...',
        currentStep: 'Validating and normalizing image'
      })

      await new Promise(resolve => setTimeout(resolve, 500))

      setAnalysisProgress({
        stage: 'feature_extraction',
        progress: 30,
        message: 'Extracting DINOv3 features...',
        currentStep: 'Running vision transformer analysis'
      })

      await new Promise(resolve => setTimeout(resolve, 800))

      setAnalysisProgress({
        stage: 'classification',
        progress: 60,
        message: 'Classifying authenticity...',
        currentStep: 'Running MLP classifier'
      })

      await new Promise(resolve => setTimeout(resolve, 600))

      setAnalysisProgress({
        stage: 'reverse_search',
        progress: 80,
        message: 'Performing reverse search...',
        currentStep: 'Searching for similar images'
      })

      await new Promise(resolve => setTimeout(resolve, 400))

      setAnalysisProgress({
        stage: 'generating_report',
        progress: 90,
        message: 'Generating AI summary...',
        currentStep: 'Creating comprehensive report'
      })

      // Make API call to backend
      const response = await fetch(`${API_BASE_URL}/api/verify`, {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const analysisResult: EnhancedVerificationResult = await response.json()

      await new Promise((resolve) => setTimeout(resolve, 500))

      setResult(analysisResult)
      setAnalysisProgress(null)

    } catch (error) {
      console.error("Analysis failed:", error)
      setError(error instanceof Error ? error.message : "Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(null)
    }
  }

  const resetAnalysis = () => {
    setFile(null)
    setResult(null)
    setPreviewUrl(null)
    setError(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setProgress(0)
  }

  const downloadWatermarkedImage = () => {
    if (!result?.watermarked_image_base64) {
      alert('No watermarked image available')
      return
    }

    try {
      // Convert base64 to blob
      const byteCharacters = atob(result.watermarked_image_base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/jpeg' })

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `apex-verified-${file?.name || 'image'}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    }
  }

  const downloadReport = () => {
    if (!result) return

    const reportContent = `
APEX VERIFY AI - VERIFICATION REPORT
=====================================

File: ${file?.name || 'Unknown'}
Analysis Date: ${new Date().toLocaleString()}
Processing Time: ${result.processing_time}s

VERIFICATION RESULTS:
- Authenticity Score: ${result.authenticity_score}%
- Classification: ${result.classification}
- Confidence: ${(result.confidence * 100).toFixed(1)}%

DETAILED ANALYSIS:
${result.report}

FEATURE ANOMALIES:
${result.feature_anomalies.length > 0 ? result.feature_anomalies.join('\n- ') : 'None detected'}

MODEL INFORMATION:
${JSON.stringify(result.model_info, null, 2)}

---
Generated by APEX VERIFY AI
Advanced DINOv3-based Deepfake Detection System
    `.trim()

    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `apex-verify-report-${file?.name || 'analysis'}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getAuthenticityColor = (score: number) => {
    if (score >= 95) return 'text-green-400'
    if (score >= 85) return 'text-yellow-400'
    if (score >= 60) return 'text-orange-400'
    return 'text-red-400'
  }

  const getAuthenticityIcon = (score: number) => {
    if (score >= 95) return <CheckCircle className="h-6 w-6 text-green-400" />
    if (score >= 60) return <AlertTriangle className="h-6 w-6 text-yellow-400" />
    return <X className="h-6 w-6 text-red-400" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-white/70 text-sm">Welcome, {user.email}</span>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              APEX VERIFY AI
            </h1>
            <p className="text-white/70 text-lg">
              Advanced DINOv3-based Deepfake Detection & Verification
            </p>
          </div>

          {/* Upload Area */}
          {!file && (
            <div className="mb-8">
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-400 bg-blue-400/10'
                    : 'border-white/20 hover:border-white/40'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Upload Image for Verification
                </h3>
                <p className="text-white/70 mb-6">
                  Drag and drop your image here, or click to browse
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                >
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <p className="text-white/50 text-sm mt-4">
                  Supports JPG, PNG, WEBP up to 10MB
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* File Preview and Analysis */}
          {file && (
            <div className="space-y-6">
              {/* File Info */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Selected File</h3>
                  <Button
                    onClick={resetAnalysis}
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4">
                  {previewUrl && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-white/70 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                    </p>
                  </div>
                </div>

                {!isAnalyzing && !result && (
                  <div className="mt-4">
                    <Button
                      onClick={handleAnalyze}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                      Start Verification
                    </Button>
                  </div>
                )}
              </div>

              {/* Analysis Progress */}
              {isAnalyzing && (
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Analysis in Progress</h3>
                  
                  <div className="space-y-4">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    {analysisProgress && (
                      <div className="space-y-2">
                        <p className="text-white font-medium">{analysisProgress.message}</p>
                        <p className="text-white/70 text-sm">{analysisProgress.currentStep}</p>
                        <p className="text-white/50 text-xs">Progress: {Math.round(progress)}%</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Laser Flow Animation */}
              {isAnalyzing && (
                <div className="fixed bottom-0 left-0 right-0 h-20 z-50">
                  <LaserFlow 
                    className="w-full h-full"
                    color="#FF79C6"
                    flowSpeed={0.8}
                    wispIntensity={3.0}
                    fogIntensity={0.3}
                    horizontalBeamOffset={0.0}
                    verticalBeamOffset={0.0}
                  />
                </div>
              )}

              {/* Results */}
              {result && (
                <div className="space-y-6">
                  {/* Authenticity Score */}
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Verification Results</h3>
                      {getAuthenticityIcon(result.authenticity_score)}
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-4xl font-bold mb-2 ${getAuthenticityColor(result.authenticity_score)}`}>
                        {result.authenticity_score}%
                      </div>
                      <p className="text-white/70 text-lg mb-2">{result.classification}</p>
                      <p className="text-white/50 text-sm">
                        Confidence: {(result.confidence * 100).toFixed(1)}% • 
                        Processing Time: {result.processing_time}s
                      </p>
                    </div>
                  </div>

                  {/* AI Report */}
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">AI Analysis Report</h3>
                    <div className="prose prose-invert max-w-none">
                      <pre className="text-white/80 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                        {result.report}
                      </pre>
                    </div>
                  </div>

                  {/* Feature Anomalies */}
                  {result.feature_anomalies.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">Feature Anomalies</h3>
                      <ul className="space-y-2">
                        {result.feature_anomalies.map((anomaly, index) => (
                          <li key={index} className="text-white/70 text-sm flex items-center">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3" />
                            {anomaly}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Download Options */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {result.watermarked_image_base64 && (
                      <Button
                        onClick={downloadWatermarkedImage}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download with Apex Verify™ Seal
                      </Button>
                    )}
                    
                    <Button
                      onClick={downloadReport}
                      variant="outline"
                      className="flex-1 border-white/20 text-white/70 hover:bg-white/10"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>

                  {/* New Analysis Button */}
                  <div className="text-center">
                    <Button
                      onClick={resetAnalysis}
                      variant="ghost"
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      Analyze Another Image
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
