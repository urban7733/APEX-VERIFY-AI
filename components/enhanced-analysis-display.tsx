"use client"

import type React from "react"

import { useState } from "react"
import {
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  FileText,
  Search,
  MapPin,
  Clock,
  ImageIcon,
  Video,
  Mic,
  Cpu,
  Layers,
  Eye,
  Zap,
  BarChart2,
  Activity,
  ShieldCheck,
  Lightbulb,
  Code,
  GitBranch,
  Calendar,
  Sliders,
  HardDrive,
  LinkIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { ComprehensiveAnalysisResult } from "@/lib/analysis-engine"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface EnhancedAnalysisDisplayProps {
  result: ComprehensiveAnalysisResult
  onDownloadReport: () => void
  onShareResult: () => void
  filePreview: string | null
  fileType: "image" | "video" | "audio"
}

interface WatermarkModalProps {
  isOpen: boolean
  onClose: () => void
  onDownload: (options: { transparent: boolean; is3D: boolean }) => void
  fileName: string
}

const WatermarkModal: React.FC<WatermarkModalProps> = ({ isOpen, onClose, onDownload, fileName }) => {
  const [transparent, setTransparent] = useState(false)
  const [is3D, setIs3D] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full">
        <h3 className="text-xl font-light text-white mb-6">Download Options</h3>
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-white focus:ring-white/20"
              />
              <span className="text-white/80 font-light">Transparent Background</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={is3D}
                onChange={(e) => setIs3D(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-white focus:ring-white/20"
              />
              <span className="text-white/80 font-light">3D Watermark Effect</span>
            </label>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-light transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onDownload({ transparent, is3D })
                onClose()
              }}
              className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-light transition-colors"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const EnhancedAnalysisDisplay: React.FC<EnhancedAnalysisDisplayProps> = ({
  result,
  onDownloadReport,
  onShareResult,
  filePreview,
  fileType,
}) => {
  const [showSpatialAnalysisDialog, setShowSpatialAnalysisDialog] = useState(false)
  const [showReverseSearchDialog, setShowReverseSearchDialog] = useState(false)
  const [showDeepfakeDetailsDialog, setShowDeepfakeDetailsDialog] = useState(false)
  const [showMetadataDialog, setShowMetadataDialog] = useState(false)

  const [activeTab, setActiveTab] = useState("overview")
  const [copied, setCopied] = useState(false)

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-white/70 bg-white/5 border-white/10"
      case "medium":
        return "text-white/80 bg-white/10 border-white/20"
      case "high":
        return "text-white/90 bg-white/15 border-white/30"
      case "critical":
        return "text-white bg-white/20 border-white/40"
      default:
        return "text-white/60 bg-white/5 border-white/10"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (result.isDeepfake) {
      if (confidence > 0.8) return "text-red-400"
      if (confidence > 0.6) return "text-orange-400"
      return "text-yellow-400"
    } else {
      if (confidence > 0.8) return "text-green-400"
      if (confidence > 0.6) return "text-lime-400"
      return "text-yellow-400"
    }
  }

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (result.isDeepfake) {
      if (confidence > 0.8) return "destructive"
      if (confidence > 0.6) return "warning"
      return "default"
    } else {
      if (confidence > 0.8) return "success"
      if (confidence > 0.6) return "outline"
      return "default"
    }
  }

  const getStatusIcon = () => {
    if (result.isDeepfake) {
      return result.confidence > 0.98 ? (
        <XCircle className="h-6 w-6 text-white/80" />
      ) : (
        <AlertTriangle className="h-6 w-6 text-white/80" />
      )
    }
    return (
      <div className="h-8 w-8 flex items-center justify-center">
        <Image
          src="/verified-apex-verify-logo-2.png"
          alt="Truth Intelligence Logo"
          width={32}
          height={32}
          className="object-contain"
        />
      </div>
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  const formatDuration = (seconds: number | undefined) => {
    if (seconds === undefined) return "N/A"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image")) return <ImageIcon className="h-5 w-5 text-white/60" />
    if (type.startsWith("video")) return <Video className="h-5 w-5 text-white/60" />
    if (type.startsWith("audio")) return <Mic className="h-5 w-5 text-white/60" />
    return <FileText className="h-5 w-5 text-white/60" />
  }

  return (
    <div className="space-y-8">
      {/* Overall Verdict Card */}
      <Card className="bg-black/60 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-xl">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-2xl font-light text-white flex items-center gap-3">
            {result.isDeepfake ? (
              <AlertTriangle className="h-7 w-7 text-red-400" />
            ) : (
              <CheckCircle className="h-7 w-7 text-green-400" />
            )}
            Overall Verdict
          </CardTitle>
          <CardDescription className="text-white/50 font-light mt-2">
            Comprehensive analysis results from Apex Verify AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-white/70 font-light">Authenticity Status:</span>
            <Badge
              className={cn(
                "px-3 py-1 text-sm font-medium",
                result.isDeepfake ? "bg-red-600/30 text-red-300" : "bg-green-600/30 text-green-300",
              )}
            >
              {result.isDeepfake ? "Potential Deepfake" : "Authentic"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 font-light">Confidence Level:</span>
            <span className={cn("font-medium", getConfidenceColor(result.confidence))}>
              {(result.confidence * 100).toFixed(1)}%
            </span>
          </div>
          <Progress
            value={result.confidence * 100}
            className={cn(
              "w-full h-2",
              result.isDeepfake ? "bg-red-800/30 [&>*]:bg-red-500" : "bg-green-800/30 [&>*]:bg-green-500",
            )}
          />
          <p className="text-sm text-white/60 font-light leading-relaxed">{result.verificationStatus.reason}</p>
        </CardContent>
      </Card>

      {/* Key Analysis Details */}
      <Card className="bg-black/60 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-xl">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-2xl font-light text-white flex items-center gap-3">
            <BarChart2 className="h-7 w-7 text-blue-400" />
            Analysis Breakdown
          </CardTitle>
          <CardDescription className="text-white/50 font-light mt-2">
            Detailed insights from various detection modules.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(result.analysisDetails).map(([key, value]) => {
              if (value === undefined) return null
              const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
              const displayValue = typeof value === "number" ? `${(value * 100).toFixed(1)}%` : value
              const icon =
                key === "faceConsistency" ? (
                  <Eye className="h-4 w-4 text-white/50" />
                ) : key === "temporalConsistency" ? (
                  <Clock className="h-4 w-4 text-white/50" />
                ) : key === "frequencyAnalysis" ? (
                  <Activity className="h-4 w-4 text-white/50" />
                ) : key === "metadataIntegrity" ? (
                  <Info className="h-4 w-4 text-white/50" />
                ) : key === "lipSyncAccuracy" ? (
                  <Mic className="h-4 w-4 text-white/50" />
                ) : key === "blinkPattern" ? (
                  <Eye className="h-4 w-4 text-white/50" />
                ) : (
                  <Info className="h-4 w-4 text-white/50" />
                )

              return (
                <div key={key} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10">{icon}</div>
                  <div>
                    <div className="text-sm text-white/70 font-light">{label}</div>
                    <div className="text-base font-medium text-white">{displayValue}</div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeepfakeDetailsDialog(true)}
              className="text-white/50 hover:text-white/80 hover:bg-white/5 rounded-xl"
            >
              View Deepfake Details <Info className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment & Recommendations */}
      <Card className="bg-black/60 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-xl">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-2xl font-light text-white flex items-center gap-3">
            <AlertTriangle className="h-7 w-7 text-yellow-400" />
            Risk Assessment
          </CardTitle>
          <CardDescription className="text-white/50 font-light mt-2">
            Identified risk factors and recommended actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-6">
          <div>
            <h4 className="text-white/70 font-light mb-2">Risk Level:</h4>
            <Badge
              className={cn(
                "px-3 py-1 text-sm font-medium",
                result.riskAssessment.level === "critical"
                  ? "bg-red-600/30 text-red-300"
                  : result.riskAssessment.level === "high"
                    ? "bg-orange-600/30 text-orange-300"
                    : result.riskAssessment.level === "medium"
                      ? "bg-yellow-600/30 text-yellow-300"
                      : "bg-green-600/30 text-green-300",
              )}
            >
              {result.riskAssessment.level.toUpperCase()}
            </Badge>
          </div>
          <div>
            <h4 className="text-white/70 font-light mb-2">Risk Factors:</h4>
            <ul className="space-y-2 text-sm text-white/60 font-light">
              {result.riskAssessment.factors.map((factor, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-1" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white/70 font-light mb-2">Recommendations:</h4>
            <ul className="space-y-2 text-sm text-white/60 font-light">
              {result.riskAssessment.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <Lightbulb className="h-4 w-4 text-blue-400 flex-shrink-0 mt-1" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* File Information & Metadata */}
      <Card className="bg-black/60 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-xl">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-2xl font-light text-white flex items-center gap-3">
            <FileText className="h-7 w-7 text-purple-400" />
            File Information
          </CardTitle>
          <CardDescription className="text-white/50 font-light mt-2">
            Essential details about the uploaded media file.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5 text-white/50" />
              <div>
                <div className="text-sm text-white/70 font-light">File Name</div>
                <div className="text-base font-medium text-white">{result.fileInfo.name}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <HardDrive className="h-5 w-5 text-white/50" />
              <div>
                <div className="text-sm text-white/70 font-light">File Size</div>
                <div className="text-base font-medium text-white">{formatBytes(result.fileInfo.size)}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getFileIcon(result.fileInfo.type)}
              <div>
                <div className="text-sm text-white/70 font-light">File Type</div>
                <div className="text-base font-medium text-white">{result.fileInfo.type}</div>
              </div>
            </div>
            {result.fileInfo.duration && (
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-white/50" />
                <div>
                  <div className="text-sm text-white/70 font-light">Duration</div>
                  <div className="text-base font-medium text-white">{formatDuration(result.fileInfo.duration)}</div>
                </div>
              </div>
            )}
            {result.fileInfo.dimensions && (
              <div className="flex items-center space-x-3">
                <Layers className="h-5 w-5 text-white/50" />
                <div>
                  <div className="text-sm text-white/70 font-light">Dimensions</div>
                  <div className="text-base font-medium text-white">
                    {result.fileInfo.dimensions.width}x{result.fileInfo.dimensions.height}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMetadataDialog(true)}
              className="text-white/50 hover:text-white/80 hover:bg-white/5 rounded-xl"
            >
              View Full Metadata <Info className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card className="bg-black/60 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-xl">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-2xl font-light text-white flex items-center gap-3">
            <Code className="h-7 w-7 text-cyan-400" />
            Technical Details
          </CardTitle>
          <CardDescription className="text-white/50 font-light mt-2">
            Underlying models and processing information.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <GitBranch className="h-5 w-5 text-white/50" />
              <div>
                <div className="text-sm text-white/70 font-light">Model Versions</div>
                <div className="text-base font-medium text-white">
                  {result.technicalDetails.modelVersions.join(", ")}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-white/50" />
              <div>
                <div className="text-sm text-white/70 font-light">Analysis Timestamp</div>
                <div className="text-base font-medium text-white">
                  {new Date(result.technicalDetails.analysisTimestamp).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Cpu className="h-5 w-5 text-white/50" />
              <div>
                <div className="text-sm text-white/70 font-light">Processing Nodes</div>
                <div className="text-base font-medium text-white">
                  {result.technicalDetails.processingNodes.join(", ")}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-white/50" />
              <div>
                <div className="text-sm text-white/70 font-light">Total Processing Time</div>
                <div className="text-base font-medium text-white">{result.processingTime}ms</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spatial Analysis (if available) */}
      {result.spatialAnalysis && (
        <Card className="bg-black/60 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-xl">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl font-light text-white flex items-center gap-3">
              <MapPin className="h-7 w-7 text-orange-400" />
              Spatial Analysis
            </CardTitle>
            <CardDescription className="text-white/50 font-light mt-2">
              Object and face detection within the media.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div>
              <h4 className="text-white/70 font-light mb-2">Detected Objects:</h4>
              <ul className="space-y-2 text-sm text-white/60 font-light">
                {result.spatialAnalysis.objects.map((obj, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-white/40 flex-shrink-0" />
                    <span>
                      {obj.label} (Confidence: {(obj.confidence * 100).toFixed(1)}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {result.spatialAnalysis.faces && result.spatialAnalysis.faces.length > 0 && (
              <div>
                <h4 className="text-white/70 font-light mb-2">Detected Faces:</h4>
                <ul className="space-y-2 text-sm text-white/60 font-light">
                  {result.spatialAnalysis.faces.map((face, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-white/40 flex-shrink-0" />
                      <span>
                        Face {index + 1} (Confidence: {(face.confidence * 100).toFixed(1)}%)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSpatialAnalysisDialog(true)}
                className="text-white/50 hover:text-white/80 hover:bg-white/5 rounded-xl"
              >
                View Full Spatial Analysis <Info className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reverse Image Search Results (if available) */}
      {result.reverseSearchResults && result.reverseSearchResults.length > 0 && (
        <Card className="bg-black/60 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-xl">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl font-light text-white flex items-center gap-3">
              <Search className="h-7 w-7 text-green-400" />
              Reverse Search Results
            </CardTitle>
            <CardDescription className="text-white/50 font-light mt-2">
              Matching or similar content found online.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {result.reverseSearchResults.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-start space-x-4 bg-white/5 rounded-lg p-3">
                {item.thumbnail && (
                  <Image
                    src={item.thumbnail || "/placeholder.svg"}
                    alt="Thumbnail"
                    width={64}
                    height={64}
                    className="rounded-md object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h5 className="text-base font-medium text-white leading-tight">{item.title}</h5>
                  <p className="text-sm text-white/60 font-light mt-1">{item.source}</p>
                  <p className="text-xs text-white/40 mt-1">
                    Similarity: {(item.similarity * 100).toFixed(1)}% | Published:{" "}
                    {item.publishDate?.toLocaleDateString()}
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm flex items-center mt-2"
                  >
                    View Source <LinkIcon className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
            {result.reverseSearchResults.length > 3 && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReverseSearchDialog(true)}
                  className="text-white/50 hover:text-white/80 hover:bg-white/5 rounded-xl"
                >
                  View All Results <Info className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Manipulation Regions (if available) */}
      {result.manipulationRegions && result.manipulationRegions.length > 0 && (
        <Card className="bg-black/60 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-xl">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl font-light text-white flex items-center gap-3">
              <Zap className="h-7 w-7 text-red-400" />
              Manipulation Regions
            </CardTitle>
            <CardDescription className="text-white/50 font-light mt-2">
              Areas identified with potential artificial manipulation.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {filePreview && fileType === "image" && (
              <div className="relative w-full max-w-lg mx-auto border border-white/10 rounded-xl overflow-hidden">
                <Image
                  src={filePreview || "/placeholder.svg"}
                  alt="File Preview with Regions"
                  width={500}
                  height={300}
                  className="w-full h-auto object-contain"
                />
                {result.manipulationRegions.map((region, index) => (
                  <div
                    key={index}
                    className="absolute border-2 border-red-500 bg-red-500/20 pointer-events-none"
                    style={{
                      left: `${(region.x / (result.fileInfo.dimensions?.width || 1)) * 100}%`,
                      top: `${(region.y / (result.fileInfo.dimensions?.height || 1)) * 100}%`,
                      width: `${(region.width / (result.fileInfo.dimensions?.width || 1)) * 100}%`,
                      height: `${(region.height / (result.fileInfo.dimensions?.height || 1)) * 100}%`,
                    }}
                  >
                    <span className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded-br-md">
                      {(region.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
            <ul className="space-y-2 text-sm text-white/60 font-light">
              {result.manipulationRegions.map((region, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-white/40 flex-shrink-0" />
                  <span>
                    Region {index + 1}: {region.type || "Unspecified"} (Confidence:{" "}
                    {(region.confidence * 100).toFixed(1)}%)
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Dialogs for more details */}
      {/* Deepfake Details Dialog */}
      <Dialog open={showDeepfakeDetailsDialog} onOpenChange={setShowDeepfakeDetailsDialog}>
        <DialogContent className="sm:max-w-[800px] bg-black/60 backdrop-blur-md border border-white/30 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light text-white">Deepfake Analysis Details</DialogTitle>
            <DialogDescription className="text-white/50 font-light">
              In-depth breakdown of deepfake detection methods and their scores.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {result.deepfakeAnalysis?.detectionMethods &&
              Object.entries(result.deepfakeAnalysis.detectionMethods).map(([method, details]) => (
                <div key={method} className="bg-white/5 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-white capitalize">
                    {method.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </h4>
                  <p className="text-sm text-white/70">Score: {(details.score * 100).toFixed(1)}%</p>
                  {details.artifacts && details.artifacts.length > 0 && (
                    <div className="text-xs text-white/60">
                      <span className="font-semibold">Artifacts:</span> {details.artifacts.join(", ")}
                    </div>
                  )}
                  {/* Add more specific details based on method type if needed */}
                </div>
              ))}
          </div>
          {result.deepfakeAnalysis?.aiProviderSignature && (
            <div className="bg-white/5 rounded-lg p-4 space-y-2 mt-4">
              <h4 className="font-medium text-white">AI Provider Signature Detected</h4>
              <p className="text-sm text-white/70">
                Provider: {result.deepfakeAnalysis.aiProviderSignature.detectedProvider}
              </p>
              <p className="text-sm text-white/70">
                Confidence: {(result.deepfakeAnalysis.aiProviderSignature.confidence * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-white/60">
                Characteristics: {result.deepfakeAnalysis.aiProviderSignature.characteristics.join(", ")}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Spatial Analysis Dialog */}
      <Dialog open={showSpatialAnalysisDialog} onOpenChange={setShowSpatialAnalysisDialog}>
        <DialogContent className="sm:max-w-[800px] bg-black/60 backdrop-blur-md border border-white/30 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light text-white">Full Spatial Analysis</DialogTitle>
            <DialogDescription className="text-white/50 font-light">
              Detailed breakdown of objects, faces, and deepfake evidence within the media.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {result.spatialAnalysis?.objects && result.spatialAnalysis.objects.length > 0 && (
              <div>
                <h3 className="text-xl font-light text-white mb-3 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-white/70" /> Detected Objects
                </h3>
                <ul className="space-y-2 text-sm text-white/70">
                  {result.spatialAnalysis.objects.map((obj, index) => (
                    <li key={index} className="bg-white/5 rounded-lg p-3">
                      <p>
                        <span className="font-medium">{obj.label}</span> (Type: {obj.type}, Confidence:{" "}
                        {(obj.confidence * 100).toFixed(1)}%)
                      </p>
                      <p className="text-xs text-white/50">
                        Bounding Box: x:{obj.boundingBox.x}, y:{obj.boundingBox.y}, w:{obj.boundingBox.width}, h:
                        {obj.boundingBox.height}
                      </p>
                      {obj.attributes && (
                        <p className="text-xs text-white/50">
                          Attributes:{" "}
                          {Object.entries(obj.attributes)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.spatialAnalysis?.faces && result.spatialAnalysis.faces.length > 0 && (
              <div>
                <h3 className="text-xl font-light text-white mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-white/70" /> Detected Faces
                </h3>
                <ul className="space-y-2 text-sm text-white/70">
                  {result.spatialAnalysis.faces.map((face, index) => (
                    <li key={index} className="bg-white/5 rounded-lg p-3">
                      <p>
                        <span className="font-medium">Face {index + 1}</span> (Confidence:{" "}
                        {(face.confidence * 100).toFixed(1)}%)
                      </p>
                      <p className="text-xs text-white/50">
                        Bounding Box: x:{face.boundingBox.x}, y:{face.boundingBox.y}, w:{face.boundingBox.width}, h:
                        {face.boundingBox.height}
                      </p>
                      {face.attributes && (
                        <p className="text-xs text-white/50">
                          Attributes:{" "}
                          {Object.entries(face.attributes)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </p>
                      )}
                      {face.deepfakeIndicators && (
                        <div className="text-xs text-white/50 mt-1">
                          <span className="font-semibold">Deepfake Indicators:</span>
                          {Object.entries(face.deepfakeIndicators).map(([k, v]) => (
                            <span key={k} className="ml-2">
                              {k.replace(/([A-Z])/g, " $1")}: {(v * 100).toFixed(1)}%
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.spatialAnalysis?.deepfakeEvidence && result.spatialAnalysis.deepfakeEvidence.length > 0 && (
              <div>
                <h3 className="text-xl font-light text-white mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-white/70" /> Deepfake Evidence
                </h3>
                <ul className="space-y-2 text-sm text-white/70">
                  {result.spatialAnalysis.deepfakeEvidence.map((evidence, index) => (
                    <li key={index} className="bg-white/5 rounded-lg p-3">
                      <p>
                        <span className="font-medium capitalize">{evidence.type}:</span> {evidence.description}{" "}
                        (Confidence: {(evidence.confidence * 100).toFixed(1)}%)
                      </p>
                      {evidence.visualEvidence && evidence.visualEvidence.length > 0 && (
                        <p className="text-xs text-white/50">
                          Visual Evidence Regions:{" "}
                          {evidence.visualEvidence.map((v) => `(${v.x},${v.y},${v.width},${v.height})`).join("; ")}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.spatialAnalysis?.technicalAnalysis && (
              <div>
                <h3 className="text-xl font-light text-white mb-3 flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-white/70" /> Technical Analysis
                </h3>
                <div className="bg-white/5 rounded-lg p-3 text-sm text-white/70 space-y-1">
                  <p>
                    Resolution: {result.spatialAnalysis.technicalAnalysis.resolution.width}x
                    {result.spatialAnalysis.technicalAnalysis.resolution.height}
                  </p>
                  <p>Color Space: {result.spatialAnalysis.technicalAnalysis.colorSpace}</p>
                  <p>Noise: {(result.spatialAnalysis.technicalAnalysis.noise * 100).toFixed(1)}%</p>
                  <p>Sharpness: {(result.spatialAnalysis.technicalAnalysis.sharpness * 100).toFixed(1)}%</p>
                  <p>Compression: {result.spatialAnalysis.technicalAnalysis.compression}</p>
                  <p>
                    Lighting: Overall {result.spatialAnalysis.technicalAnalysis.lighting.overall}, Shadows{" "}
                    {result.spatialAnalysis.technicalAnalysis.lighting.shadows}, Highlights{" "}
                    {result.spatialAnalysis.technicalAnalysis.lighting.highlights}
                  </p>
                </div>
              </div>
            )}

            {result.spatialAnalysis?.reasoning && (
              <div>
                <h3 className="text-xl font-light text-white mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-white/70" /> Reasoning
                </h3>
                <div className="bg-white/5 rounded-lg p-3 text-sm text-white/70 space-y-2">
                  <p className="font-medium">{result.spatialAnalysis.reasoning.summary}</p>
                  <p className="text-xs text-white/60">
                    Key Factors: {result.spatialAnalysis.reasoning.keyFactors.join(", ")}
                  </p>
                  <p className="text-xs text-white/60">
                    Technical Details: {result.spatialAnalysis.reasoning.technicalDetails.join(", ")}
                  </p>
                  <p className="font-medium text-white/80 mt-2">
                    Conclusion: {result.spatialAnalysis.reasoning.conclusion}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reverse Search Dialog */}
      <Dialog open={showReverseSearchDialog} onOpenChange={setShowReverseSearchDialog}>
        <DialogContent className="sm:max-w-[800px] bg-black/60 backdrop-blur-md border border-white/30 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light text-white">All Reverse Search Results</DialogTitle>
            <DialogDescription className="text-white/50 font-light">
              A comprehensive list of all matching and similar content found online.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {result.reverseSearchResults?.map((item, index) => (
              <div key={index} className="flex items-start space-x-4 bg-white/5 rounded-lg p-3">
                {item.thumbnail && (
                  <Image
                    src={item.thumbnail || "/placeholder.svg"}
                    alt="Thumbnail"
                    width={80}
                    height={80}
                    className="rounded-md object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h5 className="text-lg font-medium text-white leading-tight">{item.title}</h5>
                  <p className="text-sm text-white/60 font-light mt-1">{item.source}</p>
                  <p className="text-xs text-white/40 mt-1">
                    Similarity: {(item.similarity * 100).toFixed(1)}% | Published:{" "}
                    {item.publishDate?.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-white/50 mt-2">{item.context}</p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm flex items-center mt-2"
                  >
                    View Source <LinkIcon className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Metadata Dialog */}
      <Dialog open={showMetadataDialog} onOpenChange={setShowMetadataDialog}>
        <DialogContent className="sm:max-w-[800px] bg-black/60 backdrop-blur-md border border-white/30 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light text-white">Full Media Metadata</DialogTitle>
            <DialogDescription className="text-white/50 font-light">
              All extracted technical and descriptive metadata from the file.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {result.metadata && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
                <div className="bg-white/5 rounded-lg p-3">
                  <h4 className="font-medium text-white mb-2">Basic Info</h4>
                  <p>
                    <span className="font-light">File Name:</span> {result.metadata.fileName}
                  </p>
                  <p>
                    <span className="font-light">File Size:</span> {formatBytes(result.metadata.fileSize)}
                  </p>
                  <p>
                    <span className="font-light">File Type:</span> {result.metadata.fileType}
                  </p>
                  <p>
                    <span className="font-light">MIME Type:</span> {result.metadata.mimeType}
                  </p>
                  <p>
                    <span className="font-light">Hash (SHA-256):</span> {result.metadata.hash.substring(0, 16)}...
                  </p>
                </div>

                {result.metadata.dimensions && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <h4 className="font-medium text-white mb-2">Dimensions</h4>
                    <p>
                      <span className="font-light">Width:</span> {result.metadata.dimensions.width}px
                    </p>
                    <p>
                      <span className="font-light">Height:</span> {result.metadata.dimensions.height}px
                    </p>
                  </div>
                )}

                {result.metadata.duration && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <h4 className="font-medium text-white mb-2">Timing</h4>
                    <p>
                      <span className="font-light">Duration:</span> {formatDuration(result.metadata.duration)}
                    </p>
                    <p>
                      <span className="font-light">Frame Rate:</span> {result.metadata.frameRate || "N/A"} fps
                    </p>
                  </div>
                )}

                {result.metadata.exifData && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <h4 className="font-medium text-white mb-2">EXIF Data</h4>
                    {Object.entries(result.metadata.exifData).map(([key, value]) => (
                      <p key={key}>
                        <span className="font-light capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>{" "}
                        {typeof value === "object" && value !== null ? JSON.stringify(value) : String(value)}
                      </p>
                    ))}
                  </div>
                )}

                {result.metadata.technicalSpecs && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <h4 className="font-medium text-white mb-2">Technical Specs</h4>
                    {Object.entries(result.metadata.technicalSpecs).map(([key, value]) => (
                      <p key={key}>
                        <span className="font-light capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>{" "}
                        {String(value)}
                      </p>
                    ))}
                  </div>
                )}

                <div className="bg-white/5 rounded-lg p-3">
                  <h4 className="font-medium text-white mb-2">Dates</h4>
                  <p>
                    <span className="font-light">Created:</span>{" "}
                    {result.metadata.createdDate?.toLocaleString() || "N/A"}
                  </p>
                  <p>
                    <span className="font-light">Modified:</span>{" "}
                    {result.metadata.modifiedDate?.toLocaleString() || "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { EnhancedAnalysisDisplay }
