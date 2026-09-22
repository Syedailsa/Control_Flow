"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  children: React.ReactNode
}

export default function ShimmerButton({
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: ShimmerButtonProps) {
  const baseClasses = "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

  const variantClasses = {
    default: "bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
    outline: "border-2 border-primary/20 bg-transparent text-primary hover:bg-primary/5",
    ghost: "text-foreground hover:bg-muted",
    destructive: "bg-destructive text-white shadow-lg hover:bg-destructive/90",
  }

  const sizeClasses = {
    default: "h-10 px-6 py-2 text-sm",
    sm: "h-8 px-4 text-xs",
    lg: "h-12 px-8 text-base",
    icon: "h-10 w-10",
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...(props as Record<string, unknown>)}
    >
      {variant === "default" && (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  )
}
