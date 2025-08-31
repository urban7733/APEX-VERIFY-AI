"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Upload, ArrowRight } from "lucide-react"
import Image from "next/image"
import { AuthDialog } from "@/components/auth/auth-dialog"

const backgroundPosts = [
  {
    id: 1,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ducati-YC2snvrNM91HgYXPIdJNgto9mYrQcS.jpeg", // Ducati motorcycle
    aspectRatio: "portrait",
  },
  {
    id: 2,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%285%29-OuqpDKQKYwEPMfUe1ZDFYkg1rfEwWP.jpeg", // LA cityscape with palm trees
    aspectRatio: "portrait",
  },
  {
    id: 3,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%286%29-7R0Zfp7EqCtQ55Bj6ac6tRLO7qnY67.jpeg", // Red McLaren supercar
    aspectRatio: "landscape",
  },
  {
    id: 4,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Golden%20Gate%20Bridge%20in%20San%20Francisco-SIRi9SeqhqXlDL8AbAk5ihT624q4SQ.jpeg", // Golden Gate Bridge
    aspectRatio: "landscape",
  },
  {
    id: 5,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%40pndloverrrr-I8MDnCRnxZ2SpKUfcwarqh92SHRr15.jpeg", // NYC night skyline
    aspectRatio: "portrait",
  },
  {
    id: 6,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/city%20at%20night-g1YGnAoUKviGRXMEwukfxKAPyxK50y.jpeg", // City balcony view
    aspectRatio: "portrait",
  },
  {
    id: 7,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ducati-YC2snvrNM91HgYXPIdJNgto9mYrQcS.jpeg", // Ducati motorcycle
    aspectRatio: "square",
  },
  {
    id: 8,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%285%29-OuqpDKQKYwEPMfUe1ZDFYkg1rfEwWP.jpeg", // LA cityscape
    aspectRatio: "landscape",
  },
  {
    id: 9,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%286%29-7R0Zfp7EqCtQ55Bj6ac6tRLO7qnY67.jpeg", // Red McLaren
    aspectRatio: "portrait",
  },
  {
    id: 10,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Golden%20Gate%20Bridge%20in%20San%20Francisco-SIRi9SeqhqXlDL8AbAk5ihT624q4SQ.jpeg", // Golden Gate Bridge
    aspectRatio: "square",
  },
  {
    id: 11,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%40pndloverrrr-I8MDnCRnxZ2SpKUfcwarqh92SHRr15.jpeg", // NYC night
    aspectRatio: "landscape",
  },
  {
    id: 12,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/city%20at%20night-g1YGnAoUKviGRXMEwukfxKAPyxK50y.jpeg", // City balcony
    aspectRatio: "portrait",
  },
  {
    id: 13,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ducati-YC2snvrNM91HgYXPIdJNgto9mYrQcS.jpeg", // Ducati motorcycle
    aspectRatio: "landscape",
  },
  {
    id: 14,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%285%29-OuqpDKQKYwEPMfUe1ZDFYkg1rfEwWP.jpeg", // LA cityscape
    aspectRatio: "square",
  },
  {
    id: 15,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_%20%286%29-7R0Zfp7EqCtQ55Bj6ac6tRLO7qnY67.jpeg", // Red McLaren
    aspectRatio: "portrait",
  },
]

export default function Home() {
  const router = useRouter()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")

  const handleFileUpload = () => {
    router.push("/verify")
  }

  const handleLogin = () => {
    setAuthMode("login")
    setAuthDialogOpen(true)
  }

  return (
    <div className="min-h-screen text-white antialiased relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 p-4">
          {backgroundPosts.map((post) => (
            <div key={post.id} className="break-inside-avoid mb-4">
              <div className="relative bg-white/5 rounded-2xl overflow-hidden">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt=""
                  width={400}
                  height={post.aspectRatio === "portrait" ? 600 : post.aspectRatio === "square" ? 400 : 300}
                  className="w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 z-0 bg-black/60" />

      <nav className="relative z-10 py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">Apex Verify AI</span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogin}
                className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-full text-white text-sm font-medium transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Log in</span>
              </button>
              <button
                onClick={() => router.push("/verify")}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-full text-white text-sm font-medium transition-all duration-200"
              >
                EXPLORE
              </button>
              <button
                onClick={() => router.push("/about")}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-full text-white text-sm font-medium transition-all duration-200"
              >
                Our Mission
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="text-center max-w-4xl mx-auto w-full space-y-8">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white leading-none tracking-tight">
            Apex Verify
          </h1>

          <div className="w-full max-w-2xl mx-auto">
            <div
              onClick={handleFileUpload}
              className="group relative w-full cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full overflow-hidden group-hover:bg-white/15 group-hover:border-white/30 transition-all duration-300 shadow-lg">
                <div className="flex items-center justify-between h-16 px-6">
                  <div className="flex items-center space-x-4">
                    <Upload className="w-5 h-5 text-white/60" />
                    <span className="text-white/60 text-lg">Upload image to verify authenticity...</span>
                  </div>
                  <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200">
                    <ArrowRight className="w-5 h-5 text-black" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-w-3xl mx-auto">
            <p className="text-white text-lg leading-relaxed">
              Apex Verify AI is the most advanced deepfake detection platform in the world.
            </p>
            <p className="text-white text-lg leading-relaxed">
              Protect yourself from AI-generated content with our cutting-edge verification technology.
            </p>
          </div>
        </div>
      </div>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultMode={authMode} />
    </div>
  )
}
