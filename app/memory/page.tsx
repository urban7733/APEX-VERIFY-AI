"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Upload, Link as LinkIcon, History } from "lucide-react"

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
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

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
    <div className="min-h-screen bg-[#000000] text-white antialiased relative">
      <div className="px-6 sm:px-10 lg:px-16 py-10 flex flex-col gap-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-5">
            <div className="relative flex items-center gap-4">
              <Image
                src="/images/design-mode/ChatGPT%20Image%20Oct%2026%2C%202025%20at%2003_34_35%20AM.png"
                alt="Apex Verify Orb"
                width={72}
                height={72}
                className="w-14 h-14 sm:w-16 sm:h-16 animate-float"
                priority
              />
              <Image
                src="/images/design-mode/Image%2028.10.25%20at%2002.50.png"
                alt="Apex Verify AI"
                width={220}
                height={80}
                className="w-[180px] sm:w-[220px] h-auto opacity-90"
                priority
              />
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="border border-white/10 bg-white/5 hover:bg-white/10">
                Home
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="border border-white/10 bg-white/5 hover:bg-white/10"
              onClick={resetState}
            >
              Reset
            </Button>
          </nav>
        </header>

        <main className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14 items-start">
          <section className="space-y-8 bg-white/5 border border-white/10 rounded-[32px] p-8 sm:p-10 backdrop-blur-xl">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-white/40">
                <History className="w-4 h-4" /> Memory Lookup
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
                Verify whether a media asset has already been authenticated by Apex Verify AI.
              </h1>
              <p className="text-white/60 leading-relaxed max-w-2xl">
                Upload the media or provide a direct link. We instantly compare cryptographic fingerprints against our
                secured verification memory. If we have analyzed the asset before, you&apos;ll receive the original verdict
                and metadata.
              </p>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="space-y-4">
                <label className="block text-xs uppercase tracking-[0.35em] text-white/40">Media URL</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Input
                      value={linkUrl}
                      onChange={(event) => setLinkUrl(event.target.value)}
                      placeholder="https://..."
                      className="bg-white/10 border-white/10 text-white placeholder:text-white/30 pr-12"
                    />
                    <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                  </div>
                  <Button
                    variant="secondary"
                    className="bg-white text-black hover:bg-white/90"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" /> Upload Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={(event) => handleFileChange(event.target.files ? event.target.files[0] : null)}
                  />
                </div>
                {file && (
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                    <span className="truncate max-w-[70%]">{file.name}</span>
                    <Button variant="ghost" className="text-white/60 hover:text-white" onClick={() => handleFileChange(null)}>
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full h-14 text-lg font-semibold bg-white text-black hover:bg-white/90 transition-all"
              >
                {isSearching ? "Searching..." : "Search Verification Memory"}
              </Button>
            </div>

            <p className="text-xs text-white/30 uppercase tracking-[0.4em]">
              All lookup requests are hashed and compared securely. We never persist user-provided media on this page.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-[32px] p-8 sm:p-10 backdrop-blur-xl min-h-[360px] flex flex-col justify-between">
            {!result && !isSearching && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center">
                  <History className="w-8 h-8 text-white/40" />
                </div>
                <p className="text-white/50 text-sm uppercase tracking-[0.4em]">Awaiting Query</p>
                <p className="text-white/70 max-w-xs text-sm">
                  Provide a media URL or upload an image to check if it has already been authenticated.
                </p>
              </div>
            )}

            {isSearching && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-16 h-16 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                <p className="text-white/60 text-xs uppercase tracking-[0.45em]">Scanning Memory</p>
              </div>
            )}

            {result && !isSearching && (
              <div className="space-y-6">
                {result.found ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.4em] text-white/40">Existing Verification</p>
                      <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4">
                        <p className="text-lg font-semibold text-white">{verdictLabel}</p>
                        {confidenceDisplay && (
                          <p className="text-sm text-white/60 mt-2">{confidenceDisplay}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-white/70">
                      <div>
                        <span className="text-white/40 uppercase text-[10px] tracking-[0.35em]">SHA-256</span>
                        <p className="mt-1 break-all font-mono text-xs bg-black/40 border border-white/10 rounded-xl px-3 py-2">
                          {result.record.sha256}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                          <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">First Verified</p>
                          <p className="text-sm text-white/70 mt-1">
                            {new Date(result.record.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                          <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Last Seen</p>
                          <p className="text-sm text-white/70 mt-1">
                            {new Date(result.record.last_seen).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {result.record.metadata?.source_url && (
                        <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                          <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Source URL</p>
                          <a
                            href={String(result.record.metadata.source_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-white/70 hover:text-white underline break-all"
                          >
                            {String(result.record.metadata.source_url)}
                          </a>
                        </div>
                      )}
                    </div>

                    {result.record.result?.heatmap_base64 && (
                      <div className="space-y-3">
                        <p className="text-xs uppercase tracking-[0.35em] text-white/40">Heatmap Preview</p>
                        <div className="rounded-3xl overflow-hidden border border-white/10">
                          <Image
                            src={`data:image/jpeg;base64,${result.record.result.heatmap_base64 as string}`}
                            alt="Verification heatmap"
                            width={700}
                            height={700}
                            className="w-full h-auto"
                            unoptimized
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-white/15 bg-black/30 px-6 py-6 text-center">
                      <p className="text-xl font-semibold text-white">No previous verification found.</p>
                      <p className="text-sm text-white/60 mt-2">
                        This media has not been authenticated through Apex Verify AI yet.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white/70 space-y-2">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/40">Suggested Action</p>
                      <p>
                        Use the main verification flow to analyze this asset. Once verified, the results will appear in
                        the memory immediately.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

