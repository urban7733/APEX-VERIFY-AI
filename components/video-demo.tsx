"use client"

import { useState } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

export function VideoDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState([23])
  const [volume, setVolume] = useState([75])

  return (
    <section className="px-6 py-24 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
          See Truth Intelligence in Action
        </h2>
        <p className="text-lg text-zinc-400 font-light max-w-2xl mx-auto">
          Watch how our AI-powered platform detects deepfakes and verifies media authenticity in real-time.
        </p>
      </div>

      <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden group hover:border-zinc-700 transition-colors duration-300">
        {/* Video Container */}
        <div className="relative aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900">
          {/* Video Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/placeholder.svg?height=600&width=1000"
              alt="Truth Intelligence Demo Video"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Truth Industries Trust Badge */}
          <div className="absolute top-6 right-6 z-10">
            <Badge className="bg-black/80 backdrop-blur-sm border border-zinc-700 text-white hover:bg-black/90 transition-all duration-300 px-4 py-2">
              <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
              <span className="font-medium">Verified by Truth Intelligence</span>
            </Badge>
          </div>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 rounded-full p-6"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
            </Button>
          </div>

          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider value={progress} onValueChange={setProgress} max={100} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>2:34</span>
                  <span>5:42</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-zinc-300 p-2"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:text-zinc-300 p-2"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="w-20" />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost" className="text-white hover:text-zinc-300 p-2">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Information */}
        <div className="p-6 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Deepfake Detection Demo</h3>
              <p className="text-sm text-zinc-400">Real-time analysis of media authenticity</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-zinc-700 text-white hover:bg-zinc-800">
                Watch Demo
              </Button>
              <Button size="sm" className="bg-white text-black hover:bg-zinc-200">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="text-center p-6 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors duration-300">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Real-time Analysis</h3>
          <p className="text-sm text-zinc-400 font-light">
            Get instant results with our advanced AI detection algorithms
          </p>
        </div>

        <div className="text-center p-6 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors duration-300">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Badge className="w-6 h-6 bg-transparent border-zinc-600 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Trust Badge</h3>
          <p className="text-sm text-zinc-400 font-light">Embed verification badges directly into your content</p>
        </div>

        <div className="text-center p-6 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors duration-300">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Volume2 className="h-6 w-6 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Multi-format Support</h3>
          <p className="text-sm text-zinc-400 font-light">
            Analyze images, videos, and audio files with equal precision
          </p>
        </div>
      </div>
    </section>
  )
}
