"use client"
import { CheckCircle, AlertTriangle, Clock, Lock, Download, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

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
}

interface VerificationResultsProps {
  result: VerificationResult
  previewUrl: string | null
  onReset: () => void
}

export function VerificationResults({ result, previewUrl, onReset }: VerificationResultsProps) {
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

  // Parse the structured report
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
    <div className="min-h-screen bg-black text-white antialiased">
      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={onReset}
                className="flex items-center space-x-2 px-6 py-3 rounded-full text-white text-sm font-medium transition-all duration-300 hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>BACK</span>
              </button>
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                VERIFICATION RESULTS
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="space-y-12">
          {/* Hero Result Section */}
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center space-x-4">
              {getVerdictIcon(result.classification)}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none">
                <span className={getVerdictColor(result.classification)}>{result.classification}</span>
              </h1>
            </div>

            <div className="space-y-4">
              <div className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white">
                {result.authenticity_score}%
              </div>
              <div className="text-white/60 text-lg sm:text-xl font-medium tracking-wide">AUTHENTICITY SCORE</div>
            </div>
          </div>

          {/* Image and Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Section */}
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white">ANALYZED MEDIA</h2>

              <div className="relative">
                {previewUrl && (
                  <Image
                    src={previewUrl || "/placeholder.svg"}
                    alt="Analyzed image"
                    width={600}
                    height={600}
                    className="rounded-2xl object-cover w-full border border-white/10"
                  />
                )}

                <div className="mt-6 space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-white/50 font-medium">PROCESSING TIME</div>
                        <div className="text-white font-black text-lg">{result.processing_time}s</div>
                      </div>
                      <div>
                        <div className="text-white/50 font-medium">CONFIDENCE</div>
                        <div className={`font-black text-lg ${getConfidenceColor(result.confidence)}`}>
                          {(result.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {result.image_hash && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="text-white/50 font-medium text-xs">HASH</div>
                        <div className="text-white/80 font-mono text-sm break-all">
                          {result.image_hash.substring(0, 32)}...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Details */}
            <div className="space-y-8">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white">ANALYSIS REPORT</h2>

              <div className="space-y-6">
                {/* Assessment */}
                {reportSections.assessment && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-black tracking-tight text-white mb-4">ASSESSMENT</h3>
                    <p className="text-white/90 leading-relaxed font-medium">
                      {reportSections.assessment.replace("* Assessment: ", "")}
                    </p>
                  </div>
                )}

                {/* Scene Analysis */}
                {reportSections.scene && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-black tracking-tight text-white mb-4">SCENE ANALYSIS</h3>
                    <p className="text-white/90 leading-relaxed font-medium">{reportSections.scene}</p>
                  </div>
                )}

                {/* Story Analysis */}
                {reportSections.story && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-black tracking-tight text-white mb-4">CONTENT STORY</h3>
                    <p className="text-white/90 leading-relaxed font-medium">{reportSections.story}</p>
                  </div>
                )}

                {/* Digital Footprint */}
                {reportSections.footprint && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-black tracking-tight text-white mb-4">DIGITAL FOOTPRINT</h3>
                    <p className="text-white/90 leading-relaxed font-medium">{reportSections.footprint}</p>
                  </div>
                )}

                {/* AI Summary */}
                {reportSections.summary && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-black tracking-tight text-white mb-4">AI SUMMARY</h3>
                    <p className="text-white/90 leading-relaxed font-medium">{reportSections.summary}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {result.digital_seal && (
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-8">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center space-x-4">
                  <Lock className="w-8 h-8 text-green-400" />
                  <h2 className="text-3xl font-black tracking-tighter text-green-400">DIGITAL SEAL APPLIED</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-white/50 font-medium text-sm">SEAL ID</div>
                    <div className="text-white font-mono text-lg break-all">{result.digital_seal.seal_id}</div>
                  </div>
                  <div>
                    <div className="text-white/50 font-medium text-sm">SEALED AT</div>
                    <div className="text-white font-medium text-lg">
                      {new Date(result.digital_seal.sealed_at).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/50 font-medium text-sm">STATUS</div>
                    <div className="text-green-400 font-black text-lg">IMMUTABLE</div>
                  </div>
                </div>

                <Button
                  onClick={handleDownloadSealed}
                  className="w-full max-w-md mx-auto bg-green-600 hover:bg-green-700 text-white font-black text-lg py-4 rounded-2xl transition-all duration-300"
                >
                  <Download className="w-5 h-5 mr-3" />
                  DOWNLOAD WITH APEX VERIFY™ SEAL
                </Button>
              </div>
            </div>
          )}

          <div className="text-center space-y-4 pt-12 border-t border-white/10">
            <div className="text-2xl font-black tracking-tighter text-white">APEX VERIFY AI</div>
            <p className="text-white/60 font-medium">ENTERPRISE-GRADE AI VERIFICATION TECHNOLOGY</p>
            {result.digital_seal && <p className="text-green-400 font-black">🔒 DIGITALLY SEALED & TAMPER-EVIDENT</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
