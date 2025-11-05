import { createHash } from "crypto"

import { type NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const sourceUrl = typeof formData.get("sourceUrl") === "string" ? (formData.get("sourceUrl") as string) : undefined

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const sha256 = createHash("sha256").update(fileBuffer).digest("hex")

    // Connect to Modal ML Pipeline (direct, no backend!)
    const modalUrl = process.env.NEXT_PUBLIC_MODAL_ML_URL || "https://urban33133--apex-verify-ml-fastapi-app.modal.run"

    try {
      const modalFormData = new FormData()
      modalFormData.append("file", file)
      if (sourceUrl) {
        modalFormData.append("source_url", sourceUrl)
      }

      const response = await fetch(`${modalUrl}/analyze`, {
        method: "POST",
        body: modalFormData,
        signal: AbortSignal.timeout(60000), // 60 second timeout for ML inference
      })

      if (response.ok) {
        const result = await response.json()
        const verdict = result.is_ai_generated || result.is_manipulated ? "ai_generated" : "authentic"

        const normalizedResult = JSON.parse(JSON.stringify(result)) as Prisma.JsonObject

        await prisma.verificationRecord.upsert({
          where: { sha256 },
          update: {
            result: normalizedResult,
            verdict,
            confidence: typeof result.confidence === "number" ? result.confidence : 0,
            method: typeof result.method === "string" ? result.method : null,
            sourceUrl: sourceUrl ?? null,
            userId: session.user.id,
          },
          create: {
            sha256,
            result: normalizedResult,
            verdict,
            confidence: typeof result.confidence === "number" ? result.confidence : 0,
            method: typeof result.method === "string" ? result.method : null,
            sourceUrl: sourceUrl ?? null,
            userId: session.user.id,
          },
        })

        return NextResponse.json({ ...result, sha256 })
      } else {
        throw new Error(`Modal ML failed: ${response.status}`)
      }
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
