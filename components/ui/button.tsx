"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { useState } from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  "data-download-type"?: "verified-media"
  "data-file-id"?: string
  "data-file-name"?: string
  "data-badge-position"?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  "data-badge-size"?: "small" | "medium" | "large"
}

interface WatermarkModalProps {
  isOpen: boolean
  onClose: () => void
  onDownload: (options: { transparent: boolean; is3D: boolean }) => void
  fileName: string
}

const WatermarkModal: React.FC<WatermarkModalProps> = ({ isOpen, onClose, onDownload, fileName }) => {
  const [transparent, setTransparent] = useState(false)
  const [is3D, setIs3D] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full">
        <h3 className="text-xl font-light text-white mb-6">Download Options</h3>
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-white focus:ring-white/20"
              />
              <span className="text-white/80 font-light">Transparent Background</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={is3D}
                onChange={(e) => setIs3D(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-white focus:ring-white/20"
              />
              <span className="text-white/80 font-light">3D Watermark Effect</span>
            </label>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-light transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onDownload({ transparent, is3D })
                onClose()
              }}
              className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-light transition-colors"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const handleVerifiedMediaDownload = async (
  fileId: string,
  options: { transparent: boolean; is3D: boolean } = { transparent: false, is3D: false },
  badgePosition: "top-left" | "top-right" | "bottom-left" | "bottom-right" = "bottom-right",
  badgeSize: "small" | "medium" | "large" = "medium",
) => {
  try {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    const fileElement = document.querySelector(`[data-file-id="${fileId}"]`)
    if (!fileElement) return

    if (fileElement.tagName === "IMG") {
      const img = fileElement as HTMLImageElement
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight

      // Draw the original image
      ctx.drawImage(img, 0, 0)

      // Determine badge size
      let actualBadgeSize
      switch (badgeSize) {
        case "small":
          actualBadgeSize = Math.min(canvas.width, canvas.height) * 0.1
          break
        case "medium":
          actualBadgeSize = Math.min(canvas.width, canvas.height) * 0.15
          break
        case "large":
          actualBadgeSize = Math.min(canvas.width, canvas.height) * 0.2
          break
        default:
          actualBadgeSize = Math.min(canvas.width, canvas.height) * 0.15
      }

      const padding = actualBadgeSize * 0.3

      let badgeX, badgeY
      switch (badgePosition) {
        case "bottom-right":
          badgeX = canvas.width - actualBadgeSize - padding
          badgeY = canvas.height - actualBadgeSize - padding
          break
        case "bottom-left":
          badgeX = padding
          badgeY = canvas.height - actualBadgeSize - padding
          break
        case "top-right":
          badgeX = canvas.width - actualBadgeSize - padding
          badgeY = padding
          break
        case "top-left":
          badgeX = padding
          badgeY = padding
          break
        default:
          badgeX = canvas.width - actualBadgeSize - padding
          badgeY = canvas.height - actualBadgeSize - padding
      }

      drawApexVerifyBadgeWithOptions(ctx, badgeX, badgeY, actualBadgeSize, options)
    }

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `verified-${fileId}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    }, "image/png")
  } catch (error) {
    console.error("Download failed:", error)
  }
}

const createVerificationBadge = () => {
  // This creates the glassmorphism badge design
  return {
    width: 120,
    height: 40,
    borderRadius: 20,
  }
}

const drawApexVerifyBadgeWithOptions = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  options: { transparent: boolean; is3D: boolean },
) => {
  const badgeWidth = size * 2.5
  const badgeHeight = size * 0.8
  const borderRadius = badgeHeight / 2

  ctx.save()

  // Background with optional transparency
  if (!options.transparent) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
    ctx.beginPath()
    ctx.roundRect(x, y, badgeWidth, badgeHeight, borderRadius)
    ctx.fill()
  }

  // 3D effect
  if (options.is3D) {
    // Shadow/depth effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.beginPath()
    ctx.roundRect(x + 2, y + 2, badgeWidth, badgeHeight, borderRadius)
    ctx.fill()

    // Highlight effect
    const gradient = ctx.createLinearGradient(x, y, x, y + badgeHeight)
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.3)")
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.1)")
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.roundRect(x, y, badgeWidth, badgeHeight, borderRadius)
    ctx.fill()
  }

  // Border
  ctx.strokeStyle = options.transparent ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.2)"
  ctx.lineWidth = options.is3D ? 2 : 1
  ctx.beginPath()
  ctx.roundRect(x, y, badgeWidth, badgeHeight, borderRadius)
  ctx.stroke()

  // Text with enhanced styling for 3D
  ctx.fillStyle = options.is3D ? "white" : "white"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  // "APEX VERIFY" text with shadow for 3D
  if (options.is3D) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.font = `bold ${badgeHeight * 0.3}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
    ctx.fillText("APEX VERIFY", x + badgeWidth / 2 + 1, y + badgeHeight * 0.35 + 1)
  }

  ctx.fillStyle = "white"
  ctx.font = `bold ${badgeHeight * 0.3}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.fillText("APEX VERIFY", x + badgeWidth / 2, y + badgeHeight * 0.35)

  // "AI Verified" subtitle with shadow for 3D
  if (options.is3D) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.font = `${badgeHeight * 0.2}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
    ctx.fillText("AI Verified", x + badgeWidth / 2 + 1, y + badgeHeight * 0.7 + 1)
  }

  ctx.fillStyle = "white"
  ctx.font = `${badgeHeight * 0.2}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.fillText("AI Verified", x + badgeWidth / 2, y + badgeHeight * 0.7)

  // Enhanced shield icon for 3D
  const iconSize = badgeHeight * 0.4
  const iconX = x + badgeHeight * 0.4
  const iconY = y + badgeHeight / 2

  if (options.is3D) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.beginPath()
    ctx.moveTo(iconX + 1, iconY - iconSize / 2 + 1)
    ctx.lineTo(iconX + iconSize / 3 + 1, iconY - iconSize / 2 + 1)
    ctx.lineTo(iconX + iconSize / 3 + 1, iconY + iconSize / 4 + 1)
    ctx.lineTo(iconX + 1, iconY + iconSize / 2 + 1)
    ctx.lineTo(iconX - iconSize / 3 + 1, iconY + iconSize / 4 + 1)
    ctx.lineTo(iconX - iconSize / 3 + 1, iconY - iconSize / 2 + 1)
    ctx.closePath()
    ctx.fill()
  }

  ctx.fillStyle = "white"
  ctx.beginPath()
  ctx.moveTo(iconX, iconY - iconSize / 2)
  ctx.lineTo(iconX + iconSize / 3, iconY - iconSize / 2)
  ctx.lineTo(iconX + iconSize / 3, iconY + iconSize / 4)
  ctx.lineTo(iconX, iconY + iconSize / 2)
  ctx.lineTo(iconX - iconSize / 3, iconY + iconSize / 4)
  ctx.lineTo(iconX - iconSize / 3, iconY - iconSize / 2)
  ctx.closePath()
  ctx.fill()

  // Enhanced checkmark for 3D
  const checkX = x + badgeWidth - badgeHeight * 0.4
  const checkY = y + badgeHeight / 2
  const checkSize = badgeHeight * 0.3

  if (options.is3D) {
    ctx.strokeStyle = "rgba(16, 185, 129, 0.5)"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(checkX - checkSize / 2 + 1, checkY + 1)
    ctx.lineTo(checkX - checkSize / 4 + 1, checkY + checkSize / 3 + 1)
    ctx.lineTo(checkX + checkSize / 2 + 1, checkY - checkSize / 3 + 1)
    ctx.stroke()
  }

  ctx.strokeStyle = "#10B981"
  ctx.lineWidth = options.is3D ? 3 : 2
  ctx.beginPath()
  ctx.moveTo(checkX - checkSize / 2, checkY)
  ctx.lineTo(checkX - checkSize / 4, checkY + checkSize / 3)
  ctx.lineTo(checkX + checkSize / 2, checkY - checkSize / 3)
  ctx.stroke()

  ctx.restore()
}

const drawApexVerifyBadge = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const badgeWidth = size * 2.5
  const badgeHeight = size * 0.8
  const borderRadius = badgeHeight / 2

  // Create glassmorphism effect
  ctx.save()

  // Background with transparency
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
  ctx.beginPath()
  ctx.roundRect(x, y, badgeWidth, badgeHeight, borderRadius)
  ctx.fill()

  // Border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
  ctx.lineWidth = 1
  ctx.stroke()

  // Text Styles
  ctx.fillStyle = "white"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  // "APEX VERIFY" text
  ctx.font = `bold ${badgeHeight * 0.3}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.fillText("APEX VERIFY", x + badgeWidth / 2, y + badgeHeight * 0.35)

  // "AI Verified" subtitle
  ctx.font = `${badgeHeight * 0.2}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.fillText("AI Verified", x + badgeWidth / 2, y + badgeHeight * 0.7)

  // Shield icon (simplified)
  const iconSize = badgeHeight * 0.4
  const iconX = x + badgeHeight * 0.4
  const iconY = y + badgeHeight / 2

  ctx.fillStyle = "white"
  ctx.beginPath()
  ctx.moveTo(iconX, iconY - iconSize / 2)
  ctx.lineTo(iconX + iconSize / 3, iconY - iconSize / 2)
  ctx.lineTo(iconX + iconSize / 3, iconY + iconSize / 4)
  ctx.lineTo(iconX, iconY + iconSize / 2)
  ctx.lineTo(iconX - iconSize / 3, iconY + iconSize / 4)
  ctx.lineTo(iconX - iconSize / 3, iconY - iconSize / 2)
  ctx.closePath()
  ctx.fill()

  // Checkmark
  const checkX = x + badgeWidth - badgeHeight * 0.4
  const checkY = y + badgeHeight / 2
  const checkSize = badgeHeight * 0.3

  ctx.strokeStyle = "#10B981"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(checkX - checkSize / 2, checkY)
  ctx.lineTo(checkX - checkSize / 4, checkY + checkSize / 3)
  ctx.lineTo(checkX + checkSize / 2, checkY - checkSize / 3)
  ctx.stroke()

  ctx.restore()
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const [showWatermarkModal, setShowWatermarkModal] = useState(false)
    const Comp = asChild ? Slot : "button"

    return (
      <>
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            "transition-transform hover:scale-105 active:scale-100",
            "font-bold tracking-tight",
            "bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-lg",
          )}
          ref={ref}
          {...props}
          onClick={(e) => {
            if (props.disabled) {
              e.preventDefault()
              return
            }

            // Handle download functionality with modal
            if (props["data-download-type"] === "verified-media") {
              e.preventDefault()
              setShowWatermarkModal(true)
              return
            }

            props.onClick?.(e)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              if (props.disabled) {
                e.preventDefault()
                return
              }

              if (props["data-download-type"] === "verified-media") {
                e.preventDefault()
                setShowWatermarkModal(true)
                return
              }

              props.onClick?.(e as any)
            }
            props.onKeyDown?.(e)
          }}
          role={asChild ? undefined : "button"}
          tabIndex={props.disabled ? -1 : (props.tabIndex ?? 0)}
          aria-disabled={props.disabled}
        />

        <WatermarkModal
          isOpen={showWatermarkModal}
          onClose={() => setShowWatermarkModal(false)}
          onDownload={(options) => {
            handleVerifiedMediaDownload(
              props["data-file-id"],
              options,
              props["data-badge-position"],
              props["data-badge-size"],
            )
          }}
          fileName={props["data-file-name"] || "file"}
        />
      </>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
