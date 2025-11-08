import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

// Modal health endpoint URL - each function has its own full URL
const modalHealthUrl = process.env.NEXT_PUBLIC_MODAL_HEALTH_URL || 
  (process.env.NEXT_PUBLIC_MODAL_ML_URL 
    ? `${process.env.NEXT_PUBLIC_MODAL_ML_URL.replace(/\/$/, "")}-health-endpoint.modal.run`
    : undefined)

export async function GET() {
  if (!modalHealthUrl) {
    return NextResponse.json(
      {
        status: "degraded",
        frontend: "healthy",
        modal: "unconfigured",
        message: "Modal ML URL is not set",
      },
      { status: 503 },
    )
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    console.log(`[Health] Checking Modal at: ${modalHealthUrl}`)

    const modalResponse = await fetch(modalHealthUrl, {
      method: "GET",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log(`[Health] Modal response: ${modalResponse.status}`)

    if (!modalResponse.ok) {
      const errorText = await modalResponse.text().catch(() => "Unknown error")
      console.error(`[Health] Modal error: ${errorText}`)
      return NextResponse.json(
        {
          status: "degraded",
          frontend: "healthy",
          modal: "unhealthy",
          message: `Modal returned ${modalResponse.status}`,
          modalUrl: MODAL_URL,
          error: errorText,
        },
        { status: 503 },
      )
    }

    const modalHealth = await modalResponse.json().catch(() => ({ status: "unknown" }))

    let databaseStatus: "healthy" | "unreachable" = "healthy"
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      console.error("Database health check error:", dbError)
      databaseStatus = "unreachable"
    }

    return NextResponse.json({
      status: databaseStatus === "healthy" ? "healthy" : "degraded",
      frontend: "healthy",
      modal: modalHealth,
      database: databaseStatus,
      timestamp: new Date().toISOString(),
    }, { status: databaseStatus === "healthy" ? 200 : 503 })
  } catch (error) {
    console.error("Modal health check error:", error)
    const isTimeout = error instanceof Error && error.name === "AbortError"
    return NextResponse.json(
      {
        status: isTimeout ? "degraded" : "error",
        frontend: "healthy",
        modal: isTimeout ? "timeout" : "unreachable",
        message: isTimeout ? "Modal health check timed out" : "Unable to reach Modal ML pipeline",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    )
  }
}
