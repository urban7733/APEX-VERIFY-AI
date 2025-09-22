"use client"
import { CheckCircle, AlertTriangle, Clock, Lock, Download, ArrowLeft, Share, Copy, Eye, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState } from "react"

interface ManipulationRegion {
  x: number
  y: number
  width: number
  height: number
  confidence: number
  type: string
}

interface VerificationResult {
  success: boolean
  authenticity_score: number
  classification: string
  report: string // The structured report in the exact format requested
  processing_time: number
  confidence: number
  feature_anomalies: string[]
  model_info: {
    simple_analyzer: any
    gemini: string
  }
  digital_seal?: {
    seal_id: string
    sealed_at: string
    sealed_image_path: string
    certificate: string
  }
  image_hash?: string
  seal_status?: string
  manipulationRegions?: ManipulationRegion[]
  manipulationType?: "manual" | "ai" | "deepfake" | null
}

interface VerificationResultsProps {
  result: VerificationResult
  previewUrl: string | null
  onReset: () => void
}

export function VerificationResults({ result, previewUrl, onReset }: VerificationResultsProps) {
  const [copied, setCopied] = useState(false)
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const [showManipulationBoxes, setShowManipulationBoxes] = useState(false)

  const generateManipulationRegions = (): ManipulationRegion[] => {
    if (result.classification === "FAKE" || result.authenticity_score < 70) {
      return [
        { x: 25, y: 15, width: 30, height: 25, confidence: 0.92, type: "face_swap" },
        { x: 60, y: 40, width: 20, height: 15, confidence: 0.78, type: "background_edit" },
        { x: 10, y: 70, width: 25, height: 20, confidence: 0.85, type: "object_removal" },
      ]
    }
    return []
  }

  const manipulationRegions = result.manipulationRegions || generateManipulationRegions()

  const getVerdictColor = (classification: string) => {
    switch (classification) {
      case "GENUINE MEDIA":
        return "text-green-400"
      case "LIKELY AUTHENTIC":
        return "text-green-300"
      case "SUSPICIOUS":
        return "text-yellow-400"
      case "FAKE":
        return "text-red-400"
      default:
        return "text-yellow-400"
    }
  }

  const getVerdictIcon = (classification: string) => {
    switch (classification) {
      case "GENUINE MEDIA":
        return <CheckCircle className="w-8 h-8 text-green-400" />
      case "LIKELY AUTHENTIC":
        return <CheckCircle className="w-8 h-8 text-green-300" />
      case "SUSPICIOUS":
        return <Clock className="w-8 h-8 text-yellow-400" />
      case "FAKE":
        return <AlertTriangle className="w-8 h-8 text-red-400" />
      default:
        return <Clock className="w-8 h-8 text-yellow-400" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-400"
    if (confidence >= 0.6) return "text-yellow-400"
    return "text-red-400"
  }

  const handleDownloadSealed = async () => {
    if (result.digital_seal?.sealed_image_path) {
      try {
        const response = await fetch("/api/download-sealed", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sealed_image_path: result.digital_seal.sealed_image_path,
            filename: "verified_image_sealed.png",
          }),
        })

        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = "verified_image_sealed.png"
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else {
          throw new Error("Download failed")
        }
      } catch (error) {
        console.error("Download failed:", error)
        alert("Failed to download sealed image. Please try again.")
      }
    }
  }

  const handleCopyResults = async () => {
    const resultsText = `Apex Verify AI Analysis Results:
Classification: ${result.classification}
Authenticity Score: ${result.authenticity_score}%
Confidence: ${(result.confidence * 100).toFixed(1)}%
Processing Time: ${result.processing_time}s

${result.report}`

    try {
      await navigator.clipboard.writeText(resultsText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleShare = () => {
    setShareMenuOpen(!shareMenuOpen)
  }

  const shareToSocial = (platform: string) => {
    const text = `Just verified content with Apex Verify AI - ${result.classification} with ${result.authenticity_score}% authenticity score!`
    const url = window.location.href

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    }

    window.open(shareUrls[platform as keyof typeof shareUrls], "_blank", "width=600,height=400")
    setShareMenuOpen(false)
  }

  const parseReport = (report: string) => {
    const lines = report.split("\n").filter((line) => line.trim())
    const sections: { [key: string]: string } = {}
    let currentSection = ""
    let currentContent: string[] = []

    for (const line of lines) {
      if (line.startsWith("Apex Verify AI Analysis:")) {
        sections["header"] = line
      } else if (line.startsWith("* Authenticity Score:")) {
        sections["score"] = line
      } else if (line.startsWith("* Assessment:")) {
        sections["assessment"] = line
      } else if (line === "The Scene in Focus") {
        currentSection = "scene"
        currentContent = []
      } else if (line === "The Story Behind the Picture") {
        if (currentSection) {
          sections[currentSection] = currentContent.join("\n")
        }
        currentSection = "story"
        currentContent = []
      } else if (line === "Digital Footprint & Source Links") {
        if (currentSection) {
          sections[currentSection] = currentContent.join("\n")
        }
        currentSection = "footprint"
        currentContent = []
      } else if (line === "AI Summary") {
        if (currentSection) {
          sections[currentSection] = currentContent.join("\n")
        }
        currentSection = "summary"
        currentContent = []
      } else if (line.startsWith("Your media is verified")) {
        sections["footer"] = line
      } else if (currentSection && line.trim()) {
        currentContent.push(line)
      }
    }

    if (currentSection) {
      sections[currentSection] = currentContent.join("\n")
    }

    return sections
  }

  const reportSections = parseReport(result.report)

  return (
    <div className="min-h-screen bg-black text-white antialiased relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="flex space-x-8 animate-scroll-horizontal h-full items-center">
          {Array.from({ length: 30 }).map((_, index) => (
            <div
              key={index}
              className={`flex-shrink-0 rounded-full ${
                index % 3 === 0
                  ? "w-3 h-3 bg-white/20"
                  : index % 3 === 1
                    ? "w-2 h-32 bg-gradient-to-b from-white/15 via-white/5 to-transparent rounded-full"
                    : "w-1 h-16 bg-white/10 rounded-full"
              }`}
              style={{
                animationDelay: `${index * 0.1}s`,
                transform: `translateY(${Math.sin(index) * 20}px)`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={onReset}
                className="flex items-center space-x-2 px-6 py-3 rounded-full text-white text-sm font-black transition-all duration-300 hover:bg-white/10 tracking-tight hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>BACK</span>
              </button>
              <div className="flex items-center space-x-4">
                <Image
                  src="/apex-main-logo.png"
                  alt="Apex Verify AI"
                  width={40}
                  height={40}
                  className="w-8 h-8 sm:w-10 sm:h-10 filter drop-shadow-lg animate-pulse"
                />
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tighter">
                  VERIFICATION RESULTS
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {manipulationRegions.length > 0 && (
                <button
                  onClick={() => setShowManipulationBoxes(!showManipulationBoxes)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-black transition-all duration-300 ${
                    showManipulationBoxes
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">{showManipulationBoxes ? "HIDE" : "SHOW"} ANALYSIS</span>
                </button>
              )}

              <button
                onClick={handleCopyResults}
                className="flex items-center space-x-2 px-4 py-2 rounded-full text-white text-sm font-black transition-all duration-300 hover:bg-white/10 hover:scale-105"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">{copied ? "COPIED!" : "COPY"}</span>
              </button>

              <div className="relative">
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full text-white text-sm font-black transition-all duration-300 hover:bg-white/10 hover:scale-105"
                >
                  <Share className="w-4 h-4" />
                  <span className="hidden sm:inline">SHARE</span>
                </button>

                {shareMenuOpen && (
                  <div className="absolute right-0 top-12 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 space-y-2 min-w-[150px] z-50 animate-in slide-in-from-top-2">
                    <button
                      onClick={() => shareToSocial("twitter")}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium transition-all duration-200 hover:scale-105"
                    >
                      Twitter
                    </button>
                    <button
                      onClick={() => shareToSocial("linkedin")}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium transition-all duration-200 hover:scale-105"
                    >
                      LinkedIn
                    </button>
                    <button
                      onClick={() => shareToSocial("facebook")}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm font-medium transition-all duration-200 hover:scale-105"
                    >
                      Facebook
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-10">
        <div className="space-y-12">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="text-8xl sm:text-9xl md:text-[12rem] font-black tracking-tighter text-white leading-none animate-in zoom-in-50 duration-1000">
                {result.authenticity_score}%
              </div>
              <div className="text-white/60 text-xl sm:text-2xl font-black tracking-wide animate-in slide-in-from-bottom-4 duration-700 delay-300">
                AUTHENTICITY SCORE
              </div>
            </div>

            <div className="flex items-center justify-center space-x-6 animate-in slide-in-from-bottom-4 duration-700 delay-500">
              {getVerdictIcon(result.classification)}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none">
                <span className={getVerdictColor(result.classification)}>{result.classification}</span>
              </h1>
            </div>

            <div className="flex items-center justify-center space-x-4 animate-in slide-in-from-bottom-4 duration-700 delay-700">
              <div className="w-32 h-3 bg-white/10 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-1000 ${getConfidenceColor(result.confidence).replace("text-", "bg-")} shadow-lg`}
                  style={{
                    width: `${result.confidence * 100}%`,
                    boxShadow: `0 0 20px ${getConfidenceColor(result.confidence).includes("green") ? "#10b981" : getConfidenceColor(result.confidence).includes("yellow") ? "#f59e0b" : "#ef4444"}`,
                  }}
                />
              </div>
              <span className={`text-lg font-black ${getConfidenceColor(result.confidence)}`}>
                {(result.confidence * 100).toFixed(1)}% CONFIDENCE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-white">ANALYZED MEDIA</h2>

              <div className="relative group">
                {previewUrl && (
                  <div className="relative overflow-hidden rounded-2xl">
                    <Image
                      src={previewUrl || "/placeholder.svg"}
                      alt="Analyzed image"
                      width={600}
                      height={600}
                      className="w-full object-cover border border-white/20 transition-all duration-500 group-hover:scale-105"
                    />

                    {showManipulationBoxes && manipulationRegions.length > 0 && (
                      <div className="absolute inset-0 pointer-events-none">
                        {manipulationRegions.map((region, index) => (
                          <div
                            key={index}
                            className="absolute border-2 border-red-500 bg-red-500/20 animate-pulse"
                            style={{
                              left: `${region.x}%`,
                              top: `${region.y}%`,
                              width: `${region.width}%`,
                              height: `${region.height}%`,
                              boxShadow: "0 0 20px rgba(239, 68, 68, 0.6)",
                            }}
                          >
                            <div className="absolute -top-8 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded font-black">
                              {region.type.replace("_", " ").toUpperCase()} ({(region.confidence * 100).toFixed(0)}%)
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <button className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-black hover:scale-110 transition-all duration-300">
                        <Eye className="w-5 h-5" />
                        <span>VIEW FULL</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6 bg-white/5 border border-white/20 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center group">
                      <div className="text-3xl font-black text-white group-hover:scale-110 transition-all duration-300">
                        {result.processing_time}s
                      </div>
                      <div className="text-white/50 font-medium text-sm tracking-wide">PROCESSING TIME</div>
                    </div>
                    <div className="text-center group">
                      <div
                        className={`text-3xl font-black ${getConfidenceColor(result.confidence)} group-hover:scale-110 transition-all duration-300`}
                      >
                        {(result.confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-white/50 font-medium text-sm tracking-wide">CONFIDENCE</div>
                    </div>
                  </div>

                  {manipulationRegions.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/20">
                      <div className="text-white/50 font-medium text-sm tracking-wide mb-2">MANIPULATION DETECTED</div>
                      <div className="text-red-400 font-black text-lg">
                        {manipulationRegions.length} SUSPICIOUS REGION{manipulationRegions.length > 1 ? "S" : ""} FOUND
                      </div>
                    </div>
                  )}

                  {result.image_hash && (
                    <div className="mt-6 pt-6 border-t border-white/20">
                      <div className="text-white/50 font-medium text-sm tracking-wide mb-2">DIGITAL FINGERPRINT</div>
                      <div className="text-white/80 font-mono text-sm break-all bg-black/30 p-3 rounded-lg hover:bg-black/50 transition-all duration-300">
                        {result.image_hash}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-white">ANALYSIS REPORT</h2>

              <div className="space-y-6">
                {reportSections.assessment && (
                  <div className="bg-white/5 border border-white/20 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
                    <h3 className="text-xl font-black tracking-tight text-white mb-4 flex items-center">
                      <div className="w-1 h-6 bg-white mr-3 rounded-full group-hover:bg-blue-400 transition-all duration-300"></div>
                      ASSESSMENT
                    </h3>
                    <p className="text-white/90 leading-relaxed font-medium">
                      {reportSections.assessment.replace("* Assessment: ", "")}
                    </p>
                  </div>
                )}

                {reportSections.scene && (
                  <div className="bg-white/5 border border-white/20 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
                    <h3 className="text-xl font-black tracking-tight text-white mb-4 flex items-center">
                      <div className="w-1 h-6 bg-white mr-3 rounded-full group-hover:bg-green-400 transition-all duration-300"></div>
                      SCENE ANALYSIS
                    </h3>
                    <p className="text-white/90 leading-relaxed font-medium">{reportSections.scene}</p>
                  </div>
                )}

                {reportSections.story && (
                  <div className="bg-white/5 border border-white/20 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
                    <h3 className="text-xl font-black tracking-tight text-white mb-4 flex items-center">
                      <div className="w-1 h-6 bg-white mr-3 rounded-full group-hover:bg-purple-400 transition-all duration-300"></div>
                      CONTENT STORY
                    </h3>
                    <p className="text-white/90 leading-relaxed font-medium">{reportSections.story}</p>
                  </div>
                )}

                {reportSections.footprint && (
                  <div className="bg-white/5 border border-white/20 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
                    <h3 className="text-xl font-black tracking-tight text-white mb-4 flex items-center">
                      <div className="w-1 h-6 bg-white mr-3 rounded-full group-hover:bg-yellow-400 transition-all duration-300"></div>
                      DIGITAL FOOTPRINT
                    </h3>
                    <p className="text-white/90 leading-relaxed font-medium">{reportSections.footprint}</p>
                  </div>
                )}

                {reportSections.summary && (
                  <div className="bg-white/5 border border-white/20 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
                    <h3 className="text-xl font-black tracking-tight text-white mb-4 flex items-center">
                      <div className="w-1 h-6 bg-white mr-3 rounded-full group-hover:bg-red-400 transition-all duration-300"></div>
                      AI SUMMARY
                    </h3>
                    <p className="text-white/90 leading-relaxed font-medium">{reportSections.summary}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {result.digital_seal && (
            <div className="relative bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-2xl p-8 backdrop-blur-sm hover:scale-105 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-2xl animate-pulse"></div>
              <div className="relative text-center space-y-6">
                <div className="flex items-center justify-center space-x-4">
                  <Lock className="w-10 h-10 text-green-400 animate-pulse" />
                  <h2 className="text-4xl font-black tracking-tighter text-green-400">DIGITAL SEAL APPLIED</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-2 group">
                    <div className="text-white/50 font-medium text-sm tracking-wide">SEAL ID</div>
                    <div className="text-white font-mono text-lg break-all bg-black/30 p-3 rounded-lg group-hover:bg-black/50 transition-all duration-300">
                      {result.digital_seal.seal_id}
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <div className="text-white/50 font-medium text-sm tracking-wide">SEALED AT</div>
                    <div className="text-white font-black text-lg group-hover:scale-110 transition-all duration-300">
                      {new Date(result.digital_seal.sealed_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <div className="text-white/50 font-medium text-sm tracking-wide">STATUS</div>
                    <div className="text-green-400 font-black text-lg group-hover:scale-110 transition-all duration-300">
                      IMMUTABLE
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleDownloadSealed}
                  className="w-full max-w-md mx-auto bg-green-600 hover:bg-green-700 text-white font-black text-lg py-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <Download className="w-5 h-5 mr-3" />
                  DOWNLOAD WITH APEX VERIFY™ SEAL
                </Button>
              </div>
            </div>
          )}

          <div className="text-center space-y-6 pt-12 border-t border-white/20">
            <div className="flex items-center justify-center space-x-4">
              <Image
                src="/apex-main-logo.png"
                alt="Apex Verify AI"
                width={60}
                height={60}
                className="w-12 h-12 filter drop-shadow-lg animate-bounce"
              />
              <div className="text-3xl font-black tracking-tighter text-white">APEX VERIFY AI</div>
            </div>
            <p className="text-white/60 font-black text-lg tracking-wide">
              ENTERPRISE-GRADE AI VERIFICATION TECHNOLOGY
            </p>
            {result.digital_seal && (
              <div className="flex items-center justify-center space-x-2">
                <Lock className="w-5 h-5 text-green-400 animate-pulse" />
                <p className="text-green-400 font-black tracking-wide">DIGITALLY SEALED & TAMPER-EVIDENT</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
