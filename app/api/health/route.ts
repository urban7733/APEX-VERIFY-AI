import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function GET() {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const backendResponse = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!backendResponse.ok) {
      return NextResponse.json(
        { 
          status: 'degraded',
          frontend: 'healthy',
          backend: 'unhealthy',
          message: 'Backend service is not responding properly',
          statusCode: backendResponse.status
        },
        { status: 503 }
      )
    }

    const backendHealth = await backendResponse.json()
    
    return NextResponse.json({
      status: 'healthy',
      frontend: 'healthy',
      backend: backendHealth,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Health check error:', error)
    
    // Check if it's a timeout error
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          status: 'degraded',
          frontend: 'healthy',
          backend: 'timeout',
          message: 'Backend service connection timeout',
          error: 'Connection timeout after 5 seconds'
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { 
        status: 'degraded',
        frontend: 'healthy',
        backend: 'unreachable',
        message: 'Cannot connect to backend service',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}
