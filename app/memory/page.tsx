"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Link as LinkIcon, Search, Upload, X, CheckCircle2, XCircle, Clock, Calendar } from "lucide-react"

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
    [handleFileChange]
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
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        {/* Refined Header */}
        <header className="mb-8 sm:mb-12">
          <Link 
            href="/" 
            className="mb-6 inline-flex items-center gap-2 text-xs sm:text-sm text-white/40 transition-all duration-200 hover:text-white/80 hover:gap-3"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Back</span>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white">Memory</h1>
            <p className="text-xs sm:text-sm text-white/30 font-light">Search verification records</p>
          </div>
        </header>

        {/* Main Container */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl transition-all duration-300 ${
            isDragging ? "border-white/20 bg-white/[0.04]" : ""
          }`}
        >
          {/* Search Section */}
          {!result && (
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="space-y-4 sm:space-y-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Input
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="Image URL or upload file"
                      className="h-12 sm:h-14 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 text-sm sm:text-base rounded-xl transition-all duration-200 focus:border-white/20 focus:bg-white/[0.05] pr-11"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isSearching) handleSearch()
                      }}
                    />
                    <LinkIcon className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 sm:h-14 sm:w-14 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 rounded-xl transition-all duration-200"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <Button
                      onClick={handleSearch}
                      disabled={isSearching || (!file && !linkUrl.trim())}
                      size="icon"
                      className="h-12 w-12 sm:h-14 sm:w-14 bg-white text-black hover:bg-white/90 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSearching ? (
                        <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                      ) : (
                        <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {file && (
                  <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition-all duration-200">
                    <span className="truncate text-sm text-white/60 font-light">{file.name}</span>
                    <button
                      onClick={() => handleFileChange(null)}
                      className="text-white/30 hover:text-white/60 transition-colors duration-200 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-white/20 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
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

          {/* Loading State */}
          {isSearching && (
            <div className="flex flex-col items-center justify-center py-20 sm:py-24">
              <div className="mb-5 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />
              <p className="text-sm text-white/30 font-light tracking-wide">Searching memory</p>
            </div>
          )}

          {/* Results */}
          {!isSearching && result && (
            <div className="p-6 sm:p-8 lg:p-10">
              {result.found ? (
                <div className="space-y-6 sm:space-y-8">
                  {/* Verdict Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {verdictLabel === "Authentic" ? (
                          <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-white/80" />
                        ) : (
                          <XCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white/80" />
                        )}
                        <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">{verdictLabel}</h2>
                      </div>
                      {confidenceDisplay && (
                        <div className="text-right">
                          <p className="text-xs text-white/30 font-light mb-1">Confidence</p>
                          <p className="text-lg sm:text-xl font-light text-white/90">{confidenceDisplay}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Heatmap */}
                  {result.record.result?.heatmap_base64 && (
                    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
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

                  {/* Metadata - Collapsed by default, expandable */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-white/40 hover:text-white/60 transition-colors duration-200 font-light tracking-wide">
                      View details
                    </summary>
                    <div className="mt-5 space-y-5 pt-5 border-t border-white/[0.08]">
                      <div>
                        <p className="mb-2 text-xs text-white/25 font-light tracking-wider uppercase">SHA-256</p>
                        <p className="break-all font-mono text-xs sm:text-sm text-white/50 leading-relaxed">{result.record.sha256}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="flex items-start gap-3">
                          <Calendar className="h-4 w-4 text-white/30 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-white/25 font-light tracking-wider uppercase mb-1">First verified</p>
                            <p className="text-sm text-white/60 font-light">{new Date(result.record.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="h-4 w-4 text-white/30 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-white/25 font-light tracking-wider uppercase mb-1">Last seen</p>
                            <p className="text-sm text-white/60 font-light">{new Date(result.record.last_seen).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      {result.record.metadata?.source_url && (
                        <div>
                          <p className="mb-2 text-xs text-white/25 font-light tracking-wider uppercase">Source</p>
                          <a
                            href={String(result.record.metadata.source_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-sm text-white/50 hover:text-white/70 underline transition-colors duration-200 font-light"
                          >
                            {String(result.record.metadata.source_url)}
                          </a>
                        </div>
                      )}
                    </div>
                  </details>

                  <Button 
                    onClick={resetState} 
                    className="w-full h-12 sm:h-14 bg-white text-black hover:bg-white/90 rounded-xl transition-all duration-200 font-light text-sm sm:text-base"
                  >
                    New search
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 py-8 sm:py-12">
                  <div className="text-center space-y-2">
                    <XCircle className="h-12 w-12 sm:h-14 sm:w-14 text-white/30 mx-auto mb-2" />
                    <p className="text-lg sm:text-xl font-light text-white/90">Not found</p>
                    <p className="text-sm text-white/40 font-light">This media hasn't been verified yet.</p>
                  </div>
                  <Button 
                    onClick={resetState} 
                    className="w-full h-12 sm:h-14 bg-white text-black hover:bg-white/90 rounded-xl transition-all duration-200 font-light text-sm sm:text-base"
                  >
                    Try again
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isSearching && !result && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20">
              <div className="mb-5 rounded-full border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
                <Search className="h-8 w-8 sm:h-10 sm:w-10 text-white/20" />
              </div>
              <p className="text-sm sm:text-base text-white/30 font-light tracking-wide">Enter URL or upload image to search</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
