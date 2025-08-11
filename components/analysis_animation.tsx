"use client"

import { useEffect, useState } from "react"

interface AnalysisAnimationProps {
  isActive: boolean
  onComplete?: () => void
  fileType?: "image" | "video" | "audio"
}

export function AnalysisAnimation({ isActive, onComplete, fileType = "image" }: AnalysisAnimationProps) {
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(0)

  const phases = ["Initializing AI Models...", "Analyzing Content...", "Generating Report..."]

  useEffect(() => {
    if (!isActive) return

    let progressInterval: NodeJS.Timeout
    let phaseInterval: NodeJS.Timeout

    // Progress animation
    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          onComplete?.()
          return 100
        }
        return prev + Math.random() * 8 + 2
      })
    }, 150)

    // Phase progression
    phaseInterval = setInterval(() => {
      setPhase((prev) => (prev + 1) % phases.length)
    }, 2000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(phaseInterval)
    }
  }, [isActive, onComplete, phases.length])

  useEffect(() => {
    if (isActive) {
      setProgress(0)
      setPhase(0)
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <div className="relative bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl">
      <div className="flex flex-col items-center space-y-8">
        {/* Minimalistic Pulsing Orb */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse">
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-400/40 to-purple-400/40 animate-ping" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-300/60 to-purple-300/60" />
          </div>

          {/* Rotating Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/30 animate-spin" />
        </div>

        {/* Phase Text */}
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium text-white">{phases[phase]}</h3>

          {/* Progress Bar */}
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <p className="text-sm text-white/60">{Math.min(Math.round(progress), 100)}% Complete</p>
        </div>
      </div>
    </div>
  )
}
