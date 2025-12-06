import { createHash } from "crypto"

import { type NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db, verificationRecords } from "@/lib/db"
import { calculatePhash } from "@/lib/phash"

export const runtime = "nodejs"

const runpodEndpointUrl = process.env.RUNPOD_ENDPOINT_URL
const runpodApiKey = process.env.RUNPOD_API_KEY

// Keywords that indicate AI-generated content in metadata
const AI_KEYWORDS = [
  "midjourney",
  "dall-e",
  "dalle",
  "stable diffusion",
  "openai",
  "chatgpt",
  "artificial intelligence",
  "ai generated",
  "synthetic",
  "gan",
  "leonardo",
  "firefly",
  "adobe firefly",
  "bing image creator",
  "copilot",
]

type MetadataIndicator = {
  source: string
  value: string
}

function containsAiKeyword(value: unknown) {
  if (!value) return false
  const text = String(value).toLowerCase()
  return AI_KEYWORDS.some((keyword) => text.includes(keyword))
}

async function extractMetadataSignals(
  imageBuffer: Buffer,
  metadataFields: Record<string, string | undefined>,
): Promise<{ hasAiMetadata: boolean; sources: MetadataIndicator[] }> {
  const indicators: MetadataIndicator[] = []

  try {
    const exifr = await import("exifr")
    const exifData = await exifr.parse(imageBuffer).catch(() => null)
    if (exifData && typeof exifData === "object") {
      for (const [key, value] of Object.entries(exifData)) {
        if (typeof value === "string" && containsAiKeyword(value)) {
          indicators.push({
            source: `exif.${key}`,
            value: value.slice(0, 200),
          })
          break
        }
      }
    }
  } catch (error) {
    console.warn("[Metadata] EXIF parsing failed:", error)
  }

  for (const [source, value] of Object.entries(metadataFields)) {
    if (value && containsAiKeyword(value)) {
      indicators.push({
        source: `metadata.${source}`,
        value: value.slice(0, 200),
      })
    }
  }

  return {
    hasAiMetadata: indicators.length > 0,
    sources: indicators,
  }
}

interface SPAIResponse {
  status: string
  is_ai?: boolean
  is_ai_generated?: boolean
  confidence?: number
  score?: number
  model?: string
  model_version?: string
  error?: string
  fallback?: boolean
}

async function callRunPod(imageBase64: string): Promise<SPAIResponse> {
  if (!runpodEndpointUrl || !runpodApiKey) {
    throw new Error("RunPod configuration is missing")
  }

  const response = await fetch(runpodEndpointUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${runpodApiKey}`,
    },
    body: JSON.stringify({
      input: {
        image_base64: imageBase64,
      },
    }),
    signal: AbortSignal.timeout(120000), // 2 minute timeout
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(`RunPod inference failed (${response.status}): ${errorText}`)
  }

  const payload = await response.json().catch(() => {
    throw new Error("Invalid RunPod response (JSON expected)")
  })
  
  // RunPod wraps response in "output" field
  const output = payload.output ?? payload
  
  return output as SPAIResponse
}

interface CachedResult {
  sha256: string
  cache_hit: boolean
  is_manipulated: boolean
  is_ai_generated: boolean
  confidence: number
  manipulation_type: string | null
  manipulation_areas: unknown[]
  processing_time: number
  method: string
  models_used: string[]
  ai_detection: {
    status: string
    score: number
    is_ai: boolean
    model: string
    model_version: string
    fallback: boolean
  }
  metadata_check: {
    has_ai_indicators: boolean
    sources: Array<{ source: string; value: string }>
  }
  sourceUrl?: string
}

async function getCachedResult(sha256: string): Promise<CachedResult | null> {
  const existingRecords = await db
    .select()
    .from(verificationRecords)
    .where(eq(verificationRecords.sha256, sha256))
    .limit(1)

  const existingRecord = existingRecords[0]

  if (!existingRecord) {
    return null
  }

  const cachedResult = existingRecord.result as Omit<CachedResult, "sha256" | "cache_hit" | "sourceUrl">

  return {
    ...cachedResult,
    sha256: existingRecord.sha256,
    cache_hit: true,
    sourceUrl: existingRecord.sourceUrl ?? undefined,
  }
}

function clampProbability(value: unknown, fallback = 0.5) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(1, Math.max(0, value))
  }
  return fallback
}

export async function POST(request: NextRequest) {
  if (!runpodEndpointUrl || !runpodApiKey) {
    return NextResponse.json(
      {
        error: "RunPod is not configured",
        message: "Set RUNPOD_ENDPOINT_URL and RUNPOD_API_KEY",
      },
      { status: 503 },
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const sourceUrl = typeof formData.get("sourceUrl") === "string" ? (formData.get("sourceUrl") as string) : undefined

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const sha256 = createHash("sha256").update(fileBuffer).digest("hex")

    // Check cache first
    const cachedResult = await getCachedResult(sha256)
    if (cachedResult) {
      console.log(`[Cache] HIT for ${sha256.slice(0, 12)}... verdict=${cachedResult.is_ai_generated ? 'ai' : 'real'}`)
      return NextResponse.json(cachedResult)
    }
    console.log(`[Cache] MISS for ${sha256.slice(0, 12)}... calling SPAI`)

    const metadataFields: Record<string, string | undefined> = {
      source_url: sourceUrl,
      filename: typeof file.name === "string" ? file.name.trim() : undefined,
    }

    const metadataAnalysis = await extractMetadataSignals(fileBuffer, metadataFields)

    try {
      const imageBase64 = fileBuffer.toString("base64")

      // Calculate perceptual hash for visual similarity matching
      let phash: string | null = null
      try {
        phash = await calculatePhash(fileBuffer)
      } catch (phashError) {
        console.warn("[Analyze] pHash calculation failed (non-fatal):", phashError)
      }

      // Call SPAI via RunPod
      const spaiResult = await callRunPod(imageBase64)
      
      // Log raw SPAI response for debugging
      console.log("[SPAI] Raw response:", JSON.stringify(spaiResult, null, 2))
      
      // Check for errors
      if (spaiResult.status === "error" || spaiResult.error) {
        console.error("[SPAI] Error from RunPod:", spaiResult.error)
        throw new Error(spaiResult.error || "SPAI inference failed")
      }
      
      // Extract results from new handler format
      // Handler returns: is_ai, is_ai_generated (alias), confidence, score
      const isAiFromModel = spaiResult.is_ai ?? spaiResult.is_ai_generated ?? false
      const scoreFromModel = clampProbability(spaiResult.score)
      const confidenceFromModel = clampProbability(spaiResult.confidence)
      
      console.log(`[SPAI] Model result: is_ai=${isAiFromModel}, score=${scoreFromModel}, confidence=${confidenceFromModel}`)

      // Combine model result with metadata analysis
      // If metadata indicates AI OR model detects AI -> mark as AI
      const isAiGenerated = isAiFromModel || metadataAnalysis.hasAiMetadata

      // Calculate final confidence
      let confidence = confidenceFromModel
      
      // If metadata indicates AI, boost confidence
      if (metadataAnalysis.hasAiMetadata && confidence < 0.95) {
        confidence = 0.95
      }
      
      // Ensure confidence is reasonable
      confidence = Math.max(0.5, Math.min(1, confidence))

      const processingTime = 0 // Could track this if needed

      const method = `runpod_spai${metadataAnalysis.hasAiMetadata ? "+metadata" : ""}`

      const responsePayload = {
        sha256,
        cache_hit: false,
        is_manipulated: isAiGenerated,
        is_ai_generated: isAiGenerated,
        confidence,
        manipulation_type: isAiGenerated ? "ai" : null,
        manipulation_areas: [],
        processing_time: processingTime,
        method,
        models_used: ["spai"],
        ai_detection: {
          status: spaiResult.status,
          score: scoreFromModel,
          is_ai: isAiFromModel,
          model: spaiResult.model ?? "spai",
          model_version: spaiResult.model_version ?? "cvpr2025",
          fallback: spaiResult.fallback ?? false,
        },
        metadata_check: {
          has_ai_indicators: metadataAnalysis.hasAiMetadata,
          sources: metadataAnalysis.sources,
        },
      }

      const verdict = isAiGenerated ? "ai_generated" : "authentic"
      
      console.log(`[Result] Final verdict: ${verdict}, confidence: ${(confidence * 100).toFixed(1)}%`)
      
      // Save to database
      const resultToPersist = { ...responsePayload }
      delete (resultToPersist as { cache_hit?: boolean }).cache_hit

      try {
        await db
          .insert(verificationRecords)
          .values({
            sha256,
            phash,
            result: resultToPersist,
            verdict,
            confidence,
            method,
            sourceUrl: sourceUrl ?? null,
          })
          .onConflictDoUpdate({
            target: verificationRecords.sha256,
            set: {
              result: resultToPersist,
              verdict,
              confidence,
              method,
              sourceUrl: sourceUrl ?? null,
              phash: phash ?? undefined,
              updatedAt: new Date(),
            },
          })
      } catch (dbError) {
        console.error("[Analyze] Database error (non-fatal):", dbError)
      }

      return NextResponse.json(responsePayload)
    } catch (error: unknown) {
      console.error("RunPod inference error:", error)
      const message = error instanceof Error ? error.message : "Please try again later"
      return NextResponse.json(
        {
          error: "ML Pipeline unavailable",
          message,
        },
        { status: 503 },
      )
    }
  } catch (error: unknown) {
    console.error("Analysis error:", error)
    const message = error instanceof Error ? error.message : "Analysis failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
