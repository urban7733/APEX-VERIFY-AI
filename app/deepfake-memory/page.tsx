"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Upload, Link as LinkIcon, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface MemoryResult {
  found: boolean
  score?: number
  verifiedDate?: string
  originalUrl?: string
}

export default function DeepfakeMemoryPage() {
  const [inputValue, setInputValue] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<MemoryResult | null>(null)

  const handleFileSelect = (file: File) => {
    setInputValue(file.name)
    setResult(null)
  }

  const handleCheck = async () => {
    if (!inputValue.trim()) return
    setIsChecking(true)

    // TODO: replace with real API call
    await new Promise((r) => setTimeout(r, 1200))

    const mock: MemoryResult = Math.random() > 0.5
      ? {
          found: true,
          score: Math.floor(Math.random() * 100),
          verifiedDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 14).toLocaleDateString(),
          originalUrl: inputValue.startsWith("http") ? inputValue : undefined,
        }
      : { found: false }

    setResult(mock)
    setIsChecking(false)
  }

  return (
    <div className="min-h-screen text-white antialiased relative bg-black">
      <nav className="relative z-10 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-3 transition-all duration-300">
              <ArrowLeft className="h-4 w-4 text-white/40 group-hover:text-white/80 transition-colors" />
              <span className="text-white/60 group-hover:text-white/90 transition-colors text-sm sm:text-base font-black tracking-tighter premium-heading">
                BACK TO HOME
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center space-y-6 sm:space-y-8 mb-6 sm:mb-10">
          <h1 className="text-3xl xs:text-4xl sm:text-6xl font-black text-white leading-none tracking-tighter premium-heading">
            DEEPFAKE MEMORY
          </h1>
          <p className="text-white/60 text-base sm:text-lg font-black leading-tight tracking-tighter">
            Check if a link or file was already verified in our system
          </p>
        </div>

        <Card className="mx-auto max-w-xl">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-white/80 text-base">Enter a URL or upload a file</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Paste URL here..."
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  setResult(null)
                }}
                className="w-full h-12 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 text-sm sm:text-base"
                aria-label="URL"
              />
            </div>

            <div className="glass-divider" />

            <div className="relative">
              <input
                id="memory-file"
                type="file"
                className="hidden"
                accept="image/*,video/*,audio/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
              <label
                htmlFor="memory-file"
                className="flex items-center justify-center w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-sm"
              >
                <Upload className="w-4 h-4 mr-2" /> Or upload a file
              </label>
            </div>

            <div className="pt-1">
              <Button
                onClick={handleCheck}
                disabled={!inputValue.trim() || isChecking}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl h-12 font-black tracking-tighter premium-heading transition-all duration-300"
                aria-live="polite"
              >
                {isChecking ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    Checking Memory
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Check Memory
                  </>
                )}
              </Button>
            </div>

            {isChecking && (
              <div className="mt-3 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-1/3 animate-shimmer" />
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <div className="mt-8 sm:mt-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Overview card */}
              <Card className="mx-auto w-full max-w-xl">
                <CardContent className="p-6 space-y-6">
                  {result.found ? (
                    <div className="text-center space-y-3">
                      <div className="flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-400" />
                      </div>
                      <h3 className="text-xl font-light text-white">Content Found</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="glass-minimal rounded-lg p-4 border border-white/10">
                          <div className="text-soft">Verification Score</div>
                          <div className="text-white text-2xl font-black">{result.score}/100</div>
                        </div>
                        <div className="glass-minimal rounded-lg p-4 border border-white/10">
                          <div className="text-soft">Verified Date</div>
                          <div className="text-white text-lg font-medium">{result.verifiedDate}</div>
                        </div>
                        <div className="glass-minimal rounded-lg p-4 border border-white/10">
                          <div className="text-soft">Original URL</div>
                          <div className="text-white/90 text-xs break-all">{result.originalUrl || "—"}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center">
                        <XCircle className="h-10 w-10 text-red-400" />
                      </div>
                      <h3 className="text-xl font-light text-white">Not Found</h3>
                      <p className="text-softer">This content hasn't been verified yet.</p>
                      <Link
                        href="/verify"
                        className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition"
                      >
                        Go to Verification
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right: Spatial preview placeholder (shows when URL is image-like) */}
              {result.found && result.originalUrl && result.originalUrl.match(/\.(jpg|jpeg|png|webp)$/i) && (
                <Card className="mx-auto w-full max-w-xl">
                  <CardContent className="p-6">
                    <div className="text-white/70 text-sm mb-3">Spatial Preview</div>
                    <div className="relative aspect-video bg-black/40 border border-white/10 rounded-xl overflow-hidden">
                      {/* Placeholder glass layers for minimal look */}
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-2">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className="bg-white/5 border border-white/10 rounded-md" />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/50 text-xs">Zoomed region will appear here</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
