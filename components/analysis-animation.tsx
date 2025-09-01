"use client"
import { useState, useEffect } from "react"

interface AnalysisAnimationProps {
  isActive: boolean
  onComplete?: () => void
  fileType: "image" | "video" | "audio"
}

export function AnalysisAnimation({ isActive, onComplete, fileType }: AnalysisAnimationProps) {
  const [progress, setProgress] = useState(0)
  const [currentPhase, setCurrentPhase] = useState(0)

  const phases = ["Scanning...", "Analyzing...", "Verifying..."]

  useEffect(() => {
    if (!isActive) return

    const progressValue = 0
    const totalDuration = 4000 // 4 seconds total
    const phaseInterval = totalDuration / 3

    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100)

      setProgress(newProgress)
      setCurrentPhase(Math.floor(elapsed / phaseInterval))

      if (elapsed < totalDuration) {
        requestAnimationFrame(animate)
      } else {
        setTimeout(() => {
          onComplete?.()
        }, 300)
      }
    }

    requestAnimationFrame(animate)
  }, [isActive, onComplete])

  if (!isActive) return null

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30 animate-pulse">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-300/40 to-purple-300/40 animate-ping" />
          </div>
        </div>

        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/20 animate-spin" />
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-light text-white mb-2">{phases[Math.min(currentPhase, phases.length - 1)]}</h3>
        <p className="text-white/50 text-sm font-light">AI Analysis in Progress</p>
      </div>

      <div className="w-full max-w-xs">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-center mt-3 text-white/60 text-sm font-light">{Math.round(progress)}%</div>
      </div>
    </div>
  )
}
