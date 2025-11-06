import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const MODAL_URL = process.env.NEXT_PUBLIC_MODAL_ML_URL

export async function GET() {
  if (!MODAL_URL) {
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

    const modalResponse = await fetch(`${MODAL_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!modalResponse.ok) {
      return NextResponse.json(
        {
          status: "degraded",
          frontend: "healthy",
          modal: "unhealthy",
          message: `Modal returned ${modalResponse.status}`,
        },
        { status: 503 },
      )
    }

    const modalHealth = await modalResponse.json().catch(() => ({ status: "unknown" }))

    let databaseStatus: "healthy" | "unreachable" = "healthy"
    if (prisma) {
      try {
        await prisma.$queryRaw`SELECT 1`
      } catch (dbError) {
        console.error("Database health check error:", dbError)
        databaseStatus = "unreachable"
      }
    } else {
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
