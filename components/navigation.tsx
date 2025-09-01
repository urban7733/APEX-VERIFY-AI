"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { AuthDialog } from "@/components/auth/auth-dialog"
import Image from "next/image"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignIn = () => {
    setAuthMode("login")
    setAuthDialogOpen(true)
  }

  const handleSignUp = () => {
    setAuthMode("signup")
    setAuthDialogOpen(true)
  }

  return (
    <>
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen ? "bg-black/90 backdrop-blur-sm border-b border-white/20" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Image src="/apex-verify-logo.png" alt="Apex Verify AI" width={32} height={32} className="w-8 h-8" />
            <span className="font-bold text-lg text-white">Apex Verify AI</span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={handleSignIn} className="text-white/80 hover:text-white hover:bg-white/10">
              Sign in
            </Button>
            <Button onClick={handleSignUp} className="bg-white hover:bg-white/90 text-black">
              Sign up
            </Button>
          </div>

          <button
            className="md:hidden text-white/80 hover:text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-sm border-b border-white/20">
            <div className="px-4 py-4 space-y-3">
              <a
                href="#features"
                className="block text-white/80 hover:text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block text-white/80 hover:text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="/deepfake-memory"
                className="block text-white/80 hover:text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Deepfake Memory
              </a>
              <div className="flex flex-col gap-2 pt-3 border-t border-white/20">
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleSignIn()
                    setIsMobileMenuOpen(false)
                  }}
                  className="justify-start text-white/80 hover:text-white hover:bg-white/10 w-full"
                >
                  Sign in
                </Button>
                <Button
                  onClick={() => {
                    handleSignUp()
                    setIsMobileMenuOpen(false)
                  }}
                  className="bg-white hover:bg-white/90 text-black w-full"
                >
                  Sign up
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultMode={authMode} />
    </>
  )
}
