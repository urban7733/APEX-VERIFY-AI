import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "group relative overflow-hidden rounded-2xl transition-all duration-500",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-white/20 hover:shadow-3xl hover:scale-[1.02] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/[0.08] before:via-transparent before:to-white/[0.04] before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100 after:absolute after:inset-0 after:bg-gradient-to-t after:from-transparent after:via-transparent after:to-white/[0.02] after:opacity-0 after:transition-opacity after:duration-500 hover:after:opacity-100",
        glass: "glass-minimal shadow-xl border border-white/10 hover:border-white/15",
        plain: "bg-black/30 border border-white/10",
      },
    },
    defaultVariants: {
      variant: "glass",
    },
  },
)

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(cardVariants({ variant, className }))} {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative z-10 flex flex-col space-y-2 p-8 pb-6 transition-all duration-300 group-hover:translate-y-[-2px]",
        className,
      )}
      {...props}
    />
  ),
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-xl md:text-2xl font-light heading-tight text-white/90 transition-all duration-300 group-hover:text-white",
        className,
      )}
      {...props}
    />
  ),
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-sm font-light text-soft leading-relaxed",
        className,
      )}
      {...props}
    />
  ),
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative z-10 px-8 pb-8 pt-2",
        className,
      )}
      {...props}
    />
  ),
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative z-10 flex items-center px-8 pb-8 pt-4 border-t border-white/5",
        className,
      )}
      {...props}
    />
  ),
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
