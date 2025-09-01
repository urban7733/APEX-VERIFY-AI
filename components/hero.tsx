"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { AuthDialog } from "@/components/auth/auth-dialog"

export function Hero() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Minimal geometric background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-px h-96 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="absolute top-1/3 right-1/3 w-96 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute bottom-1/4 left-1/2 w-px h-64 bg-gradient-to-b from-transparent via-green-500/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Company Logo */}
          <div className="mb-12">
            <img
              src="/apex-verify-logo.png"
              alt="Apex Verify AI Logo"
              className="w-48 h-48 md:w-72 md:h-72 lg:w-96 lg:h-96 object-contain mx-auto"
            />
          </div>

          {/* Minimal status indicator */}
          <div className="inline-flex items-center gap-3 mb-16">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white/60 text-sm font-mono">LIVE</span>
            <div className="w-px h-4 bg-white/20" />
            <span className="text-white/60 text-sm font-mono">50K+ VERIFIED</span>
          </div>

          {/* Ultra minimal headline */}
          <div className="space-y-8 mb-16">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-thin tracking-tighter">
              <span className="block text-white">APEX</span>
              <span className="block text-white/40">VERIFY</span>
            </h1>

            <div className="w-24 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent mx-auto" />

            <p className="text-xl md:text-2xl text-white/70 font-light max-w-2xl mx-auto leading-relaxed">
              AI-powered authenticity verification
              <br />
              <span className="text-white/40">for the creator economy</span>
            </p>
          </div>

          {/* Minimal CTA */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Button
              onClick={() => setAuthDialogOpen(true)}
              className="bg-white text-black hover:bg-white/90 px-12 py-6 rounded-none font-mono text-sm tracking-wider border-0"
            >
              START VERIFICATION
            </Button>

            <Button
              variant="outline"
              className="border border-white/20 text-white hover:bg-white/5 px-12 py-6 rounded-none font-mono text-sm tracking-wider"
            >
              <Play className="mr-3 h-4 w-4" />
              WATCH DEMO
            </Button>
          </div>

          {/* Minimal stats grid */}
          <div className="grid grid-cols-3 gap-12 max-w-2xl mx-auto">
            {[
              { value: "99.9", unit: "%", label: "ACCURACY" },
              { value: "2.3", unit: "S", label: "SPEED" },
              { value: "10M", unit: "+", label: "VERIFIED" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-thin text-white mb-2">
                  {stat.value}
                  <span className="text-green-500">{stat.unit}</span>
                </div>
                <div className="text-xs text-white/40 font-mono tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  )
}
