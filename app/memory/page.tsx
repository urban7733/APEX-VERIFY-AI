"use client"

import type React from "react"

import { useCallback, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Upload, X, XCircle, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MemoryRecordSummary {
  verdict: string
  confidence: number
  method?: string
  processing_time?: number
}

interface MemoryRecord {
  sha256: string
  created_at: string
  last_seen: string
  metadata: Record<string, unknown>
  summary: MemoryRecordSummary
  result: Record<string, unknown>
}

interface LookupSuccess {
  found: true
  sha256: string
  sourceUrl?: string
  record: MemoryRecord
}

interface LookupMiss {
  found: false
  sha256: string
  sourceUrl?: string
}

type LookupResponse = LookupSuccess | LookupMiss

export default function MemoryPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [linkUrl, setLinkUrl] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<LookupResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const verdictLabel = useMemo(() => {
    if (!result || !result.found) return null
    const verdict = result.record.summary.verdict
    switch (verdict) {
      case "ai_generated":
        return "AI-Generated"
      case "authentic":
        return "Authentic"
      default:
        return verdict.replace(/_/g, " ")
    }
  }, [result])

  const handleFileChange = useCallback((selected: File | null) => {
    if (!selected) {
      setFile(null)
      return
    }
    if (selected.size > 100 * 1024 * 1024) {
      setError("File must be less than 100MB")
      return
    }
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(selected.type)) {
      setError("Only image formats supported")
      return
    }
    setError(null)
    setFile(selected)
  }, [])

  const resetState = useCallback(() => {
    setFile(null)
    setLinkUrl("")
    setResult(null)
    setError(null)
    setIsDragging(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const handleDrag = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.type === "dragenter" || event.type === "dragover") {
      setIsDragging(true)
    } else if (event.type === "dragleave") {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragging(false)
      if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        handleFileChange(event.dataTransfer.files[0])
      }
    },
    [handleFileChange],
  )

  const handleSearch = useCallback(async () => {
    if (!file && !linkUrl.trim()) {
      setError("Provide a file or URL")
      return
    }
    setIsSearching(true)
    setError(null)
    try {
      const formData = new FormData()
      if (file) formData.append("file", file)
      if (linkUrl.trim()) formData.append("link", linkUrl.trim())
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 20000)
      const response = await fetch("/api/memory/lookup", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error || `Failed: ${response.status}`)
      }
      const payload = (await response.json()) as LookupResponse
      setResult(payload)
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out")
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Unexpected error")
      }
      setResult(null)
    } finally {
      setIsSearching(false)
    }
  }, [file, linkUrl])

  const confidenceDisplay = useMemo(() => {
    if (!result || !result.found) return null
    return `${Math.round(result.record.summary.confidence * 100)}%`
  }, [result])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute top-6 right-6 z-30">
        <Link href="/" className="inline-flex">
          <Button className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl text-white px-5 py-2 rounded-full transition-all duration-300">
            Home
          </Button>
        </Link>
      </div>

      <main className="relative mx-auto w-full max-w-5xl px-6 sm:px-8 py-20 sm:py-32">
        <header className="mb-16 sm:mb-24 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.04em] text-white/95">Memory</h1>
            <p className="text-sm sm:text-base text-white/30 font-light tracking-wide">
              Search our verification archive
            </p>
          </div>
        </header>

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-[3rem] border bg-white/[0.02] backdrop-blur-2xl transition-all duration-500 ${
            isDragging ? "border-white/20 bg-white/[0.04] scale-[1.01]" : "border-white/[0.05] hover:border-white/[0.1]"
          }`}
        >
          {/* Search Section */}
          {!result && (
            <div className="p-8 sm:p-12 lg:p-16">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Input
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="Paste image URL"
                      className="h-14 sm:h-16 bg-white/[0.02] border-white/[0.05] text-white placeholder:text-white/20 text-base rounded-2xl transition-all duration-300 focus:border-white/20 focus:bg-white/[0.04] font-light"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isSearching) handleSearch()
                      }}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-14 w-14 sm:h-16 sm:w-16 border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 rounded-2xl transition-all duration-300"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-6 w-6 text-white/40" />
                    </Button>
                    <Button
                      onClick={handleSearch}
                      disabled={isSearching || (!file && !linkUrl.trim())}
                      size="icon"
                      className="h-14 w-14 sm:h-16 sm:w-16 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-xl"
                    >
                      {isSearching ? (
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      ) : (
                        <Search className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                </div>

                {file && (
                  <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.02] px-5 py-4 transition-all duration-300">
                    <span className="truncate text-sm sm:text-base text-white/50 font-light">{file.name}</span>
                    <button
                      onClick={() => handleFileChange(null)}
                      className="text-white/30 hover:text-white/70 transition-all duration-300 p-2 rounded-lg hover:bg-white/[0.05]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-sm sm:text-base text-white/60 backdrop-blur-sm">
                    {error}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                />
              </div>
            </div>
          )}

          {isSearching && (
            <div className="flex flex-col items-center justify-center py-24 sm:py-32">
              <div className="w-24 h-24 border-[2px] border-white/[0.05] border-t-white/50 rounded-full animate-spin mb-8" />
              <p className="text-[10px] text-white/30 font-light tracking-[0.4em] uppercase">Searching</p>
            </div>
          )}

          {/* Results */}
          {!isSearching && result && (
            <div className="p-8 sm:p-12 lg:p-16">
              {result.found ? (
                <div className="space-y-10">
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center">
                      <div className="relative px-8 py-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl">
                        <div className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                          {verdictLabel}
                        </div>
                      </div>
                    </div>

                    {confidenceDisplay && (
                      <div className="space-y-3 max-w-md mx-auto">
                        <div className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Confidence</div>
                        <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 bg-gradient-to-r from-white/80 to-white/60"
                            style={{ width: confidenceDisplay }}
                          />
                        </div>
                        <div className="text-2xl font-semibold text-white/90 tracking-tight">{confidenceDisplay}</div>
                      </div>
                    )}
                  </div>

                  {/* Heatmap */}
                  {result.record.result?.heatmap_base64 && (
                    <div className="overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02]">
                      <Image
                        src={`data:image/jpeg;base64,${result.record.result.heatmap_base64 as string}`}
                        alt="Heatmap"
                        width={700}
                        height={700}
                        className="h-auto w-full"
                        unoptimized
                      />
                    </div>
                  )}

                  <details className="group border-t border-white/[0.05] pt-8">
                    <summary className="cursor-pointer text-[10px] text-white/30 hover:text-white/60 transition-all duration-300 font-light tracking-[0.3em] uppercase py-3 flex items-center justify-between">
                      <span>Technical Details</span>
                      <ChevronDown className="h-4 w-4 transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <div className="mt-6 space-y-6">
                      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6">
                        <p className="mb-3 text-[10px] text-white/30 font-light tracking-[0.3em] uppercase">SHA-256</p>
                        <p className="break-all font-mono text-xs text-white/50 leading-relaxed">
                          {result.record.sha256}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6">
                          <p className="text-[10px] text-white/30 font-light tracking-[0.3em] uppercase mb-3">
                            First Verified
                          </p>
                          <p className="text-sm text-white/60 font-light">
                            {new Date(result.record.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6">
                          <p className="text-[10px] text-white/30 font-light tracking-[0.3em] uppercase mb-3">
                            Last Seen
                          </p>
                          <p className="text-sm text-white/60 font-light">
                            {new Date(result.record.last_seen).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {result.record.metadata?.source_url && (
                        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6">
                          <p className="mb-3 text-[10px] text-white/30 font-light tracking-[0.3em] uppercase">
                            Source URL
                          </p>
                          <a
                            href={String(result.record.metadata.source_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-sm text-white/50 hover:text-white/80 underline transition-colors duration-300 font-light"
                          >
                            {String(result.record.metadata.source_url)}
                          </a>
                        </div>
                      )}
                    </div>
                  </details>

                  <Button
                    onClick={resetState}
                    className="w-full h-14 sm:h-16 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl transition-all duration-300 font-medium text-base backdrop-blur-xl"
                  >
                    New Search
                  </Button>
                </div>
              ) : (
                <div className="space-y-8 py-16 text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border border-white/[0.05] bg-white/[0.02] mb-4">
                    <XCircle className="h-12 w-12 text-white/30" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-white/90 mb-2 tracking-tight">Not Found</p>
                    <p className="text-sm text-white/40 font-light">This media hasn't been verified yet.</p>
                  </div>
                  <Button
                    onClick={resetState}
                    className="w-full h-14 sm:h-16 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl transition-all duration-300 font-medium text-base backdrop-blur-xl"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}

          {!isSearching && !result && (
            <div className="flex flex-col items-center justify-center py-24 sm:py-32">
              <div className="w-20 h-20 rounded-full border border-white/[0.05] flex items-center justify-center mb-8">
                <Search className="h-10 w-10 text-white/20" />
              </div>
              <p className="text-[10px] text-white/30 font-light tracking-[0.3em] uppercase">Awaiting Input</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
