import { createHash } from "crypto"

import { type NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { calculatePhash, hammingDistance } from "@/lib/phash"

const PHASH_SIMILARITY_THRESHOLD = 10 // Max bit differences for a match (out of 64)

export const runtime = "nodejs"

export async function POST(request: NextRequest) {

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

    const existingRecord = await prisma.verificationRecord.findUnique({
      where: { sha256 },
    })

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

      if (effectiveSourceUrl && !existingRecord.sourceUrl) {
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

    // SHA256 not found - try perceptual hash similarity search
    try {
      const uploadedPhash = await calculatePhash(buffer)
      
      // Get all records with pHash (for similarity comparison)
      const recordsWithPhash = await prisma.verificationRecord.findMany({
        where: { phash: { not: null } },
        select: {
          id: true,
          sha256: true,
          phash: true,
          verdict: true,
          confidence: true,
          method: true,
          result: true,
          sourceUrl: true,
          createdAt: true,
          updatedAt: true,
        },
        take: 1000, // Limit for performance
      })

      // Find the most similar match
      let bestMatch: typeof recordsWithPhash[0] | null = null
      let bestDistance = Infinity

      for (const record of recordsWithPhash) {
        if (!record.phash) continue
        const distance = hammingDistance(uploadedPhash, record.phash)
        if (distance <= PHASH_SIMILARITY_THRESHOLD && distance < bestDistance) {
          bestDistance = distance
          bestMatch = record
        }
      }

      if (bestMatch) {
        const result = JSON.parse(JSON.stringify(bestMatch.result))
        const recordPayload = {
          sha256: bestMatch.sha256,
          created_at: bestMatch.createdAt.toISOString(),
          last_seen: bestMatch.updatedAt.toISOString(),
          metadata: {
            source_url: bestMatch.sourceUrl,
          },
          summary: {
            verdict: bestMatch.verdict,
            confidence: bestMatch.confidence,
            method: bestMatch.method,
            processing_time:
              typeof result === "object" && result !== null && "processing_time" in result
                ? (result as Record<string, unknown>).processing_time
                : null,
          },
          result,
        }

        return NextResponse.json(
          {
            found: true,
            sha256, // Return the uploaded image's SHA256
            sourceUrl: effectiveSourceUrl,
            record: recordPayload,
            match_type: "perceptual", // Indicate this was a visual similarity match
            similarity: Math.round((1 - bestDistance / 64) * 100), // % similarity
          },
          { status: 200 },
        )
      }
    } catch (phashError) {
      console.warn("[Memory] pHash search failed (non-fatal):", phashError)
    }

    return NextResponse.json(
      {
        found: false,
        sha256,
        sourceUrl: effectiveSourceUrl,
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
