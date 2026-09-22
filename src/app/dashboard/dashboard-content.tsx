"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageCircle, CalendarCheck, TrendingUp, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import type { Session } from "next-auth"
import { StatCardSkeleton } from "@/components/ui/loading-skeleton"

interface Stats {
  totalLeads: number
  monthLeads: number
  monthGrowth: number
  totalConversations: number
  totalAppointments: number
  confirmedAppointments: number
  conversionRate: number
  hotLeads: number
  warmLeads: number
  coldLeads: number
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function DashboardContent({ session }: { session: Session }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStats(data?.stats ?? null))
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    {
      title: "Total Conversations",
      value: stats?.totalConversations ?? 0,
      icon: MessageCircle,
      gradient: "from-primary to-purple-600",
      sub: "All AI conversations",
    },
    {
      title: "Qualified Leads",
      value: stats?.totalLeads ?? 0,
      icon: Users,
      gradient: "from-amber-500 to-orange-500",
      sub: `${stats?.hotLeads ?? 0} hot · ${stats?.warmLeads ?? 0} warm · ${stats?.coldLeads ?? 0} cold`,
      growth: stats?.monthGrowth,
    },
    {
      title: "Appointments Booked",
      value: stats?.totalAppointments ?? 0,
      icon: CalendarCheck,
      gradient: "from-emerald-500 to-teal-500",
      sub: `${stats?.confirmedAppointments ?? 0} confirmed`,
    },
    {
      title: "Conversion Rate",
      value: stats ? `${stats.conversionRate}%` : "0%",
      icon: TrendingUp,
      gradient: "from-blue-500 to-indigo-500",
      sub: "Leads → booked calls",
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{session.user?.name ? `, ${session.user.name}` : ""}! Here&apos;s your lead flow overview.
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {statCards.map((stat) => (
              <motion.div key={stat.title} variants={item}>
                <Card className="card-hover border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.sub}
                      {"growth" in stat && stat.growth !== undefined && stat.growth !== 0 && (
                        <span className="text-emerald-500 font-medium ml-2">
                          {stat.growth > 0 ? "+" : ""}{stat.growth}%
                        </span>
                      )}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Link href="/dashboard/leads">
              <Card className="card-hover border-border/50 h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Qualified Leads</CardTitle>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {stats && stats.totalLeads === 0 ? (
                    <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                      No leads yet. Configure your AI assistant to get started.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[
                        { label: "Hot", count: stats?.hotLeads ?? 0, color: "from-orange-500 to-red-500", bg: "bg-orange-500/10", text: "text-orange-500" },
                        { label: "Warm", count: stats?.warmLeads ?? 0, color: "from-amber-400 to-yellow-400", bg: "bg-amber-500/10", text: "text-amber-500" },
                        { label: "Cold", count: stats?.coldLeads ?? 0, color: "from-blue-400 to-cyan-400", bg: "bg-blue-500/10", text: "text-blue-500" },
                      ].map((lead) => (
                        <div key={lead.label}>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className={`font-medium ${lead.text}`}>{lead.label} ({lead.count})</span>
                            <span className="text-muted-foreground text-xs">
                              {lead.label === "Hot" ? "Call ready" : lead.label === "Warm" ? "Needs nurturing" : "Not ready"}
                            </span>
                          </div>
                          <div className={`h-2 rounded-full ${lead.bg} overflow-hidden`}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(lead.count / Math.max(stats?.totalLeads ?? 1, 1)) * 100}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full bg-gradient-to-r ${lead.color} rounded-full`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/appointments">
              <Card className="card-hover border-border/50 h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                    {stats && stats.totalAppointments > 0
                      ? `${stats.totalAppointments} appointment(s) scheduled`
                      : "No appointments scheduled yet."}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
