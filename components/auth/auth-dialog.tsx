"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Mail, Lock, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultMode?: "login" | "signup"
}

export function AuthDialog({ open, onOpenChange, defaultMode = "login" }: AuthDialogProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })

  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate authentication API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create user object
      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name || formData.email.split("@")[0],
        email: formData.email,
      }

      // Set authentication state
      login(userData)

      console.log(`${mode} successful:`, userData)

      // Close dialog and redirect to verification app
      onOpenChange(false)
      router.push("/verify")
    } catch (error) {
      console.error("Authentication error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      // Simulate Google OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate Google user data
      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        name: "Google User",
        email: "user@gmail.com",
        image: "https://lh3.googleusercontent.com/a/default-user=s96-c",
      }

      login(userData)
      onOpenChange(false)
      router.push("/verify")
    } catch (error) {
      console.error("Google login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = (newMode: "login" | "signup") => {
    setMode(newMode)
    setFormData({ email: "", password: "", name: "" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black border-white/20 text-white rounded-xl mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white text-center px-2">
            {mode === "login" ? "Welcome back" : "Join Apex Verify AI"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 px-2">
          {/* Google Login - Mobile Optimized */}
          <Button
            variant="outline"
            disabled={isLoading}
            className="w-full bg-white/5 border-white/20 hover:bg-white/10 text-white rounded-lg h-11 sm:h-12 disabled:opacity-50 text-sm sm:text-base"
            onClick={handleGoogleLogin}
          >
            <svg className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="truncate">Continue with Google</span>
          </Button>

          {/* Divider - Mobile Optimized */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-white/60 text-xs">Or continue with email</span>
            </div>
          </div>

          {/* Form - Mobile Optimized */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80 text-sm sm:text-base">
                  Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 rounded-lg h-11 sm:h-12 text-sm sm:text-base"
                    required={mode === "signup"}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80 text-sm sm:text-base">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 rounded-lg h-11 sm:h-12 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80 text-sm sm:text-base">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 rounded-lg h-11 sm:h-12 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-white/90 rounded-lg h-11 sm:h-12 font-medium disabled:opacity-50 text-sm sm:text-base"
            >
              {isLoading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          {/* Switch Mode - Mobile Optimized */}
          <div className="text-center">
            <span className="text-white/60 text-xs sm:text-sm">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              className="ml-2 text-white hover:text-white/80 text-xs sm:text-sm font-medium"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
