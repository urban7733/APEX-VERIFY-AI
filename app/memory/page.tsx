"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Link as LinkIcon, Search, Upload, X } from "lucide-react"

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
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Minimal Header */}
        <header className="mb-12">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white/80">
            <ChevronLeft className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">Verification Memory</h1>
        </header>

        {/* Single Card - Search & Results Combined */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`rounded-xl border border-white/10 bg-white/5 p-6 transition-colors sm:p-8 ${
            isDragging ? "border-white/20" : ""
          }`}
        >
          {/* Search Input */}
          {!result && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                      value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Paste image URL or upload file"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pr-10"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isSearching) handleSearch()
                    }}
                  />
                  <LinkIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                    </Button>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || (!file && !linkUrl.trim())}
                  size="icon"
                >
                  {isSearching ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {file && (
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <span className="truncate text-sm text-white/70">{file.name}</span>
                  <button
                    onClick={() => handleFileChange(null)}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white/80">
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
            )}

          {/* Loading State */}
            {isSearching && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              <p className="text-sm text-white/50">Searching...</p>
              </div>
            )}

          {/* Results */}
          {!isSearching && result && (
              <div className="space-y-6">
                {result.found ? (
                <>
                  {/* Verdict */}
                    <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <p className="text-lg font-medium text-white">{verdictLabel}</p>
                      {confidenceDisplay && <p className="text-sm text-white/50">{confidenceDisplay}</p>}
                    </div>
                      </div>

                  {/* Heatmap */}
                  {result.record.result?.heatmap_base64 && (
                    <div className="overflow-hidden rounded-lg border border-white/10">
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
                    <summary className="cursor-pointer text-sm text-white/50 hover:text-white/70 transition-colors">
                      View details
                    </summary>
                    <div className="mt-4 space-y-3 pt-4 border-t border-white/10">
                      <div>
                        <p className="mb-1 text-xs text-white/40">SHA-256</p>
                        <p className="break-all font-mono text-xs text-white/60">{result.record.sha256}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-white/40 mb-1">First verified</p>
                          <p className="text-white/60">{new Date(result.record.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40 mb-1">Last seen</p>
                          <p className="text-white/60">{new Date(result.record.last_seen).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {result.record.metadata?.source_url && (
                        <div>
                          <p className="mb-1 text-xs text-white/40">Source</p>
                          <a
                            href={String(result.record.metadata.source_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-sm text-white/60 underline hover:text-white/80"
                          >
                            {String(result.record.metadata.source_url)}
                          </a>
                        </div>
                      )}
                    </div>
                  </details>

                  <Button variant="outline" onClick={resetState} className="w-full border-white/10 bg-white/5 hover:bg-white/10">
                    New search
                  </Button>
                </>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="text-center">
                    <p className="mb-2 text-base font-medium text-white">Not found</p>
                    <p className="text-sm text-white/50">This media hasn't been verified yet.</p>
                  </div>
                  <Button variant="outline" onClick={resetState} className="w-full border-white/10 bg-white/5 hover:bg-white/10">
                    Try again
                  </Button>
                  </div>
                )}
              </div>
            )}

          {/* Empty State */}
          {!isSearching && !result && (
            <div className="flex flex-col items-center justify-center py-12">
              <Search className="mb-4 h-8 w-8 text-white/30" />
              <p className="text-sm text-white/50">Enter URL or upload image to search</p>
            </div>
          )}
        </div>
        </main>
    </div>
  )
}
