"use client"

import { useEffect, useState } from "react"
import Orb from "./Orb"

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
    <div className="relative bg-black/60 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col items-center space-y-6 sm:space-y-8">
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <Orb hoverIntensity={0.5} rotateOnHover={true} hue={240} forceHoverState={true} />
          </div>
        </div>

        {/* Phase Text - Mobile Optimized */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-medium text-white px-2">{phases[phase]}</h3>

          {/* Progress Bar - Mobile Optimized */}
          <div className="w-48 sm:w-64 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <p className="text-xs sm:text-sm text-white/60">{Math.min(Math.round(progress), 100)}% Complete</p>
        </div>
      </div>
    </div>
  )
}
