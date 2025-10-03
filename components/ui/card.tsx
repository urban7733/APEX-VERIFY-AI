import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "group relative overflow-hidden transition-all duration-500 hover-lift",
  {
    variants: {
      variant: {
        default: "glass-ultra border border-white/5 hover:border-white/10 hover-glow",
        glass: "glass-minimal border border-white/3 hover:border-white/8",
        plain: "bg-black/20 border border-white/5 hover:border-white/10",
        neon: "glass-ultra border border-white/10 glow-white hover:glow-cyan",
        minimal: "bg-transparent border border-white/2 hover:border-white/5",
        ultra: "glass-ultra border border-white/8 hover:border-white/15 hover:shadow-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
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
        "relative z-10 flex flex-col space-y-3 p-6 pb-4 transition-all duration-300",
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
        "text-lg md:text-xl font-light heading-ultra text-white/80 transition-all duration-300 group-hover:text-white",
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
        "text-sm font-light text-softer leading-relaxed",
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
        "relative z-10 px-6 pb-6 pt-2",
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
        "relative z-10 flex items-center px-6 pb-6 pt-4 border-t border-white/3",
        className,
      )}
      {...props}
    />
  ),
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
