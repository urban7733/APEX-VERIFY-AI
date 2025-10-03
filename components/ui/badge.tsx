import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-light transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-white/20 focus:ring-offset-1",
  {
    variants: {
      variant: {
        default: "border-white/20 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white",
        secondary: "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80",
        destructive: "border-red-400/20 bg-red-400/10 text-red-400 hover:bg-red-400/20",
        outline: "border-white/20 text-white/80 hover:bg-white/5",
        neon: "border-white/30 bg-white/10 text-white glow-white hover:glow-cyan",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
