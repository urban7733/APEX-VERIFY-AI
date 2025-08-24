import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const { sealed_image_path, filename } = await request.json()
    
    if (!sealed_image_path) {
      return NextResponse.json(
        { error: 'Sealed image path is required' },
        { status: 400 }
      )
    }

    // Request the sealed image from backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/download-sealed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sealed_image_path, filename }),
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      return NextResponse.json(
        { 
          error: 'Download failed', 
          details: errorData.detail || 'Unknown error',
          statusCode: backendResponse.status
        },
        { status: backendResponse.status }
      )
    }

    // Get the image data
    const imageBuffer = await backendResponse.arrayBuffer()
    
    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${filename || 'sealed_image.png'}"`,
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('Download API route error:', error)
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
      message: 'APEX VERIFY AI - Download Sealed Images',
      endpoint: '/api/download-sealed',
      method: 'POST',
      description: 'Download images with embedded digital seals',
      features: [
        'Download verified and sealed images',
        'Cryptographic proof of authenticity',
        'Tamper-evident metadata protection'
      ]
    }
  )
}
