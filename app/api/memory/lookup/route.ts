import { createHash } from "crypto"

import { type NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const modalUrl = process.env.NEXT_PUBLIC_MODAL_ML_URL

export async function POST(request: NextRequest) {
  if (!modalUrl) {
    return NextResponse.json(
      {
        error: "Modal ML URL not configured",
        message: "Set NEXT_PUBLIC_MODAL_ML_URL to the deployed Modal FastAPI endpoint",
      },
      { status: 503 },
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const link = typeof formData.get("link") === "string" ? (formData.get("link") as string).trim() : undefined

    let buffer: Buffer | null = null
    let effectiveSourceUrl: string | undefined

    if (file instanceof File && file.size > 0) {
      if (file.size > 100 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size must be less than 100MB" },
          { status: 400 },
        )
      }

      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    } else if (link) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      try {
        const response = await fetch(link, {
          method: "GET",
          signal: controller.signal,
        })

        clearTimeout(timeout)

        if (!response.ok) {
          return NextResponse.json(
            {
              error: `Unable to fetch media from URL (status ${response.status})`,
            },
            { status: 400 },
          )
        }

        const contentType = response.headers.get("content-type") || ""
        if (!contentType.startsWith("image/")) {
          return NextResponse.json(
            {
              error: "Only image URLs are supported",
            },
            { status: 400 },
          )
        }

        const arrayBuffer = await response.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
        effectiveSourceUrl = link
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return NextResponse.json(
            {
              error: "Timed out fetching media URL",
            },
            { status: 408 },
          )
        }

        throw error
      }
    } else {
      return NextResponse.json(
        {
          error: "Provide either a file or a media URL",
        },
        { status: 400 },
      )
    }

    if (!buffer) {
      return NextResponse.json(
        {
          error: "No media detected",
        },
        { status: 400 },
      )
    }

    const sha256 = createHash("sha256").update(buffer).digest("hex")

    // Check Prisma database first if available
    const existingRecord = prisma
      ? await prisma.verificationRecord.findUnique({
          where: { sha256 },
        })
      : null

    if (existingRecord) {
      const result = JSON.parse(JSON.stringify(existingRecord.result))
      const recordPayload = {
        sha256: existingRecord.sha256,
        created_at: existingRecord.createdAt.toISOString(),
        last_seen: existingRecord.updatedAt.toISOString(),
        metadata: {
          source_url: existingRecord.sourceUrl,
        },
        summary: {
          verdict: existingRecord.verdict,
          confidence: existingRecord.confidence,
          method: existingRecord.method,
          processing_time:
            typeof result === "object" && result !== null && "processing_time" in result
              ? (result as Record<string, unknown>).processing_time
              : null,
        },
        result,
      }

      if (effectiveSourceUrl && !existingRecord.sourceUrl && prisma) {
        await prisma.verificationRecord.update({
          where: { sha256 },
          data: { sourceUrl: effectiveSourceUrl },
        })
      }

      return NextResponse.json(
        {
          found: true,
          sha256,
          sourceUrl: effectiveSourceUrl ?? existingRecord.sourceUrl ?? undefined,
          record: recordPayload,
        },
        { status: 200 },
      )
    }

    const lookupResponse = await fetch(`${modalUrl}/memory/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sha256 }),
    })

    if (lookupResponse.status === 404) {
      return NextResponse.json(
        {
          found: false,
          sha256,
          sourceUrl: effectiveSourceUrl,
        },
        { status: 200 },
      )
    }

    if (!lookupResponse.ok) {
      throw new Error(`Modal lookup failed with status ${lookupResponse.status}`)
    }

    const data = await lookupResponse.json()
    const recordFromModal = data.record

    const summary = (recordFromModal?.summary ?? {}) as Record<string, unknown>
    const resultPayload = (recordFromModal?.result ?? {}) as Record<string, unknown>
    const metadataFromModal = (recordFromModal?.metadata ?? {}) as Record<string, unknown>
    const normalizedResult = JSON.parse(JSON.stringify(resultPayload)) as Prisma.JsonObject
    const verdictFromModal = (summary?.verdict as string | undefined) ??
      (resultPayload?.is_ai_generated ? "ai_generated" : "authentic")
    const confidenceFromModal = (summary?.confidence as number | undefined) ??
      (typeof resultPayload?.confidence === "number" ? (resultPayload.confidence as number) : 0)
    const methodFromModal = (summary?.method as string | undefined) ??
      (typeof resultPayload?.method === "string" ? (resultPayload.method as string) : null)
    const sourceUrlFromModal = typeof metadataFromModal?.source_url === "string" ? (metadataFromModal.source_url as string) : null

    // Persist to database if Prisma client is available
    if (prisma) {
      await prisma.verificationRecord.upsert({
        where: { sha256 },
        update: {
          result: normalizedResult,
          verdict: verdictFromModal,
          confidence: typeof confidenceFromModal === "number" ? confidenceFromModal : 0,
          method: typeof methodFromModal === "string" ? methodFromModal : null,
          sourceUrl: effectiveSourceUrl ?? sourceUrlFromModal,
        },
        create: {
          sha256,
          result: normalizedResult,
          verdict: verdictFromModal,
          confidence: typeof confidenceFromModal === "number" ? confidenceFromModal : 0,
          method: typeof methodFromModal === "string" ? methodFromModal : null,
          sourceUrl: effectiveSourceUrl ?? sourceUrlFromModal,
        },
      })
    }

    return NextResponse.json(
      {
        found: true,
        sha256,
        sourceUrl: effectiveSourceUrl ?? sourceUrlFromModal ?? undefined,
        record: recordFromModal,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Memory lookup error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Lookup failed",
      },
      { status: 500 },
    )
  }
}
