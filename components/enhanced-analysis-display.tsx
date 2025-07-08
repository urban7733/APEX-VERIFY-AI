"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
  Eye,
  Clock,
  Shield,
  Zap,
  FileText,
  BarChart3,
  AlertCircle,
  Info,
  Download,
  Share2,
  Copy,
  Search,
} from "lucide-react"
import type { ComprehensiveAnalysisResult } from "@/lib/analysis-engine"
import { SpatialAnalysisDisplay } from "./spatial-analysis-display"
import Image from "next/image"

interface EnhancedAnalysisDisplayProps {
  result: ComprehensiveAnalysisResult
  onDownloadReport?: () => void
  onShareResult?: () => void
  filePreview?: string
  fileType: "image" | "video" | "audio"
}

export function EnhancedAnalysisDisplay({
  result,
  onDownloadReport,
  onShareResult,
  filePreview,
  fileType,
}: EnhancedAnalysisDisplayProps) {
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

  const getStatusIcon = () => {
    if (result.isDeepfake) {
      return result.confidence > 0.98 ? (
        <XCircle className="h-6 w-6 text-white/80" />
      ) : (
        <AlertTriangle className="h-6 w-6 text-white/80" />
      )
    }
    return (
      <div className="h-6 w-6 flex items-center justify-center">
        <Image
          src="/verified-apex-verify-logo-2.png"
          alt="Truth Intelligence Logo"
          width={24}
          height={24}
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

  return (
    <div className="space-y-8">
      {/* Main Status Card */}
      <div className="border border-white/10 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            {getStatusIcon()}
            <div>
              <h2 className="text-xl font-light text-white mb-1">
                {result.isDeepfake ? "Manipulation Detected" : "Content Verified"}
              </h2>
              <p className="text-white/50 font-light">{(result.confidence * 100).toFixed(1)}% confidence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-xl border font-light text-sm ${getRiskColor(result.riskAssessment.level)}`}
            >
              {result.riskAssessment.level.toUpperCase()}
            </div>
            {result.verificationStatus && (
              <div
                className={`px-4 py-2 rounded-xl border font-light text-sm ${
                  result.verificationStatus.verified
                    ? "bg-white/5 text-white/70 border-white/10"
                    : "bg-white/10 text-white/80 border-white/20"
                }`}
              >
                {result.verificationStatus.verified ? "VERIFIED" : "UNVERIFIED"}
              </div>
            )}
          </div>
        </div>

        {/* AI Provider Detection */}
        {result.aiProvider && (
          <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="h-4 w-4 text-white/60" />
              <span className="font-light text-white/80">AI Generation Detected</span>
            </div>
            <p className="text-white/60 font-light">
              Generated using <strong className="text-white/80">{result.aiProvider}</strong>
            </p>
          </div>
        )}

        {/* Verification Status */}
        {result.verificationStatus && (
          <div
            className={`mb-8 p-6 border rounded-xl ${
              result.verificationStatus?.verified ? "bg-white/5 border-white/10" : "bg-white/10 border-white/20"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              {result.verificationStatus?.verified ? (
                <CheckCircle className="h-4 w-4 text-white/70" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-white/80" />
              )}
              <span className="font-light text-white/80">
                {result.verificationStatus?.verified ? "Verification Available" : "Verification Unavailable"}
              </span>
            </div>
            <p className="text-white/60 font-light">{result.verificationStatus?.reason}</p>
          </div>
        )}

        {/* Clean Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-2xl font-light text-white mb-2">{(result.confidence * 100).toFixed(1)}%</div>
            <div className="text-sm text-white/40 font-light">Confidence</div>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-2xl font-light text-white mb-2">{(result.processingTime / 1000).toFixed(1)}s</div>
            <div className="text-sm text-white/40 font-light">Processing</div>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-2xl font-light text-white mb-2">{result.manipulationRegions?.length || 0}</div>
            <div className="text-sm text-white/40 font-light">Regions</div>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="text-2xl font-light text-white mb-2">
              {(result.fileInfo.size / 1024 / 1024).toFixed(1)}MB
            </div>
            <div className="text-sm text-white/40 font-light">File Size</div>
          </div>
        </div>

        {/* Clean Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            onClick={onDownloadReport}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-light"
          >
            <Download className="h-4 w-4 mr-2" />
            Report
          </Button>
          <Button
            variant="outline"
            onClick={onShareResult}
            className="border-white/10 hover:bg-white/5 text-white/70 rounded-xl font-light bg-transparent"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            onClick={() => copyToClipboard(window.location.href)}
            className="border-white/10 hover:bg-white/5 text-white/70 rounded-xl font-light"
          >
            {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/5 border-b border-white/10 w-full justify-start rounded-none p-0">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent py-3 px-4 font-light text-white/70 data-[state=active]:text-white"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="spatial"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent py-3 px-4 font-light text-white/70 data-[state=active]:text-white"
          >
            <Search className="h-4 w-4 mr-2" />
            Spatial Analysis
          </TabsTrigger>
          <TabsTrigger
            value="technical"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent py-3 px-4 font-light text-white/70 data-[state=active]:text-white"
          >
            <Brain className="h-4 w-4 mr-2" />
            Technical Analysis
          </TabsTrigger>
          <TabsTrigger
            value="risk"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent py-3 px-4 font-light text-white/70 data-[state=active]:text-white"
          >
            <Shield className="h-4 w-4 mr-2" />
            Risk Assessment
          </TabsTrigger>
          <TabsTrigger
            value="metadata"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent py-3 px-4 font-light text-white/70 data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            File Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-8">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Analysis Breakdown */}
            <div className="border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-5 w-5 text-white/60" />
                <h3 className="text-lg font-light text-white">Analysis Breakdown</h3>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/50 font-light text-sm">Face Consistency</span>
                    <span className="text-white font-light text-sm">
                      {(result.analysisDetails.faceConsistency * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={result.analysisDetails.faceConsistency * 100} className="h-1.5 bg-white/5" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/50 font-light text-sm">Temporal Consistency</span>
                    <span className="text-white font-light text-sm">
                      {(result.analysisDetails.temporalConsistency * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={result.analysisDetails.temporalConsistency * 100} className="h-1.5 bg-white/5" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/50 font-light text-sm">Frequency Analysis</span>
                    <span className="text-white font-light text-sm">
                      {(result.analysisDetails.frequencyAnalysis * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={result.analysisDetails.frequencyAnalysis * 100} className="h-1.5 bg-white/5" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/50 font-light text-sm">Metadata Integrity</span>
                    <span className="text-white font-light text-sm">
                      {(result.analysisDetails.metadataIntegrity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={result.analysisDetails.metadataIntegrity * 100} className="h-1.5 bg-white/5" />
                </div>

                {result.analysisDetails.lipSyncAccuracy && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 font-light text-sm">Lip Sync Accuracy</span>
                      <span className="text-white font-light text-sm">
                        {(result.analysisDetails.lipSyncAccuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={result.analysisDetails.lipSyncAccuracy * 100} className="h-1.5 bg-white/5" />
                  </div>
                )}

                {result.analysisDetails.blinkPattern && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 font-light text-sm">Blink Pattern</span>
                      <span className="text-white font-light text-sm">
                        {(result.analysisDetails.blinkPattern * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={result.analysisDetails.blinkPattern * 100} className="h-1.5 bg-white/5" />
                  </div>
                )}
              </div>
            </div>

            {/* Manipulation Regions */}
            {result.manipulationRegions && result.manipulationRegions.length > 0 && (
              <div className="border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  <h3 className="text-lg font-light text-white">Manipulation Regions</h3>
                </div>
                <div>
                  <div className="space-y-3">
                    {result.manipulationRegions.map((region, index) => (
                      <div key={index} className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-orange-400 font-light text-sm">Region {index + 1}</span>
                          <div className="px-3 py-1 rounded-xl bg-orange-500/10 text-orange-300 border border-orange-500/20 font-light text-xs">
                            {(region.confidence * 100).toFixed(1)}% confidence
                          </div>
                        </div>
                        <div className="text-sm text-white/50 font-light">
                          Position: ({region.x.toFixed(0)}, {region.y.toFixed(0)}) - Size: {region.width.toFixed(0)}×
                          {region.height.toFixed(0)}px
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="spatial" className="mt-8">
          {result.spatialAnalysis && (
            <SpatialAnalysisDisplay
              spatialAnalysis={result.spatialAnalysis}
              isDeepfake={result.isDeepfake}
              filePreview={filePreview}
              fileType={fileType}
            />
          )}
        </TabsContent>

        <TabsContent value="technical" className="mt-8">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Model Information */}
            <div className="border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-5 w-5 text-white/60" />
                <h3 className="text-lg font-light text-white">AI Models Used</h3>
              </div>
              <div>
                <div className="space-y-3">
                  {result.technicalDetails.modelVersions.map((model, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                      <span className="text-white/60 font-light text-sm">{model}</span>
                      <div className="px-3 py-1 rounded-xl bg-green-500/10 text-green-300 border border-green-500/20 font-light text-xs">
                        Active
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Processing Details */}
            <div className="border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="h-5 w-5 text-white/60" />
                <h3 className="text-lg font-light text-white">Processing Details</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/50 font-light text-sm">Analysis Timestamp</span>
                  <span className="text-white/60 font-light text-sm">
                    {new Date(result.technicalDetails.analysisTimestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 font-light text-sm">Processing Time</span>
                  <span className="text-white/60 font-light text-sm">{(result.processingTime / 1000).toFixed(2)}s</span>
                </div>
                <div>
                  <span className="text-white/50 font-light text-sm block mb-2">Processing Nodes</span>
                  <div className="space-y-2">
                    {result.technicalDetails.processingNodes.map((node, index) => (
                      <div key={index} className="text-sm text-white/60 font-light bg-white/5 p-3 rounded-xl">
                        {node}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="mt-8">
          <div className="border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-white/60" />
              <h3 className="text-lg font-light text-white">Risk Assessment</h3>
            </div>
            <div className="space-y-6">
              {/* Risk Level */}
              <div className="text-center p-6 bg-white/5 rounded-xl">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-light ${getRiskColor(result.riskAssessment.level)}`}
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>{result.riskAssessment.level.toUpperCase()}</span>
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h4 className="text-md font-light text-white mb-3">Risk Factors</h4>
                <div className="space-y-2">
                  {result.riskAssessment.factors.map((factor, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                      <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                      <span className="text-white/60 font-light text-sm">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-md font-light text-white mb-3">Recommendations</h4>
                <div className="space-y-2">
                  {result.riskAssessment.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl"
                    >
                      <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <span className="text-white/60 font-light text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metadata" className="mt-8">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* File Information */}
            <div className="border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5 text-white/60" />
                <h3 className="text-lg font-light text-white">File Information</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/50 font-light text-sm">File Name</span>
                  <span className="text-white/60 font-light text-sm truncate max-w-[200px]">
                    {result.fileInfo.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 font-light text-sm">File Size</span>
                  <span className="text-white/60 font-light text-sm">
                    {(result.fileInfo.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 font-light text-sm">File Type</span>
                  <span className="text-white/60 font-light text-sm">{result.fileInfo.type}</span>
                </div>
                {result.fileInfo.duration && (
                  <div className="flex justify-between">
                    <span className="text-white/50 font-light text-sm">Duration</span>
                    <span className="text-white/60 font-light text-sm">{result.fileInfo.duration.toFixed(2)}s</span>
                  </div>
                )}
                {result.fileInfo.dimensions && (
                  <div className="flex justify-between">
                    <span className="text-white/50 font-light text-sm">Dimensions</span>
                    <span className="text-white/60 font-light text-sm">
                      {result.fileInfo.dimensions.width} × {result.fileInfo.dimensions.height}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Metadata */}
            <div className="border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-white/60" />
                <h3 className="text-lg font-light text-white">Analysis Metadata</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/50 font-light text-sm">Analysis ID</span>
                  <span className="text-white/60 font-light text-sm font-mono">
                    {Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 font-light text-sm">Timestamp</span>
                  <span className="text-white/60 font-light text-sm">
                    {new Date(result.technicalDetails.analysisTimestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 font-light text-sm">Processing Time</span>
                  <span className="text-white/60 font-light text-sm">{(result.processingTime / 1000).toFixed(2)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 font-light text-sm">Confidence Score</span>
                  <span className="text-white/60 font-light text-sm">{(result.confidence * 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
