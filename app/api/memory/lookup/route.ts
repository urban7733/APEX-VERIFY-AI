import { type NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"

export const runtime = "nodejs"

const modalUrl = process.env.NEXT_PUBLIC_MODAL_ML_URL || "https://urban33133--apex-verify-ml-fastapi-app.modal.run"

export async function POST(request: NextRequest) {
  if (!modalUrl) {
    return NextResponse.json(
      {
        error: "Modal ML URL not configured",
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

    return NextResponse.json(
      {
        found: true,
        sha256,
        sourceUrl: effectiveSourceUrl,
        record: data.record,
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
