import { createHash } from "crypto"

import { type NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { calculatePhash } from "@/lib/phash"

export const runtime = "nodejs"

const runpodEndpointUrl = process.env.RUNPOD_ENDPOINT_URL
const runpodApiKey = process.env.RUNPOD_API_KEY

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

async function callRunPod(imageBase64: string) {
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
    signal: AbortSignal.timeout(120000),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(`RunPod inference failed (${response.status}): ${errorText}`)
  }

  const payload = await response.json().catch(() => {
    throw new Error("Invalid RunPod response (JSON expected)")
  })
  const output = payload.output ?? payload
  const result = output.result ?? output

  if (!result || typeof result !== "object") {
    throw new Error("RunPod output is missing result payload")
  }

  return result as Record<string, unknown>
}

async function getCachedResult(sha256: string) {
  if (!prisma) {
    return null
  }

  const existingRecord = await prisma.verificationRecord.findUnique({
    where: { sha256 },
  })

  if (!existingRecord) {
    return null
  }

  const cachedResult = JSON.parse(
    JSON.stringify(existingRecord.result),
  ) as Record<string, unknown>

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

      const runpodResult = await callRunPod(imageBase64)
      
      // Log raw SPAI response for debugging
      console.log("[SPAI] Raw response:", JSON.stringify(runpodResult, null, 2))
      
      // Check if RunPod returned an error (GPU OOM, etc.)
      if (runpodResult.status === "FAILED" || runpodResult.error) {
        console.error("[SPAI] RunPod job failed:", runpodResult.error)
        throw new Error("SPAI inference failed - GPU error, please retry")
      }
      
      const spaiScore = clampProbability(runpodResult.score)
      const spaiStatusOk = runpodResult.status === "ok"
      
      // SPAI returns is_ai_generated directly - USE IT as the primary signal
      // The model returns: is_ai_generated: true/false, score: 0-1
      // For REAL images: is_ai_generated=false, score≈0
      // For AI images: is_ai_generated=true, score≈1
      const spaiIsAiGenerated = typeof runpodResult.is_ai_generated === "boolean" 
        ? runpodResult.is_ai_generated 
        : spaiScore >= 0.5
      
      console.log(`[SPAI] Decision: is_ai=${spaiIsAiGenerated}, score=${spaiScore}, status=${runpodResult.status}`)

      const spaiResult = {
        status: runpodResult.status ?? "ok",
        score: spaiScore,
        is_ai_generated: spaiIsAiGenerated,
        probabilities:
          typeof runpodResult.probabilities === "object"
            ? runpodResult.probabilities
            : {
                ai_generated: spaiScore,
                authentic: 1 - spaiScore,
              },
      }

      const processingTime =
        typeof runpodResult.processing_time === "number"
          ? runpodResult.processing_time
          : 0

      // Use SPAI's direct boolean result, OR metadata indicators
      const isAiGenerated = spaiIsAiGenerated || metadataAnalysis.hasAiMetadata

      // Confidence: For AI images use score, for authentic images use (1 - score)
      let confidence = spaiStatusOk 
        ? (spaiIsAiGenerated ? spaiScore : (1 - spaiScore))
        : 0.5
      
      // Clamp confidence to reasonable range
      confidence = Math.max(0.5, Math.min(1, confidence))
      
      if (metadataAnalysis.hasAiMetadata && confidence < 0.95) {
        confidence = 0.95
      }

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
        ai_detection: spaiResult,
        metadata_check: {
          has_ai_indicators: metadataAnalysis.hasAiMetadata,
          sources: metadataAnalysis.sources,
        },
      }

      const verdict = isAiGenerated ? "ai_generated" : "authentic"
      
      console.log(`[Result] Final verdict: ${verdict}, confidence: ${(confidence * 100).toFixed(1)}%`)
      
      const resultToPersist = { ...responsePayload }
      delete (resultToPersist as { cache_hit?: boolean }).cache_hit
      const prismaResult = JSON.parse(JSON.stringify(resultToPersist)) as Prisma.JsonObject

      if (prisma) {
        try {
          await prisma.verificationRecord.upsert({
            where: { sha256 },
            update: {
              result: prismaResult,
              verdict,
              confidence,
              method,
              sourceUrl: sourceUrl ?? null,
              phash: phash ?? undefined,
            },
            create: {
              sha256,
              phash,
              result: prismaResult,
              verdict,
              confidence,
              method,
              sourceUrl: sourceUrl ?? null,
            },
          })
        } catch (dbError) {
          console.error("[Analyze] Database error (non-fatal):", dbError)
        }
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
