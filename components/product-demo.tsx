"use client"

import { useState } from "react"
import { Upload, CheckCircle, Zap, Brain, Shield } from "lucide-react"

export function ProductDemo() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    { id: "upload", label: "UPLOAD", icon: Upload },
    { id: "analyze", label: "ANALYZE", icon: Brain },
    { id: "verify", label: "VERIFY", icon: Shield },
    { id: "result", label: "RESULT", icon: CheckCircle },
  ]

  return (
    <section className="py-32 px-6 relative">
      {/* Minimal section divider */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-16 bg-gradient-to-b from-white/20 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Minimal header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-8">
            <Zap className="w-4 h-4 text-green-500" />
            <span className="text-white/60 text-sm font-mono tracking-wider">LIVE DEMO</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-thin text-white mb-6">Real-Time Detection</h2>
        </div>

        {/* Process steps */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setActiveStep(index)}
                  className={`flex flex-col items-center gap-3 p-4 transition-all duration-300 ${
                    activeStep === index ? "text-white" : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <div
                    className={`w-12 h-12 border rounded-full flex items-center justify-center transition-all duration-300 ${
                      activeStep === index ? "border-green-500 bg-green-500/10" : "border-white/20"
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono tracking-wider">{step.label}</span>
                </button>

                {index < steps.length - 1 && <div className="w-16 h-px bg-white/10 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Demo interface */}
        <div className="max-w-4xl mx-auto">
          <div className="border border-white/10 bg-black/50 backdrop-blur-sm">
            {/* Header */}
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <span className="text-white/60 font-mono text-sm">apex-verify.ai</span>
              </div>
            </div>

            {/* Content area */}
            <div className="p-12">
              {activeStep === 0 && (
                <div className="text-center">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-16 mb-6">
                    <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60 font-mono text-sm">DROP FILE OR CLICK TO UPLOAD</p>
                  </div>
                  <p className="text-white/40 text-sm">Supports video, audio, and image files</p>
                </div>
              )}

              {activeStep === 1 && (
                <div className="text-center">
                  <div className="relative">
                    <Brain className="w-16 h-16 text-green-500 mx-auto mb-6 animate-pulse" />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60 font-mono">Neural analysis</span>
                        <span className="text-green-500 font-mono">87%</span>
                      </div>
                      <div className="w-full bg-white/10 h-1">
                        <div className="bg-green-500 h-1 w-[87%] transition-all duration-1000" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="text-center">
                  <Shield className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                  <div className="space-y-4">
                    <p className="text-white/80 font-mono text-sm">VERIFICATION IN PROGRESS</p>
                    <div className="flex justify-center gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                  <div className="space-y-4">
                    <p className="text-green-500 font-mono text-lg">AUTHENTIC</p>
                    <p className="text-white/60 text-sm">Confidence: 99.7%</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-500 font-mono text-xs">VERIFIED</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Auto-advance indicator */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
            className="text-white/40 hover:text-white/60 font-mono text-xs tracking-wider transition-colors"
          >
            NEXT STEP →
          </button>
        </div>
      </div>
    </section>
  )
}
