import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Try to connect to Python backend first
    const backendUrl = process.env.NEXT_PUBLIC_DEEPFAKE_API_URL || "http://localhost:8000"

    try {
      const backendFormData = new FormData()
      backendFormData.append("file", file)

      const response = await fetch(`${backendUrl}/api/analyze`, {
        method: "POST",
        body: backendFormData,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      if (response.ok) {
        const result = await response.json()
        return NextResponse.json(result)
      }
    } catch (error) {
      console.log("Python backend not available, using fallback analysis")
    }

    // Fallback: Return error if backend is not available
    return NextResponse.json(
      { 
        error: "Backend service unavailable", 
        message: "Please ensure the backend service is running" 
      }, 
      { status: 503 }
    )
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
