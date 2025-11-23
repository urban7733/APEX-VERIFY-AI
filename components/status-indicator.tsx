"use client"

import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react'

interface StatusIndicatorProps {
  className?: string
}

type PipelineStatus = string | Record<string, unknown>

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'error'
  frontend: string
  runpod: PipelineStatus
  message?: string
  error?: string
  timestamp?: string
  database?: string
}

export function StatusIndicator({ className = "" }: StatusIndicatorProps) {
  const [status, setStatus] = useState<HealthStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkHealth = async () => {
    try {
      setIsLoading(true)
      
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch('/api/health', {
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      const data = await response.json()
      setStatus(data as HealthStatus)
      setLastChecked(new Date())
    } catch (error) {
      console.error('Health check failed:', error)
      
      // Check if it's a timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        setStatus({
          status: 'error',
          frontend: 'healthy',
          runpod: 'timeout',
          message: 'RunPod health check timeout'
        })
      } else {
        setStatus({
          status: 'error',
          frontend: 'healthy',
          runpod: 'unreachable',
          message: 'Cannot reach RunPod GPU pipeline'
        })
      }
      setLastChecked(new Date())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-4 h-4 animate-spin" />
    }
    
    switch (status?.status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
    }
  }

  const getStatusText = () => {
    if (isLoading) return 'Checking...'
    
    switch (status?.status) {
      case 'healthy':
        return 'All Systems Operational'
      case 'degraded':
        return 'Partial Service'
      case 'error':
        return 'Service Issues'
      default:
        return 'Unknown Status'
    }
  }

  const getStatusColor = () => {
    if (isLoading) return 'text-white/60'
    
    switch (status?.status) {
      case 'healthy':
        return 'text-green-400'
      case 'degraded':
        return 'text-yellow-400'
      case 'unhealthy':
      case 'error':
        return 'text-red-400'
      default:
        return 'text-white/60'
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      {lastChecked && (
        <span className="text-xs text-white/40">
          Last checked: {lastChecked.toLocaleTimeString()}
        </span>
      )}
      
      <button
        onClick={checkHealth}
        disabled={isLoading}
        className="text-xs text-white/60 hover:text-white/80 disabled:opacity-50"
        title="Check status"
      >
        Refresh
      </button>
    </div>
  )
}
