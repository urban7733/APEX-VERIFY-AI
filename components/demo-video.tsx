"use client"

import { useState } from "react"
import { Play, Pause, Volume2, Maximize } from "lucide-react"

export function DemoVideo() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section className="py-32 px-6 relative">
      {/* Minimal section divider */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-16 bg-gradient-to-b from-white/20 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Minimal header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-2 h-2 bg-white/20 rounded-full" />
            <span className="text-white/60 text-sm font-mono tracking-wider">PRODUCT DEMO</span>
            <div className="w-2 h-2 bg-white/20 rounded-full" />
          </div>

          <h2 className="text-4xl md:text-6xl font-thin text-white mb-6">See It In Action</h2>

          <p className="text-white/60 text-lg font-light max-w-2xl mx-auto">
            Watch how Apex Verify detects deepfakes in real-time
          </p>
        </div>

        {/* Video container with minimal design */}
        <div className="relative group">
          <div className="aspect-video bg-black border border-white/10 relative overflow-hidden">
            {/* Placeholder video area */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 border border-white/20 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:border-white/40 transition-colors">
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white/80" />
                  ) : (
                    <Play className="w-8 h-8 text-white/80 ml-1" />
                  )}
                </div>
                <p className="text-white/60 font-mono text-sm">DEMO VIDEO</p>
              </div>
            </div>

            {/* Minimal video controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span className="font-mono text-sm">{isPlaying ? "PAUSE" : "PLAY"}</span>
                </button>

                <div className="flex items-center gap-4">
                  <Volume2 className="w-5 h-5 text-white/60" />
                  <Maximize className="w-5 h-5 text-white/60" />
                </div>
              </div>
            </div>
          </div>

          {/* Minimal progress indicator */}
          <div className="mt-6 flex justify-center">
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-px ${i <= 2 ? "bg-green-500" : "bg-white/20"} transition-colors duration-300`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
