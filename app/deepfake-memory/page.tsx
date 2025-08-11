"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Search, Upload, LinkIcon, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Orb from "@/components/Orb"

interface VerificationResult {
  found: boolean
  score?: number
  verifiedDate?: Date
  originalUrl?: string
}

export default function DeepfakeMemoryPage() {
  const [inputValue, setInputValue] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)

  const handleCheck = async () => {
    if (!inputValue.trim()) return

    setIsChecking(true)

    // Simulate API call to check if content was previously verified
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock result - in real implementation, this would check your database
    const mockResult: VerificationResult =
      Math.random() > 0.5
        ? {
            found: true,
            score: Math.floor(Math.random() * 100) + 1,
            verifiedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            originalUrl: inputValue.startsWith("http") ? inputValue : undefined,
          }
        : { found: false }

    setResult(mockResult)
    setIsChecking(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setInputValue(file.name)
      setResult(null)
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-lg">
              Deepfake Memory
            </span>
          </h1>
          <p className="text-lg md:text-xl font-light text-white/50 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Check if content has been previously verified by our system
          </p>
        </div>

        {/* Input Card */}
        <Card className="bg-black/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-white font-light text-xl text-center">Enter URL or Upload File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* URL Input */}
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Paste URL or file name here..."
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  setResult(null)
                }}
                className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {/* File Upload */}
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,video/*,audio/*"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full py-4 bg-white/5 border border-white/10 border-dashed rounded-xl text-white/60 hover:text-white/80 hover:bg-white/10 transition-all cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                Or upload a file
              </label>
            </div>

            {/* Check Button */}
            <Button
              onClick={handleCheck}
              disabled={!inputValue.trim() || isChecking}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-all disabled:opacity-50"
            >
              {isChecking ? (
                <>
                  <Search className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Check Verification Status
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="bg-black/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl">
            <CardContent className="p-8">
              {result.found ? (
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-light text-white mb-2">Content Found</h3>
                    <p className="text-white/60">This content was previously verified by our system</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Verification Score:</span>
                      <Badge className="text-lg px-4 py-2 bg-green-400/10 text-green-400 border-green-400/20">
                        {result.score}/100
                      </Badge>
                    </div>

                    {result.verifiedDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Verified Date:</span>
                        <span className="text-white/80">{result.verifiedDate.toLocaleDateString()}</span>
                      </div>
                    )}

                    {result.originalUrl && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Original URL:</span>
                        <span className="text-white/80 truncate max-w-xs">{result.originalUrl}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center">
                    <XCircle className="h-12 w-12 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-light text-white mb-2">Content Not Found</h3>
                    <p className="text-white/60">This content has not been verified by our system yet</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <p className="text-white/50 text-sm">
                      Would you like to verify this content now?{" "}
                      <Link href="/verify" className="text-white/80 hover:text-white underline">
                        Go to Verification
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
