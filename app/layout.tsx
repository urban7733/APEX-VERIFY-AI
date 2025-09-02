import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Apex Verify AI - AI Deepfake Detection",
  description:
    "AI-powered deepfake detection and media authentication platform for creators, journalists, and digital professionals.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-black text-white overflow-x-hidden`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
