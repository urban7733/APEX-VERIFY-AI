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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <main className="relative mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        {/* Dynamic Header */}
        <header className="mb-10 sm:mb-16">
          <Link 
            href="/" 
            className="mb-8 inline-flex items-center gap-2 text-xs sm:text-sm text-white/30 transition-all duration-300 hover:text-white/90 hover:gap-3 group"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="font-light">Back</span>
          </Link>
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extralight tracking-[-0.04em] text-white leading-[0.9]">
              Memory
            </h1>
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-white/20" />
              <p className="text-xs sm:text-sm text-white/25 font-light tracking-wider uppercase">Verification Archive</p>
            </div>
          </div>
        </header>

        {/* Main Container */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-2xl transition-all duration-500 shadow-[0_0_0_1px_rgba(255,255,255,0.05)] ${
            isDragging ? "border-white/30 bg-white/[0.06] scale-[1.01] shadow-[0_8px_32px_rgba(255,255,255,0.1)]" : "hover:border-white/[0.1] hover:shadow-[0_8px_32px_rgba(255,255,255,0.05)]"
          }`}
        >
          {/* Search Section */}
          {!result && (
            <div className="p-8 sm:p-10 lg:p-12">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 group">
                    <Input
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="Paste image URL or upload file"
                      className="h-14 sm:h-16 bg-white/[0.04] border-white/[0.06] text-white placeholder:text-white/15 text-base sm:text-lg rounded-2xl transition-all duration-300 focus:border-white/25 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(255,255,255,0.05)] pr-12 font-light"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isSearching) handleSearch()
                      }}
                    />
                    <LinkIcon className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/15 transition-colors duration-300 group-focus-within:text-white/30" />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-14 w-14 sm:h-16 sm:w-16 border-white/[0.06] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
                    </Button>
                    <Button
                      onClick={handleSearch}
                      disabled={isSearching || (!file && !linkUrl.trim())}
                      size="icon"
                      className="h-14 w-14 sm:h-16 sm:w-16 bg-white text-black hover:bg-white/95 rounded-2xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-[0_4px_16px_rgba(255,255,255,0.2)]"
                    >
                      {isSearching ? (
                        <div className="h-5 w-5 sm:h-6 sm:w-6 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                      ) : (
                        <Search className="h-5 w-5 sm:h-6 sm:w-6" />
                      )}
                    </Button>
                  </div>
                </div>

                {file && (
                  <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-4 transition-all duration-300 group/item">
                    <span className="truncate text-sm sm:text-base text-white/50 font-light">{file.name}</span>
                    <button
                      onClick={() => handleFileChange(null)}
                      className="text-white/20 hover:text-white/70 transition-all duration-300 p-2 rounded-lg hover:bg-white/[0.05] group-hover/item:scale-110"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-white/20 bg-white/[0.04] px-5 py-4 text-sm sm:text-base text-white/70 backdrop-blur-sm">
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
            <div className="flex flex-col items-center justify-center py-24 sm:py-32">
              <div className="relative mb-8">
                <div className="h-12 w-12 sm:h-14 sm:w-14 animate-spin rounded-full border-2 border-white/10 border-t-white" />
                <div className="absolute inset-0 h-12 w-12 sm:h-14 sm:w-14 animate-spin rounded-full border-2 border-transparent border-r-white/20" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <p className="text-sm sm:text-base text-white/25 font-light tracking-wider uppercase">Searching Archive</p>
            </div>
          )}

          {/* Results */}
          {!isSearching && result && (
            <div className="p-8 sm:p-10 lg:p-12">
              {result.found ? (
                <div className="space-y-8 sm:space-y-10">
                  {/* Verdict Header */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {verdictLabel === "Authentic" ? (
                            <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-white/90" />
                          ) : (
                            <XCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white/90" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-white tracking-tight leading-[0.95] mb-2">
                            {verdictLabel}
                          </h2>
                          <div className="h-px w-16 bg-white/20" />
                        </div>
                      </div>
                      {confidenceDisplay && (
                        <div className="text-right sm:text-left sm:min-w-[120px]">
                          <p className="text-xs text-white/20 font-light tracking-wider uppercase mb-2">Confidence</p>
                          <p className="text-2xl sm:text-3xl font-extralight text-white/95 tracking-tight">{confidenceDisplay}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Heatmap */}
                  {result.record.result?.heatmap_base64 && (
                    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.05)] group">
                      <Image
                        src={`data:image/jpeg;base64,${result.record.result.heatmap_base64 as string}`}
                        alt="Heatmap"
                        width={700}
                        height={700}
                        className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.02]"
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Metadata - Collapsed by default, expandable */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm sm:text-base text-white/30 hover:text-white/70 transition-all duration-300 font-light tracking-wider uppercase py-3 border-t border-white/[0.06] flex items-center justify-between group-hover:border-white/[0.12]">
                      <span>View Details</span>
                      <div className="h-5 w-5 rounded-full border border-white/[0.1] bg-white/[0.02] flex items-center justify-center transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/[0.04]">
                        <ChevronLeft className="h-3 w-3 transition-transform duration-300 group-open:rotate-90" />
                      </div>
                    </summary>
                    <div className="mt-6 space-y-6 pt-6 border-t border-white/[0.06]">
                      <div>
                        <p className="mb-3 text-xs text-white/20 font-light tracking-wider uppercase">SHA-256</p>
                        <p className="break-all font-mono text-xs sm:text-sm text-white/40 leading-relaxed bg-white/[0.02] rounded-xl p-4 border border-white/[0.05]">{result.record.sha256}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.03] transition-all duration-300">
                          <Calendar className="h-5 w-5 text-white/25 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-white/20 font-light tracking-wider uppercase mb-2">First verified</p>
                            <p className="text-sm sm:text-base text-white/60 font-light">{new Date(result.record.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.03] transition-all duration-300">
                          <Clock className="h-5 w-5 text-white/25 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-white/20 font-light tracking-wider uppercase mb-2">Last seen</p>
                            <p className="text-sm sm:text-base text-white/60 font-light">{new Date(result.record.last_seen).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      {result.record.metadata?.source_url && (
                        <div className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                          <p className="mb-3 text-xs text-white/20 font-light tracking-wider uppercase">Source</p>
                          <a
                            href={String(result.record.metadata.source_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-sm sm:text-base text-white/50 hover:text-white/80 underline transition-colors duration-300 font-light"
                          >
                            {String(result.record.metadata.source_url)}
                          </a>
                        </div>
                      )}
                    </div>
                  </details>

                  <Button 
                    onClick={resetState} 
                    className="w-full h-14 sm:h-16 bg-white text-black hover:bg-white/95 rounded-2xl transition-all duration-300 font-light text-base sm:text-lg hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_16px_rgba(255,255,255,0.2)]"
                  >
                    New Search
                  </Button>
                </div>
              ) : (
                <div className="space-y-8 py-12 sm:py-16">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-white/[0.08] bg-white/[0.02] mb-4">
                      <XCircle className="h-10 w-10 sm:h-12 sm:w-12 text-white/25" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-extralight text-white/90 mb-2 tracking-tight">Not Found</p>
                      <p className="text-sm sm:text-base text-white/30 font-light">This media hasn't been verified yet.</p>
                    </div>
                  </div>
                  <Button 
                    onClick={resetState} 
                    className="w-full h-14 sm:h-16 bg-white text-black hover:bg-white/95 rounded-2xl transition-all duration-300 font-light text-base sm:text-lg hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_16px_rgba(255,255,255,0.2)]"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isSearching && !result && (
            <div className="flex flex-col items-center justify-center py-20 sm:py-28">
              <div className="mb-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
                <Search className="h-10 w-10 sm:h-12 sm:w-12 text-white/15" />
              </div>
              <p className="text-sm sm:text-base text-white/25 font-light tracking-wider uppercase">Enter URL or upload image to search</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
