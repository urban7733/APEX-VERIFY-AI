"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Link as LinkIcon, RefreshCcw, Search, Upload } from "lucide-react"

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
        return "AI-Generated Content Detected"
      case "authentic":
        return "Authentic Media"
      default:
        return verdict.replace(/_/g, " ").toUpperCase()
    }
  }, [result])

  const handleFileChange = useCallback((selected: File | null) => {
    if (!selected) {
      setFile(null)
      return
    }

    if (selected.size > 100 * 1024 * 1024) {
      setError("File size must be less than 100MB")
      return
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(selected.type)) {
      setError("Only image formats (JPEG, PNG, GIF, WEBP) are supported for memory lookup")
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
      setError("Provide a media file or a direct media URL to search")
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const formData = new FormData()
      if (file) {
        formData.append("file", file)
      }
      if (linkUrl.trim()) {
        formData.append("link", linkUrl.trim())
      }

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
        throw new Error(payload?.error || `Lookup failed with status ${response.status}`)
      }

      const payload = (await response.json()) as LookupResponse
      setResult(payload)
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Lookup timed out. Please try again.")
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Unexpected error during lookup")
      }
      setResult(null)
    } finally {
      setIsSearching(false)
    }
  }, [file, linkUrl])

  const confidenceDisplay = useMemo(() => {
    if (!result || !result.found) return null
    const confidence = Math.round(result.record.summary.confidence * 100)
    return `${confidence}% confidence`
  }, [result])

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to home</span>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Verification Memory</h1>
            <p className="text-sm text-white/60">
              Check if an asset has already been analyzed by comparing cryptographic fingerprints.
            </p>
          </div>
        </header>

        {/* Search Form */}
        <section
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors sm:p-8 ${
            isDragging ? "border-white/30" : ""
          }`}
        >
          <div className="space-y-6">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.1em] text-white/40">Lookup Options</p>
              <div className="space-y-3">
                <label className="block text-sm text-white/70">Media URL</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Input
                      value={linkUrl}
                      onChange={(event) => setLinkUrl(event.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pr-10"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isSearching) {
                          handleSearch()
                        }
                      }}
                    />
                    <LinkIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </div>
            </div>

            {file && (
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2.5">
                <span className="truncate text-sm text-white/70">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-white/60 hover:text-white"
                  onClick={() => handleFileChange(null)}
                >
                  Remove
                </Button>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white/80">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-white/40">Drag & drop an image or upload up to 100MB</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={resetState} disabled={isSearching}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || (!file && !linkUrl.trim())}
                  className="min-w-[140px]"
                >
                  {isSearching ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(event) => handleFileChange(event.target.files ? event.target.files[0] : null)}
            />
          </div>
        </section>

        {/* Results */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
          {isSearching && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              <p className="text-sm text-white/60">Scanning verification memory...</p>
            </div>
          )}

          {!isSearching && !result && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10">
                <Search className="h-6 w-6 text-white/40" />
              </div>
              <p className="mb-2 text-sm font-medium text-white/70">Awaiting query</p>
              <p className="text-xs text-white/50">Provide a media URL or upload an image to check verification history.</p>
            </div>
          )}

          {!isSearching && result && (
            <div className="space-y-6">
              {result.found ? (
                <>
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-white/40">Verification Result</p>
                    <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-base font-semibold text-white">{verdictLabel}</p>
                      {confidenceDisplay && <p className="mt-1 text-sm text-white/60">{confidenceDisplay}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.1em] text-white/40">SHA-256 Hash</p>
                      <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                        <p className="break-all font-mono text-xs text-white/70">{result.record.sha256}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                        <p className="mb-1 text-xs uppercase tracking-[0.1em] text-white/40">First Verified</p>
                        <p className="text-sm text-white/70">{new Date(result.record.created_at).toLocaleString()}</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                        <p className="mb-1 text-xs uppercase tracking-[0.1em] text-white/40">Last Seen</p>
                        <p className="text-sm text-white/70">{new Date(result.record.last_seen).toLocaleString()}</p>
                      </div>
                    </div>

                    {result.record.metadata?.source_url && (
                      <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                        <p className="mb-1 text-xs uppercase tracking-[0.1em] text-white/40">Source URL</p>
                        <a
                          href={String(result.record.metadata.source_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-sm text-white/70 underline transition-colors hover:text-white"
                        >
                          {String(result.record.metadata.source_url)}
                        </a>
                      </div>
                    )}
                  </div>

                  {result.record.result?.heatmap_base64 && (
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-[0.1em] text-white/40">Heatmap Preview</p>
                      <div className="overflow-hidden rounded-lg border border-white/10">
                        <Image
                          src={`data:image/jpeg;base64,${result.record.result.heatmap_base64 as string}`}
                          alt="Verification heatmap"
                          width={700}
                          height={700}
                          className="h-auto w-full"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-white/10 bg-black/40 p-6 text-center">
                    <p className="mb-2 text-base font-semibold text-white">No verification found</p>
                    <p className="text-sm text-white/60">This media has not been authenticated through Apex Verify AI yet.</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/40 p-4">
                    <p className="mb-2 text-xs uppercase tracking-[0.1em] text-white/40">Next Steps</p>
                    <p className="text-sm text-white/60">
                      Use the main verification flow to analyze this asset. Once verified, results will appear in memory immediately.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Info Footer */}
        <p className="text-center text-xs text-white/40">
          All lookup requests are hashed and compared securely. We never persist user-provided media on this page.
        </p>
      </main>
    </div>
  )
}
