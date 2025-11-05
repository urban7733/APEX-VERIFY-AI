"use client"

import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 text-center space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight">Sign in to Apex Verify AI</h1>
        <p className="text-white/60 text-sm">
          Continue with Google to access authenticity verification and save your trusted analysis history.
        </p>
        <Button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full bg-white text-black hover:bg-white/90 h-12 text-base font-semibold"
        >
          Continue with Google
        </Button>
      </div>
    </div>
  )
}

