"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnimatedLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  href?: string
  dark?: boolean
}

export default function AnimatedLogo({ className, size = "md", href = "/", dark = false }: AnimatedLogoProps) {
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

  const content = (
    <div className={cn("flex items-center", sizeClasses[size], className)}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand to-purple-500 rounded-lg blur-sm opacity-50 animate-glow-pulse" />
        <div className={cn(
          "relative flex items-center justify-center rounded-lg p-1.5",
          "bg-gradient-to-br from-brand to-purple-600"
        )}>
          <Sparkles className={cn(iconSizes[size], "text-white")} />
        </div>
      </div>
      <span className={cn(
        "font-bold tracking-tight",
        dark ? "text-white" : "text-foreground"
      )}>
        Coach<span className="text-gradient-brand">Flow</span>
      </span>
    </div>
  )

  if (href) {
    return <Link href={href} className="transition-opacity hover:opacity-80">{content}</Link>
  }

  return content
}
