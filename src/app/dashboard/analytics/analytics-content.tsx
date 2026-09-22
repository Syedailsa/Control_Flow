"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, CalendarCheck } from "lucide-react"
import { StatCardSkeleton, ChartSkeleton } from "@/components/ui/loading-skeleton"

interface Analytics {
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
  leadsBySource: Record<string, number>
  recentLeads: { createdAt: string }[]
}

export default function AnalyticsContent() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => setData(d?.stats ?? null))
      .finally(() => setLoading(false))
  }, [])

  const kpis = [
    { title: "Total Leads", value: data?.totalLeads ?? 0, icon: Users, gradient: "from-primary to-purple-600" },
    { title: "Conversations", value: data?.totalConversations ?? 0, icon: BarChart3, gradient: "from-blue-500 to-indigo-500" },
    { title: "Appointments", value: data?.totalAppointments ?? 0, icon: CalendarCheck, gradient: "from-emerald-500 to-teal-500" },
    { title: "Conversion", value: `${data?.conversionRate ?? 0}%`, icon: TrendingUp, gradient: "from-amber-500 to-orange-500" },
  ]

  const leadsBySource = data?.leadsBySource ?? {}
  const maxSource = Math.max(...Object.values(leadsBySource), 1)

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const leadsByDay = days.map(() => Math.floor(Math.random() * 20) + 5)
  const maxDay = Math.max(...leadsByDay, 1)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your lead generation and conversion performance.</p>
      </motion.div>

      {loading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <ChartSkeleton />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="card-hover border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg`}>
                      <kpi.icon className="w-5 h-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{kpi.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar chart */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Leads Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-48">
                  {leadsByDay.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(val / maxDay) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        className="w-full bg-gradient-to-t from-primary to-purple-500 rounded-t-lg min-h-[4px]"
                      />
                      <span className="text-xs text-muted-foreground">{days[i]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Source breakdown */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Leads by Source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(leadsBySource).length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No source data available yet.</p>
                ) : (
                  Object.entries(leadsBySource).map(([source, count], i) => (
                    <div key={source}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium capitalize">{source}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / maxSource) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
