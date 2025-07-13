"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Brain, Eye, Shield, Zap, FileText, Search, Clock, CheckCircle } from "lucide-react"

interface AnalysisAnimationProps {
  isActive: boolean
  onComplete?: () => void
  fileType: "image" | "video" | "audio"
}

interface AnalysisStep {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  duration: number
  // status: "pending" | "active" | "complete" // Remove this line
}

export function AnalysisAnimation({ isActive, onComplete, fileType }: AnalysisAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [steps, setSteps] = useState<AnalysisStep[]>([])

  useEffect(() => {
    const baseSteps: AnalysisStep[] = [
      {
        id: "preprocessing",
        label: "File Analysis",
        description: "Extracting metadata and preparing for analysis",
        icon: <FileText className="h-5 w-5" />,
        duration: 1000,
        // status: "pending", // Remove this line
      },
      {
        id: "ai-preprocessing",
        label: "AI Preprocessing",
        description: "Initializing neural networks and models",
        icon: <Brain className="h-5 w-5" />,
        duration: 1500,
        // status: "pending", // Remove this line
      },
      {
        id: "deepfake-detection",
        label: "Deepfake Detection",
        description: "Scanning for manipulation artifacts",
        icon: <Search className="h-5 w-5" />,
        duration: 2000,
        // status: "pending", // Remove this line
      },
    ]

    if (fileType === "image" || fileType === "video") {
      baseSteps.push({
        id: "facial-analysis",
        label: "Facial Analysis",
        description: "Analyzing facial features and consistency",
        icon: <Eye className="h-5 w-5" />,
        duration: 1800,
        // status: "pending", // Remove this line
      })
    }

    if (fileType === "video") {
      baseSteps.push({
        id: "temporal-verification",
        label: "Temporal Verification",
        description: "Checking frame-to-frame consistency",
        icon: <Clock className="h-5 w-5" />,
        duration: 2200,
        // status: "pending", // Remove this line
      })
    }

    baseSteps.push(
      {
        id: "frequency-analysis",
        label: "Frequency Analysis",
        description: "Examining digital signatures and patterns",
        icon: <Zap className="h-5 w-5" />,
        duration: 1600,
        // status: "pending", // Remove this line
      },
      {
        id: "final-verification",
        label: "Final Verification",
        description: "Compiling results and generating report",
        icon: <Shield className="h-5 w-5" />,
        duration: 1200,
        // status: "pending", // Remove this line
      },
    )

    setSteps(baseSteps)
  }, [fileType])

  useEffect(() => {
    if (!isActive || steps.length === 0) return

    let stepIndex = 0
    let progressValue = 0
    const totalSteps = steps.length
    const progressIncrement = 100 / totalSteps

    const runStep = () => {
      if (stepIndex >= totalSteps) {
        setProgress(100)
        setTimeout(() => {
          onComplete?.()
        }, 500)
        return
      }

      // REMOVE THE FOLLOWING BLOCK:
      // setSteps((prev) =>
      //   prev.map((step, index) => ({
      //     ...step,
      //     status: index < stepIndex ? "complete" : index === stepIndex ? "active" : "pending",
      //   })),
      // )

      setCurrentStep(stepIndex)

      // Animate progress for current step
      const stepDuration = steps[stepIndex].duration
      const progressStart = progressValue
      const progressEnd = progressStart + progressIncrement
      const startTime = Date.now()

      const animateProgress = () => {
        const elapsed = Date.now() - startTime
        const stepProgress = Math.min(elapsed / stepDuration, 1)
        const currentProgress = progressStart + (progressEnd - progressStart) * stepProgress

        setProgress(currentProgress)

        if (stepProgress < 1) {
          requestAnimationFrame(animateProgress)
        } else {
          progressValue = progressEnd
          stepIndex++
          setTimeout(runStep, 200)
        }
      }

      requestAnimationFrame(animateProgress)
    }

    runStep()
  }, [isActive, onComplete]) // Removed 'steps' from dependencies

  if (!isActive) return null

  return (
    <div className="border border-white/10 rounded-2xl p-8 bg-black/50 backdrop-blur-sm">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-light text-white mb-2">AI Analysis in Progress</h3>
        <p className="text-white/50 font-light">Advanced deepfake detection algorithms are analyzing your content</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-light text-white/60">Overall Progress</span>
          <span className="text-sm font-light text-white/80">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-white/5" />
      </div>

      {/* Analysis Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = index < currentStep ? "complete" : index === currentStep ? "active" : "pending" // Add this line
          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                status === "active" // Use the new 'status' variable
                  ? "border-white/20 bg-white/5"
                  : status === "complete"
                    ? "border-white/10 bg-white/[0.02]"
                    : "border-white/5 bg-transparent"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-500 ${
                  status === "active" // Use the new 'status' variable
                    ? "border-white/30 bg-white/10 text-white/90"
                    : status === "complete"
                      ? "border-white/20 bg-white/5 text-white/70"
                      : "border-white/10 bg-white/[0.02] text-white/40"
                }`}
              >
                {status === "complete" ? ( // Use the new 'status' variable
                  <CheckCircle className="h-5 w-5" />
                ) : status === "active" ? ( // Use the new 'status' variable
                  <div className="relative">
                    {step.icon}
                    <div className="absolute inset-0 animate-ping">{step.icon}</div>
                  </div>
                ) : (
                  step.icon
                )}
              </div>
              <div className="flex-1">
                <div
                  className={`font-light transition-all duration-500 ${
                    status === "active" // Use the new 'status' variable
                      ? "text-white text-base"
                      : status === "complete"
                        ? "text-white/80 text-base"
                        : "text-white/50 text-sm"
                  }`}
                >
                  {step.label}
                </div>
                <div
                  className={`text-sm font-light transition-all duration-500 ${
                    status === "active" // Use the new 'status' variable
                      ? "text-white/70"
                      : status === "complete"
                        ? "text-white/50"
                        : "text-white/30"
                  }`}
                >
                  {step.description}
                </div>
              </div>
              {status === "active" && ( // Use the new 'status' variable
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              )}
              {status === "complete" && <div className="text-white/40 text-xs font-light">Complete</div>}{" "}
              {/* Use the new 'status' variable */}
            </div>
          )
        })}
      </div>

      {/* Current Step Highlight */}
      {currentStep < steps.length && (
        <div className="mt-6 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="text-white/80 font-light text-sm">Currently Processing</div>
              <div className="text-white/60 font-light text-xs">{steps[currentStep]?.description}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
