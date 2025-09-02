import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout for image processing + sealing

    const backendResponse = await fetch(`${BACKEND_URL}/api/verify`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      return NextResponse.json(
        { 
          error: 'Verification failed', 
          details: errorData.detail || 'Unknown error',
          statusCode: backendResponse.status
        },
        { status: backendResponse.status }
      )
    }

    const result = await backendResponse.json()
    
    // Check if image was sealed
    if (result.digital_seal) {
      console.log('Image verified and sealed with digital seal:', result.digital_seal.seal_id)
    }
    
    return NextResponse.json(result)

  } catch (error) {
    console.error('API route error:', error)
    
    // Check if it's a timeout error
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          error: 'Verification timeout',
          details: 'Image processing and sealing took too long. Please try again with a smaller image or check if the backend is running.',
          statusCode: 408
        },
        { status: 408 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'APEX VERIFY AI API',
      endpoint: '/api/verify',
      method: 'POST',
      description: 'Upload an image for authenticity verification and digital sealing',
      features: [
        'AI-powered image authenticity verification',
        'Digital seal embedding for verified images',
        'Cryptographic proof of verification',
        'Tamper-evident metadata protection'
      ],
      backend_url: BACKEND_URL
    }
  )
}
