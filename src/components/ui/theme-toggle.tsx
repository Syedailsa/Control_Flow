"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  variant?: "ghost" | "outline" | "default"
  size?: "default" | "sm" | "lg" | "icon"
}

export default function ThemeToggle({ className, variant = "ghost", size = "icon" }: ThemeToggleProps) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("coachflow-theme", next ? "dark" : "light")
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggle}
      className={cn("transition-colors", className)}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  )
}
