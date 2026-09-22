"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnimatedLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  href?: string
  dark?: boolean
  animate?: boolean
}

export default function AnimatedLogo({ className, size = "md", href = "/", dark = false, animate = true }: AnimatedLogoProps) {
  const sizeClasses = {
    sm: "text-lg gap-1.5",
    md: "text-xl gap-2",
    lg: "text-2xl gap-2.5",
  }

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  const iconWrapperSizes = {
    sm: "p-1.5 rounded-lg",
    md: "p-1.5 rounded-lg",
    lg: "p-2 rounded-xl",
  }

  const LogoIcon = () => (
    <div className="relative">
      <motion.div
        initial={animate ? { scale: 0, rotate: -180 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="absolute inset-0 bg-gradient-to-r from-brand to-purple-500 rounded-lg blur-sm opacity-50"
      />
      <motion.div
        initial={animate ? { scale: 0, rotate: -180 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className={cn(
          "relative flex items-center justify-center",
          "bg-gradient-to-br from-brand to-purple-600 shadow-lg shadow-primary/25",
          iconWrapperSizes[size]
        )}
      >
        <Sparkles className={cn(iconSizes[size], "text-white")} />
      </motion.div>
    </div>
  )

  const LogoText = () => (
    <motion.span
      initial={animate ? { opacity: 0, x: -10 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className={cn(
        "font-bold tracking-tight",
        dark ? "text-white" : "text-foreground"
      )}
    >
      Coach<span className="text-gradient-brand">Flow</span>
    </motion.span>
  )

  const content = (
    <div className={cn("flex items-center", sizeClasses[size], className)}>
      <LogoIcon />
      <LogoText />
    </div>
  )

  if (href) {
    return <Link href={href} className="transition-opacity hover:opacity-80">{content}</Link>
  }

  return content
}
