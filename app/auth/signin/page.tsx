"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function SignInPage() {
  const GoogleIcon = (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.52 12.273c0-.851-.076-1.67-.217-2.455H12v4.64h6.48c-.28 1.5-1.12 2.773-2.384 3.622v3.01h3.852c2.252-2.074 3.572-5.128 3.572-8.817Z" fill="#4285F4" />
      <path d="M12 24c3.24 0 5.952-1.073 7.936-2.91l-3.852-3.01c-1.073.72-2.448 1.148-4.084 1.148-3.141 0-5.805-2.118-6.756-4.963H1.249v3.118C3.223 21.316 7.301 24 12 24Z" fill="#34A853" />
      <path d="M5.244 14.265c-.24-.72-.378-1.49-.378-2.265s.138-1.545.378-2.265V6.617H1.249A11.956 11.956 0 0 0 0 12c0 1.938.46 3.768 1.249 5.383l3.995-3.118Z" fill="#FBBC05" />
      <path d="M12 4.75c1.763 0 3.34.607 4.588 1.8l3.44-3.44C17.94 1.074 15.24 0 12 0 7.301 0 3.223 2.684 1.249 6.617l3.995 3.118C6.195 6.868 8.859 4.75 12 4.75Z" fill="#EA4335" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 text-center space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight">Sign in to Apex Verify AI</h1>
        <p className="text-white/60 text-sm">Use your Google account to continue. No additional sign-up required.</p>
        <Button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full h-12 bg-white text-black border border-black/10 hover:bg-white/90 text-base font-semibold shadow-sm"
        >
          <span className="flex items-center justify-center gap-3 text-black">
            {GoogleIcon}
            <span>Sign in with Google</span>
          </span>
        </Button>
      </div>
    </div>
  )
}

