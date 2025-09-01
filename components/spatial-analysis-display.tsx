"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Eye,
  Brain,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Search,
  Target,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { SpatialAnalysisResult } from "@/lib/spatial-analysis-engine"

interface SpatialAnalysisDisplayProps {
  spatialAnalysis: SpatialAnalysisResult
  isDeepfake: boolean
  filePreview?: string
  fileType: "image" | "video" | "audio"
}

export function SpatialAnalysisDisplay({
  spatialAnalysis,
  isDeepfake,
  filePreview,
  fileType,
}: SpatialAnalysisDisplayProps) {
  const [activeTab, setActiveTab] = useState("scene")
  const [expandedEvidence, setExpandedEvidence] = useState<number | null>(null)
  const [showVisualEvidence, setShowVisualEvidence] = useState(true)

  const getEvidenceIcon = (type: "supporting" | "contradicting") => {
    return type === "supporting" ? (
      <XCircle className="h-5 w-5 text-red-400" />
    ) : (
      <CheckCircle className="h-5 w-5 text-green-400" />
    )
  }

  const getEvidenceColor = (type: "supporting" | "contradicting") => {
    return type === "supporting"
      ? "bg-red-500/10 border-red-500/20 text-red-400"
      : "bg-green-500/10 border-green-500/20 text-green-400"
  }

  const renderVisualEvidence = () => {
    if (fileType === "audio" || !filePreview) return null

    return (
      <div className="relative">
        {fileType === "image" ? (
          <img
            src={filePreview || "/placeholder.svg"}
            alt="Analysis preview"
            className="w-full h-auto max-h-96 object-contain rounded-lg"
          />
        ) : (
          <video src={filePreview} className="w-full h-auto max-h-96 object-contain rounded-lg" controls />
        )}

        {/* Overlay evidence markers */}
        {showVisualEvidence &&
          spatialAnalysis.deepfakeEvidence.map((evidence, index) =>
            evidence.visualEvidence.map((visual, vIndex) => (
              <div
                key={`${index}-${vIndex}`}
                className={`absolute border-2 ${
                  evidence.type === "supporting" ? "border-red-400" : "border-green-400"
                } rounded`}
                style={{
                  left: `${(visual.x / spatialAnalysis.technicalAnalysis.resolution.width) * 100}%`,
                  top: `${(visual.y / spatialAnalysis.technicalAnalysis.resolution.height) * 100}%`,
                  width: `${(visual.width / spatialAnalysis.technicalAnalysis.resolution.width) * 100}%`,
                  height: `${(visual.height / spatialAnalysis.technicalAnalysis.resolution.height) * 100}%`,
                }}
              >
                <div
                  className={`absolute -top-6 left-0 text-xs px-2 py-1 rounded ${
                    evidence.type === "supporting" ? "bg-red-500 text-white" : "bg-green-500 text-white"
                  }`}
                >
                  {visual.description}
                </div>
              </div>
            )),
          )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Scene Understanding */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Spatial Understanding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-medium text-white mb-2">What We See</h4>
              <p className="text-white/80 leading-relaxed">{spatialAnalysis.sceneDescription}</p>
            </div>

            {fileType !== "audio" && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVisualEvidence(!showVisualEvidence)}
                  className="border-white/20 hover:bg-white/10"
                >
                  <Target className="h-4 w-4 mr-2" />
                  {showVisualEvidence ? "Hide" : "Show"} Evidence Markers
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/5 border-b border-white/10 w-full justify-start rounded-none p-0">
          <TabsTrigger
            value="scene"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent py-3 px-4"
          >
            <Search className="h-4 w-4 mr-2" />
            Scene Analysis
          </TabsTrigger>
          <TabsTrigger
            value="evidence"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent py-3 px-4"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Evidence
          </TabsTrigger>
          <TabsTrigger
            value="reasoning"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent py-3 px-4"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Reasoning
          </TabsTrigger>
          {fileType !== "audio" && (
            <TabsTrigger
              value="visual"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent py-3 px-4"
            >
              <Eye className="h-4 w-4 mr-2" />
              Visual Analysis
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="scene" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Objects Detected */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Objects Detected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {spatialAnalysis.objects.map((object, index) => (
                    <div key={object.id} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-white">{object.label}</span>
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                          {(object.confidence * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="text-sm text-white/60">
                        Type: {object.type} • Position: ({object.boundingBox.x.toFixed(0)},{" "}
                        {object.boundingBox.y.toFixed(0)})
                      </div>
                      {Object.keys(object.attributes).length > 0 && (
                        <div className="mt-2 text-sm text-white/60">
                          {Object.entries(object.attributes).map(([key, value]) => (
                            <span key={key} className="mr-3">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Face Analysis */}
            {spatialAnalysis.faces.length > 0 && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">Face Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {spatialAnalysis.faces.map((face, index) => (
                      <div key={face.id} className="space-y-3">
                        <div className="p-3 bg-white/5 rounded-lg">
                          <h4 className="font-medium text-white mb-2">Face {index + 1}</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Age: {face.attributes.age}</div>
                            <div>Gender: {face.attributes.gender}</div>
                            <div>Emotion: {face.attributes.emotion}</div>
                            <div>Quality: {(face.attributes.quality.sharpness * 100).toFixed(1)}%</div>
                          </div>
                        </div>

                        <div className="p-3 bg-white/5 rounded-lg">
                          <h5 className="font-medium text-white mb-2">Deepfake Indicators</h5>
                          <div className="space-y-2">
                            {Object.entries(face.deepfakeIndicators).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center">
                                <span className="text-sm text-white/60 capitalize">
                                  {key.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-16 h-2 rounded-full ${
                                      value > 0.7 ? "bg-red-500" : value > 0.4 ? "bg-yellow-500" : "bg-green-500"
                                    }`}
                                  >
                                    <div
                                      className="h-full bg-white rounded-full"
                                      style={{ width: `${value * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-white/80">{(value * 100).toFixed(1)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="evidence" className="mt-6">
          <div className="space-y-4">
            {spatialAnalysis.deepfakeEvidence.map((evidence, index) => (
              <Card key={index} className={`border ${getEvidenceColor(evidence.type)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getEvidenceIcon(evidence.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {evidence.type === "supporting" ? "Evidence FOR Deepfake" : "Evidence AGAINST Deepfake"}
                        </h4>
                        <Badge className="bg-white/10 text-white/80">
                          {(evidence.confidence * 100).toFixed(1)}% confidence
                        </Badge>
                      </div>
                      <p className="text-white/80 mb-3">{evidence.description}</p>

                      {evidence.visualEvidence.length > 0 && (
                        <div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedEvidence(expandedEvidence === index ? null : index)}
                            className="text-white/60 hover:text-white p-0 h-auto"
                          >
                            {expandedEvidence === index ? (
                              <ChevronUp className="h-4 w-4 mr-1" />
                            ) : (
                              <ChevronDown className="h-4 w-4 mr-1" />
                            )}
                            {evidence.visualEvidence.length} visual evidence region(s)
                          </Button>

                          {expandedEvidence === index && (
                            <div className="mt-3 space-y-2">
                              {evidence.visualEvidence.map((visual, vIndex) => (
                                <div key={vIndex} className="p-2 bg-white/5 rounded text-sm">
                                  <div className="font-medium text-white/80">{visual.description}</div>
                                  <div className="text-white/60">
                                    Region: ({visual.x.toFixed(0)}, {visual.y.toFixed(0)}) - Size:{" "}
                                    {visual.width.toFixed(0)}×{visual.height.toFixed(0)}px
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reasoning" className="mt-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Analysis Reasoning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-medium text-white mb-2">Analysis Summary</h4>
                <p className="text-white/80 leading-relaxed">{spatialAnalysis.reasoning.summary}</p>
              </div>

              {/* Key Factors */}
              <div>
                <h4 className="font-medium text-white mb-3">Key Factors Considered</h4>
                <div className="space-y-2">
                  {spatialAnalysis.reasoning.keyFactors.map((factor, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Details */}
              <div>
                <h4 className="font-medium text-white mb-3">Technical Analysis Details</h4>
                <div className="space-y-2">
                  {spatialAnalysis.reasoning.technicalDetails.map((detail, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <Zap className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80 font-mono text-sm">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conclusion */}
              <div
                className={`p-4 rounded-lg border ${
                  isDeepfake ? "bg-red-500/10 border-red-500/20" : "bg-green-500/10 border-green-500/20"
                }`}
              >
                <h4 className={`font-medium mb-2 ${isDeepfake ? "text-red-400" : "text-green-400"}`}>
                  Final Conclusion
                </h4>
                <p className="text-white/80 leading-relaxed">{spatialAnalysis.reasoning.conclusion}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {fileType !== "audio" && (
          <TabsContent value="visual" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Visual Preview */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">Visual Analysis</CardTitle>
                </CardHeader>
                <CardContent>{renderVisualEvidence()}</CardContent>
              </Card>

              {/* Technical Analysis */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">Technical Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="text-sm text-white/60 mb-1">Resolution</div>
                      <div className="font-medium text-white">
                        {spatialAnalysis.technicalAnalysis.resolution.width} ×{" "}
                        {spatialAnalysis.technicalAnalysis.resolution.height}
                      </div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="text-sm text-white/60 mb-1">Color Space</div>
                      <div className="font-medium text-white">{spatialAnalysis.technicalAnalysis.colorSpace}</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="text-sm text-white/60 mb-1">Noise Level</div>
                      <div className="font-medium text-white">
                        {(spatialAnalysis.technicalAnalysis.noise * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="text-sm text-white/60 mb-1">Sharpness</div>
                      <div className="font-medium text-white">
                        {(spatialAnalysis.technicalAnalysis.sharpness * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-sm text-white/60 mb-2">Compression Analysis</div>
                    <div className="text-white/80">{spatialAnalysis.technicalAnalysis.compression}</div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-sm text-white/60 mb-2">Lighting Analysis</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Overall:</span>
                        <span
                          className={`font-medium ${
                            spatialAnalysis.technicalAnalysis.lighting.overall === "natural"
                              ? "text-green-400"
                              : spatialAnalysis.technicalAnalysis.lighting.overall === "inconsistent"
                                ? "text-red-400"
                                : "text-yellow-400"
                          }`}
                        >
                          {spatialAnalysis.technicalAnalysis.lighting.overall}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Shadows:</span>
                        <span
                          className={`font-medium ${
                            spatialAnalysis.technicalAnalysis.lighting.shadows === "consistent"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {spatialAnalysis.technicalAnalysis.lighting.shadows}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Highlights:</span>
                        <span
                          className={`font-medium ${
                            spatialAnalysis.technicalAnalysis.lighting.highlights === "natural"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {spatialAnalysis.technicalAnalysis.lighting.highlights}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
