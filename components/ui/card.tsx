import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-500 hover:border-white/20 hover:shadow-3xl hover:scale-[1.02]",
      "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/[0.08] before:via-transparent before:to-white/[0.04] before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
      "after:absolute after:inset-0 after:bg-gradient-to-t after:from-transparent after:via-transparent after:to-white/[0.02] after:opacity-0 after:transition-opacity after:duration-500 hover:after:opacity-100",
      className,
    )}
    {...props}
  />
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
        "text-2xl font-light tracking-wide text-white/95 transition-all duration-300 group-hover:text-white group-hover:tracking-wider",
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
        "text-sm font-light text-white/60 leading-relaxed transition-all duration-300 group-hover:text-white/80",
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
        "relative z-10 px-8 pb-8 pt-2 transition-all duration-300 group-hover:translate-y-[-1px]",
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
        "relative z-10 flex items-center px-8 pb-8 pt-4 border-t border-white/5 transition-all duration-300 group-hover:border-white/10 group-hover:translate-y-[-1px]",
        className,
      )}
      {...props}
    />
  ),
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
