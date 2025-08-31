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
  const logoSize = size
  const padding = logoSize * 0.1

  ctx.save()

  // Draw the triangular Apex logo
  const centerX = x + logoSize / 2
  const centerY = y + logoSize / 2
  const triangleSize = logoSize * 0.8

  // 3D shadow effect
  if (options.is3D) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    drawTriangularLogo(ctx, centerX + 2, centerY + 2, triangleSize, "rgba(0, 0, 0, 0.3)")
  }

  // Main logo with transparency option
  const logoOpacity = options.transparent ? 0.8 : 1.0
  const logoColor = `rgba(220, 220, 220, ${logoOpacity})`
  drawTriangularLogo(ctx, centerX, centerY, triangleSize, logoColor)

  // Enhanced border for 3D effect
  if (options.is3D) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${logoOpacity * 0.6})`
    ctx.lineWidth = 2
    drawTriangularLogoOutline(ctx, centerX, centerY, triangleSize)
  }

  ctx.restore()
}

const drawTriangularLogo = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
  fillColor: string,
) => {
  const halfSize = size / 2
  const innerSize = size * 0.3

  ctx.fillStyle = fillColor

  // Outer triangle
  ctx.beginPath()
  ctx.moveTo(centerX, centerY - halfSize) // Top point
  ctx.lineTo(centerX - halfSize * 0.866, centerY + halfSize * 0.5) // Bottom left
  ctx.lineTo(centerX + halfSize * 0.866, centerY + halfSize * 0.5) // Bottom right
  ctx.closePath()

  // Create rounded corners effect
  ctx.lineJoin = "round"
  ctx.lineCap = "round"
  ctx.fill()

  // Inner triangle (cutout)
  ctx.globalCompositeOperation = "destination-out"
  ctx.beginPath()
  ctx.moveTo(centerX, centerY - innerSize) // Top point
  ctx.lineTo(centerX - innerSize * 0.866, centerY + innerSize * 0.5) // Bottom left
  ctx.lineTo(centerX + innerSize * 0.866, centerY + innerSize * 0.5) // Bottom right
  ctx.closePath()
  ctx.fill()

  ctx.globalCompositeOperation = "source-over"
}

const drawTriangularLogoOutline = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, size: number) => {
  const halfSize = size / 2
  const innerSize = size * 0.3

  ctx.lineJoin = "round"
  ctx.lineCap = "round"

  // Outer triangle outline
  ctx.beginPath()
  ctx.moveTo(centerX, centerY - halfSize)
  ctx.lineTo(centerX - halfSize * 0.866, centerY + halfSize * 0.5)
  ctx.lineTo(centerX + halfSize * 0.866, centerY + halfSize * 0.5)
  ctx.closePath()
  ctx.stroke()

  // Inner triangle outline
  ctx.beginPath()
  ctx.moveTo(centerX, centerY - innerSize)
  ctx.lineTo(centerX - innerSize * 0.866, centerY + innerSize * 0.5)
  ctx.lineTo(centerX + innerSize * 0.866, centerY + innerSize * 0.5)
  ctx.closePath()
  ctx.stroke()
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
