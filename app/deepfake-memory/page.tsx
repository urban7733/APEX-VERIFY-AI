"use client"

import { useState } from "react"
import { ArrowLeft, Search, Eye, Download, Share2, AlertTriangle, CheckCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Orb from "@/components/Orb"

interface DeepfakeRecord {
  id: string
  fileName: string
  uploadDate: Date
  analysisResult: "authentic" | "deepfake" | "suspicious"
  confidence: number
  fileType: "image" | "video" | "audio"
  fileSize: number
  thumbnail?: string
  tags: string[]
  notes?: string
  riskLevel: "low" | "medium" | "high" | "critical"
}

// Mock data for demonstration
const mockRecords: DeepfakeRecord[] = [
  {
    id: "1",
    fileName: "conference_video.mp4",
    uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    analysisResult: "authentic",
    confidence: 94.2,
    fileType: "video",
    fileSize: 15.7,
    tags: ["business", "conference", "verified"],
    riskLevel: "low",
  },
  {
    id: "2",
    fileName: "profile_photo.jpg",
    uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    analysisResult: "deepfake",
    confidence: 87.3,
    fileType: "image",
    fileSize: 2.1,
    tags: ["portrait", "suspicious", "flagged"],
    notes: "Facial inconsistencies detected around jawline",
    riskLevel: "high",
  },
  {
    id: "3",
    fileName: "interview_audio.wav",
    uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    analysisResult: "suspicious",
    confidence: 72.8,
    fileType: "audio",
    fileSize: 8.4,
    tags: ["interview", "voice", "review-needed"],
    riskLevel: "medium",
  },
  {
    id: "4",
    fileName: "marketing_video.mp4",
    uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    analysisResult: "authentic",
    confidence: 96.7,
    fileType: "video",
    fileSize: 23.2,
    tags: ["marketing", "commercial", "verified"],
    riskLevel: "low",
  },
  {
    id: "5",
    fileName: "social_post.jpg",
    uploadDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    analysisResult: "deepfake",
    confidence: 91.5,
    fileType: "image",
    fileSize: 1.8,
    tags: ["social-media", "manipulated", "flagged"],
    notes: "AI-generated artifacts detected",
    riskLevel: "critical",
  },
]

export default function DeepfakeMemoryPage() {
  const [records, setRecords] = useState<DeepfakeRecord[]>(mockRecords)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "authentic" | "deepfake" | "suspicious">("all")
  const [sortBy, setSortBy] = useState<"date" | "confidence" | "risk">("date")

  const filteredRecords = records
    .filter((record) => {
      const matchesSearch =
        record.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesFilter = filterType === "all" || record.analysisResult === filterType
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return b.uploadDate.getTime() - a.uploadDate.getTime()
        case "confidence":
          return b.confidence - a.confidence
        case "risk":
          const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          return riskOrder[b.riskLevel] - riskOrder[a.riskLevel]
        default:
          return 0
      }
    })

  const getResultIcon = (result: string) => {
    switch (result) {
      case "authentic":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "deepfake":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      case "suspicious":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      default:
        return null
    }
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case "authentic":
        return "text-green-400 bg-green-400/10 border-green-400/20"
      case "deepfake":
        return "text-red-400 bg-red-400/10 border-red-400/20"
      case "suspicious":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "text-red-500 bg-red-500/10 border-red-500/20"
      case "high":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20"
      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      case "low":
        return "text-green-400 bg-green-400/10 border-green-400/20"
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20"
    }
  }

  return (
    <div className="min-h-screen text-white antialiased relative overflow-hidden">
      {/* Orb Background Animation */}
      <div className="fixed inset-0 z-0">
        <Orb hoverIntensity={0.5} rotateOnHover={true} hue={0} forceHoverState={false} />
      </div>

      {/* Dark overlay for better text readability */}
      <div className="fixed inset-0 z-0 bg-black/20" />

      {/* Navigation */}
      <nav className="relative z-10 py-3 border-b border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center space-x-3 transition-all duration-300">
              <ArrowLeft className="h-4 w-4 text-white/40 group-hover:text-white/80 transition-colors" />
              <Image
                src="/verify-logo.png"
                alt="Apex Verify AI"
                width={28}
                height={28}
                className="opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <span className="text-lg font-medium text-white/90 group-hover:text-white transition-colors">
                Deepfake Memory
              </span>
            </Link>

            <div className="flex items-center space-x-3">
              <div className="w-1 h-1 bg-white/60 rounded-full" />
              <span className="text-xs text-white/40 font-light">{filteredRecords.length} Records</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-lg">
              Deepfake Memory
            </span>
          </h1>
          <p className="text-lg md:text-xl font-light text-white/50 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Your complete history of deepfake detection and media verification analysis
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-black/60 backdrop-blur-md border border-white/30 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Search files, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-colors"
              >
                <option value="all">All Results</option>
                <option value="authentic">Authentic</option>
                <option value="deepfake">Deepfake</option>
                <option value="suspicious">Suspicious</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-colors"
              >
                <option value="date">Sort by Date</option>
                <option value="confidence">Sort by Confidence</option>
                <option value="risk">Sort by Risk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Records Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <Card
              key={record.id}
              className="bg-black/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl hover:border-white/40 transition-all duration-300 group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-white font-light text-lg truncate">{record.fileName}</CardTitle>
                    <p className="text-white/40 text-sm mt-1">{record.uploadDate.toLocaleDateString()}</p>
                  </div>
                  <div className="ml-3">{getResultIcon(record.analysisResult)}</div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* File Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60 capitalize">{record.fileType}</span>
                  <span className="text-white/40">{record.fileSize} MB</span>
                </div>

                {/* Analysis Result */}
                <div className="flex items-center justify-between">
                  <Badge className={`${getResultColor(record.analysisResult)} border font-light`}>
                    {record.analysisResult}
                  </Badge>
                  <span className="text-white/60 text-sm">{record.confidence.toFixed(1)}%</span>
                </div>

                {/* Risk Level */}
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-sm">Risk Level</span>
                  <Badge className={`${getRiskColor(record.riskLevel)} border font-light capitalize`}>
                    {record.riskLevel}
                  </Badge>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {record.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60"
                    >
                      {tag}
                    </span>
                  ))}
                  {record.tags.length > 3 && (
                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/40">
                      +{record.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Notes */}
                {record.notes && (
                  <p className="text-white/50 text-sm italic border-l-2 border-white/10 pl-3">{record.notes}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 text-white/60 hover:text-white/80 hover:bg-white/5 rounded-lg"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white/60 hover:text-white/80 hover:bg-white/5 rounded-lg"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white/60 hover:text-white/80 hover:bg-white/5 rounded-lg"
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredRecords.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="h-6 w-6 text-white/40" />
            </div>
            <h3 className="text-xl font-light text-white/80 mb-2">No records found</h3>
            <p className="text-white/40">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
