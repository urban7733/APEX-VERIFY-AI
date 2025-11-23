import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const runpodEndpointUrl = process.env.RUNPOD_ENDPOINT_URL
const runpodApiKey = process.env.RUNPOD_API_KEY

export async function GET() {
  if (!runpodEndpointUrl || !runpodApiKey) {
    return NextResponse.json(
      {
        status: "degraded",
        frontend: "healthy",
        runpod: "unconfigured",
        message: "Set RUNPOD_ENDPOINT_URL and RUNPOD_API_KEY",
      },
      { status: 503 },
    )
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    console.log("[Health] Checking RunPod endpoint")

    const runpodResponse = await fetch(runpodEndpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${runpodApiKey}`,
      },
      body: JSON.stringify({ input: { health_check: true } }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log(`[Health] RunPod response: ${runpodResponse.status}`)

    if (!runpodResponse.ok) {
      const errorText = await runpodResponse.text().catch(() => "Unknown error")
      console.error(`[Health] RunPod error: ${errorText}`)
      return NextResponse.json(
        {
          status: "degraded",
          frontend: "healthy",
          runpod: "unhealthy",
          message: `RunPod returned ${runpodResponse.status}`,
          error: errorText,
        },
        { status: 503 },
      )
    }

    const runpodHealthPayload = await runpodResponse.json().catch(() => ({}))
    const runpodHealth = runpodHealthPayload.output ?? runpodHealthPayload

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
      runpod: runpodHealth,
      database: databaseStatus,
      timestamp: new Date().toISOString(),
    }, { status: databaseStatus === "healthy" ? 200 : 503 })
  } catch (error) {
    console.error("RunPod health check error:", error)
    const isTimeout = error instanceof Error && error.name === "AbortError"
    return NextResponse.json(
      {
        status: isTimeout ? "degraded" : "error",
        frontend: "healthy",
        runpod: isTimeout ? "timeout" : "unreachable",
        message: isTimeout
          ? "RunPod health check timed out"
          : "Unable to reach RunPod Serverless endpoint",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    )
  }
}
