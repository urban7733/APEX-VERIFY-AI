import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Connect to Modal ML Pipeline (direct, no backend!)
    const modalUrl = process.env.NEXT_PUBLIC_MODAL_ML_URL || "https://urban33133--apex-verify-ml-fastapi-app.modal.run"

    try {
      const modalFormData = new FormData()
      modalFormData.append("file", file)

      const response = await fetch(`${modalUrl}/analyze`, {
        method: "POST",
        body: modalFormData,
        signal: AbortSignal.timeout(60000), // 60 second timeout for ML inference
      })

      if (response.ok) {
        const result = await response.json()
        return NextResponse.json(result)
      } else {
        throw new Error(`Modal ML failed: ${response.status}`)
      }
    } catch (error: any) {
      console.error("Modal ML Pipeline error:", error)
      return NextResponse.json(
        { 
          error: "ML Pipeline unavailable", 
          message: error.message || "Please try again later"
        }, 
        { status: 503 }
      )
    }
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
