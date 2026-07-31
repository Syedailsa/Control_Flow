"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  BookOpen,
  Settings,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { SessionProvider } from "next-auth/react"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const initials = session?.user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "C"

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-full bg-white border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-gradient-warm">CoachFlow</span>
          </Link>
        )}
        {collapsed && <Sparkles className="w-5 h-5 text-orange-500 mx-auto" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn("h-8 w-8", collapsed && "mx-auto mt-2")}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200"
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar className="h-8 w-8 border border-orange-200">
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black truncate">
                {session?.user?.name || "Coach"}
              </p>
              <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "w-full mt-2 text-gray-500 hover:text-red-500 hover:bg-red-50",
            collapsed && "px-0 justify-center"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </aside>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50/50">
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-border flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-gradient-warm text-sm">CoachFlow</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border transform transition-transform duration-300 lg:hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </div>

        <div className="hidden lg:block">
          <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        </div>

        <motion.main
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "transition-all duration-300 pt-14 lg:pt-0",
            sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
          )}
        >
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </motion.main>
      </div>
    </SessionProvider>
  )
}
