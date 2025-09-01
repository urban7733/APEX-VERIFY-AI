"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Copy, Check, Shield, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface VerificationBadgeProps {
  verified: boolean
  accuracy: number
  fileId: string
  fileType: "image" | "video" | "audio"
  onDownload?: () => void
}

export function VerificationBadge({ verified, accuracy, fileId, fileType, onDownload }: VerificationBadgeProps) {
  const [copied, setCopied] = useState(false)
  const [badgePosition, setBadgePosition] = useState<"bottom-right" | "bottom-left" | "top-right" | "top-left">(
    "bottom-right",
  )
  const [badgeSize, setBadgeSize] = useState<"small" | "medium" | "large">("medium")
  const [showPreview, setShowPreview] = useState(false)

  const copyBadgeCode = () => {
    const badgeCode = `<a href="${window.location.href}" target="_blank" rel="noopener noreferrer">
  <img src="${window.location.origin}/api/badge?id=${fileId}" 
       alt="Apex Verify AI Verified" width="200" height="70" />
</a>`

    navigator.clipboard.writeText(badgeCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadBadgeOnly = () => {
    // Create canvas for standalone badge
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size based on badge size
    const sizes = {
      small: { width: 160, height: 50 },
      medium: { width: 200, height: 70 },
      large: { width: 240, height: 90 },
    }

    const size = sizes[badgeSize]
    canvas.width = size.width
    canvas.height = size.height

    // Draw glassmorphic badge
    drawApexVerifyBadge(ctx, 0, 0, size.width, size.height)

    // Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `apex-verify-ai-badge-${badgeSize}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    }, "image/png")
  }

  const downloadWithBadge = () => {
    // This will be handled by the parent component
    onDownload?.()
  }

  if (!verified) {
    return (
      <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-3 py-1">
            <Shield className="h-3 w-3 mr-1" />
            Unverified
          </Badge>
          <span className="font-semibold text-lg">Verification Badge Unavailable</span>
        </div>
        <p className="text-white/80 text-sm mb-4 leading-relaxed">
          This content could not be verified with at least 95% accuracy. Current accuracy: {(accuracy * 100).toFixed(1)}
          %
        </p>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-sm text-white/70 leading-relaxed">
            All analysis information is still available, but the Apex Verify AI verification badge cannot be issued for
            content below our 95% accuracy threshold.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-3">
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
        <span className="font-semibold text-lg">Apex Verify AI Badge Available</span>
      </div>
      <p className="text-white/80 text-sm mb-6 leading-relaxed">
        This content has been verified with {(accuracy * 100).toFixed(1)}% accuracy, exceeding our 95% threshold.
      </p>

      {/* Badge Preview */}
      <div className="mb-6 p-6 bg-black/30 rounded-xl border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
        <div className="relative flex items-center justify-center h-20">
          <div className="glassmorphic-badge">
            <canvas
              ref={(canvas) => {
                if (canvas) {
                  const ctx = canvas.getContext("2d")
                  if (ctx) {
                    const size = sizes[badgeSize]
                    canvas.width = size.width
                    canvas.height = size.height
                    drawApexVerifyBadge(ctx, 0, 0, size.width, size.height)
                  }
                }
              }}
              className="max-w-full h-auto"
            />
          </div>
        </div>
        <div className="text-center mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className={`text-xs transition-all ${showPreview ? "button-selected" : "button-unselected"}`}
          >
            <Eye className="h-3 w-3 mr-1" />
            {showPreview ? "Hide" : "Preview on Media"}
          </Button>
        </div>
      </div>

      {/* Badge Customization */}
      <div className="space-y-4 mb-6">
        {/* Size Selection */}
        <div>
          <label className="text-sm text-white/70 block mb-2 font-medium">Badge Size</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "small", label: "Small", size: "160×50" },
              { value: "medium", label: "Medium", size: "200×70" },
              { value: "large", label: "Large", size: "240×90" },
            ].map((size) => (
              <Button
                key={size.value}
                variant="ghost"
                size="sm"
                onClick={() => setBadgeSize(size.value as any)}
                className={`text-xs justify-center flex-col h-auto py-2 transition-all ${
                  badgeSize === size.value ? "badge-option-selected" : "badge-option-unselected"
                }`}
              >
                <span className="font-medium">{size.label}</span>
                <span className="text-white/50 text-xs">{size.size}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Position Selection (for embedded badge) */}
        <div>
          <label className="text-sm text-white/70 block mb-2 font-medium">Badge Position (for embedded)</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "bottom-right", label: "Bottom Right" },
              { value: "bottom-left", label: "Bottom Left" },
              { value: "top-right", label: "Top Right" },
              { value: "top-left", label: "Top Left" },
            ].map((position) => (
              <Button
                key={position.value}
                variant="ghost"
                size="sm"
                onClick={() => setBadgePosition(position.value as any)}
                className={`text-xs justify-start transition-all ${
                  badgePosition === position.value ? "badge-option-selected" : "badge-option-unselected"
                }`}
              >
                {position.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Download Actions */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 transition-all transform hover:scale-[1.02]"
            onClick={downloadBadgeOnly}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Badge Only
          </Button>
          <Button
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0 transition-all transform hover:scale-[1.02]"
            onClick={downloadWithBadge}
          >
            <Download className="h-4 w-4 mr-2" />
            Download with Badge
          </Button>
        </div>

        <Button
          variant="outline"
          className="border-white/20 hover:bg-white/10 w-full backdrop-blur-sm transition-all"
          onClick={copyBadgeCode}
        >
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? "Copied!" : "Copy Badge HTML"}
        </Button>
      </div>

      {/* Badge Info */}
      <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <p className="text-xs text-white/60 leading-relaxed">
          The Apex Verify AI badge proves your content's authenticity and builds trust with your audience. The badge
          links back to this verification page for transparency.
        </p>
      </div>
    </div>
  )
}

// Helper function to draw the glassmorphic Apex Verify AI badge
const drawApexVerifyBadge = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
  ctx.save()

  // Create gradient background
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height)
  gradient.addColorStop(0, "rgba(59, 130, 246, 0.15)") // Blue
  gradient.addColorStop(0.5, "rgba(147, 51, 234, 0.15)") // Purple
  gradient.addColorStop(1, "rgba(16, 185, 129, 0.15)") // Green

  // Main badge background with glassmorphism
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, height * 0.25)
  ctx.fill()

  // Gradient overlay
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, height * 0.25)
  ctx.fill()

  // Border with gradient
  const borderGradient = ctx.createLinearGradient(x, y, x + width, y + height)
  borderGradient.addColorStop(0, "rgba(255, 255, 255, 0.3)")
  borderGradient.addColorStop(1, "rgba(255, 255, 255, 0.1)")

  ctx.strokeStyle = borderGradient
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, height * 0.25)
  ctx.stroke()

  // Shield icon
  const iconSize = height * 0.35
  const iconX = x + height * 0.4
  const iconY = y + height / 2

  ctx.fillStyle = "rgba(59, 130, 246, 0.9)" // Blue
  ctx.beginPath()
  ctx.moveTo(iconX, iconY - iconSize / 2)
  ctx.lineTo(iconX + iconSize / 3, iconY - iconSize / 2)
  ctx.lineTo(iconX + iconSize / 3, iconY + iconSize / 4)
  ctx.lineTo(iconX, iconY + iconSize / 2)
  ctx.lineTo(iconX - iconSize / 3, iconY + iconSize / 4)
  ctx.lineTo(iconX - iconSize / 3, iconY - iconSize / 2)
  ctx.closePath()
  ctx.fill()

  // Checkmark in shield
  const checkSize = iconSize * 0.4
  ctx.strokeStyle = "white"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(iconX - checkSize / 3, iconY)
  ctx.lineTo(iconX - checkSize / 6, iconY + checkSize / 3)
  ctx.lineTo(iconX + checkSize / 3, iconY - checkSize / 3)
  ctx.stroke()

  // Main text
  const fontSize = height * 0.22
  ctx.fillStyle = "white"
  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.textAlign = "left"
  ctx.textBaseline = "middle"

  const textX = iconX + iconSize * 0.8
  ctx.fillText("APEX VERIFY", textX, iconY - fontSize * 0.3)

  // Subtitle
  const subtitleSize = height * 0.16
  ctx.font = `400 ${subtitleSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
  ctx.fillText("AI Verified", textX, iconY + fontSize * 0.4)

  // Verification mark
  const verifyX = x + width - height * 0.3
  const verifyY = y + height / 2
  const verifySize = height * 0.25

  ctx.fillStyle = "rgba(16, 185, 129, 0.9)" // Green
  ctx.beginPath()
  ctx.arc(verifyX, verifyY, verifySize / 2, 0, Math.PI * 2)
  ctx.fill()

  // Checkmark
  ctx.strokeStyle = "white"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(verifyX - verifySize / 4, verifyY)
  ctx.lineTo(verifyX - verifySize / 8, verifyY + verifySize / 4)
  ctx.lineTo(verifyX + verifySize / 4, verifyY - verifySize / 4)
  ctx.stroke()

  ctx.restore()
}

// Size configurations
const sizes = {
  small: { width: 160, height: 50 },
  medium: { width: 200, height: 70 },
  large: { width: 240, height: 90 },
}
