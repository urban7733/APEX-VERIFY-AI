import { createHash } from "crypto"

import { type NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

// Modal endpoint URLs - each function has its own full URL
// Get from env var or construct from base URL pattern
const modalAnalyzeUrl = process.env.NEXT_PUBLIC_MODAL_ANALYZE_URL || 
  (process.env.NEXT_PUBLIC_MODAL_ML_URL 
    ? `${process.env.NEXT_PUBLIC_MODAL_ML_URL.replace(/\/$/, "")}-analyze-endpoint.modal.run`
    : undefined)

export async function POST(request: NextRequest) {
  if (!modalAnalyzeUrl) {
    return NextResponse.json(
      {
        error: "Modal ML URL not configured",
        message: "Set NEXT_PUBLIC_MODAL_ANALYZE_URL or NEXT_PUBLIC_MODAL_ML_URL to the deployed Modal endpoint",
      },
      { status: 503 },
    )
  }

  // Validate Modal URL format
  if (!modalAnalyzeUrl.startsWith("https://") || !modalAnalyzeUrl.includes(".modal.run")) {
    console.error(`Invalid Modal URL format: ${modalAnalyzeUrl}`)
    return NextResponse.json(
      {
        error: "Invalid Modal URL configuration",
        message: "Modal URL must be a valid Modal endpoint (https://*.modal.run)",
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

    try {
      // Convert image to base64 for Modal endpoint
      const imageBase64 = fileBuffer.toString("base64")

      console.log(`[Analyze] Calling Modal endpoint: ${modalAnalyzeUrl}`)
      console.log(`[Analyze] File size: ${file.size} bytes, type: ${file.type}`)

      const requestBody = {
        image_base64: imageBase64,
        ...(sourceUrl && { source_url: sourceUrl }),
      }

      const response = await fetch(modalAnalyzeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(60000), // 60 second timeout for ML inference
      })

      console.log(`[Analyze] Modal response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        console.error(`Modal API error (${response.status}):`, errorText)
        throw new Error(`Modal ML failed: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      
      // Validate Modal response structure
      if (!result || typeof result !== 'object') {
        throw new Error("Invalid response format from Modal endpoint")
      }

      // Ensure required fields exist with defaults
      const normalizedResult = {
        ...result,
        is_manipulated: Boolean(result.is_manipulated ?? false),
        is_ai_generated: Boolean(result.is_ai_generated ?? false),
        confidence: typeof result.confidence === "number" ? Math.max(0, Math.min(1, result.confidence)) : 0,
        processing_time: typeof result.processing_time === "number" ? result.processing_time : 0,
        manipulation_type: result.manipulation_type || null,
      }

      const verdict = normalizedResult.is_ai_generated || normalizedResult.is_manipulated ? "ai_generated" : "authentic"

      const prismaResult = JSON.parse(JSON.stringify(normalizedResult)) as Prisma.JsonObject

      // Only persist to database if Prisma client is available
      if (prisma) {
        try {
          await prisma.verificationRecord.upsert({
            where: { sha256 },
            update: {
              result: prismaResult,
              verdict,
              confidence: normalizedResult.confidence,
              method: typeof normalizedResult.method === "string" ? normalizedResult.method : null,
              sourceUrl: sourceUrl ?? null,
            },
            create: {
              sha256,
              result: prismaResult,
              verdict,
              confidence: normalizedResult.confidence,
              method: typeof normalizedResult.method === "string" ? normalizedResult.method : null,
              sourceUrl: sourceUrl ?? null,
            },
          })
        } catch (dbError) {
          console.error("[Analyze] Database error (non-fatal):", dbError)
          // Continue even if database write fails
        }
      }

      return NextResponse.json({ ...normalizedResult, sha256 })
    } catch (error: unknown) {
      console.error("Modal ML Pipeline error:", error)
      const message = error instanceof Error ? error.message : "Please try again later"
      return NextResponse.json(
        {
          error: "ML Pipeline unavailable",
          message,
        },
        { status: 503 }
      )
    }
  } catch (error: unknown) {
    console.error("Analysis error:", error)
    const message = error instanceof Error ? error.message : "Analysis failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
