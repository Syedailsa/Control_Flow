"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalyticsData {
  stats: {
    totalLeads: number
    totalConversations: number
    totalAppointments: number
    confirmedAppointments: number
    conversionRate: number
    hotLeads: number
    warmLeads: number
    coldLeads: number
  }
  sources: { source: string; count: number }[]
  leadsOverTime: { date: string; count: number }[]
  statusBreakdown: { HOT: number; WARM: number; COLD: number }
}

function LeadsOverTimeChart({ data }: { data: { date: string; count: number }[] }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-400 py-20">No data yet</div>
  }

  const max = Math.max(...data.map((d) => d.count), 1)
  const labelEvery = Math.ceil(data.length / 7)

  return (
    <div className="h-64 flex flex-col justify-end gap-2">
      <div className="flex-1 flex items-end gap-1.5">
        {data.map((d, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${(d.count / max) * 100}%` }}
            transition={{ duration: 0.6, delay: i * 0.03 }}
            className="flex-1 rounded-t-md bg-gradient-to-t from-orange-500 to-amber-300 hover:from-orange-600 hover:to-amber-400 transition-colors min-w-[8px]"
            title={`${d.date}: ${d.count} lead(s)`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400">
        {data.map((d, i) =>
          i % labelEvery === 0 || i === data.length - 1 ? (
            <span key={i}>{d.date.slice(5)}</span>
          ) : null
        )}
      </div>
    </div>
  )
}

function SourceBreakdown({ data }: { data: { source: string; count: number }[] }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-400 py-20">No data yet</div>
  }

  const total = data.reduce((sum, s) => sum + s.count, 0)
  const colors = [
    "bg-gradient-to-r from-orange-500 to-amber-400",
    "bg-gradient-to-r from-amber-400 to-yellow-400",
    "bg-gradient-to-r from-orange-400 to-orange-300",
    "bg-gradient-to-r from-yellow-400 to-amber-300",
    "bg-gradient-to-r from-orange-600 to-orange-400",
  ]

  return (
    <div className="space-y-4">
      {data.map((s, i) => (
        <div key={s.source}>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-gray-600 capitalize font-medium">{s.source}</span>
            <span className="text-gray-800 font-semibold">
              {s.count} <span className="text-gray-400 font-normal text-xs">({Math.round((s.count / total) * 100)}%)</span>
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(s.count / total) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className={cn("h-full rounded-full", colors[i % colors.length])}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function FunnelChart({ data }: { data: { HOT: number; WARM: number; COLD: number } }) {
  const total = data.HOT + data.WARM + data.COLD
  if (total === 0) {
    return <div className="text-center text-gray-400 py-20">No data yet</div>
  }

  const stages = [
    { label: "Hot (call ready)", value: data.HOT, color: "from-orange-500 to-amber-500" },
    { label: "Warm (nurturing)", value: data.WARM, color: "from-amber-400 to-yellow-400" },
    { label: "Cold (not ready)", value: data.COLD, color: "from-blue-400 to-blue-300" },
  ]

  return (
    <div className="space-y-4">
      {stages.map((stage, i) => {
        const width = Math.max((stage.value / Math.max(total, 1)) * 100, 4)
        return (
          <div key={stage.label} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">{stage.label}</span>
              <span className="text-gray-800 font-semibold">{stage.value}</span>
            </div>
            <div className="h-9 rounded-lg bg-gray-100 overflow-hidden flex items-center">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className={cn("h-full rounded-lg bg-gradient-to-r", stage.color)}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
      </div>
    )
  }

  const stats = data?.stats

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-black">Analytics</h1>
        <p className="text-gray-500 mt-1">Track performance and conversions</p>
      </motion.div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: stats.totalLeads },
            { label: "Conversations", value: stats.totalConversations },
            { label: "Booked Calls", value: stats.totalAppointments },
            { label: "Conversion Rate", value: `${stats.conversionRate}%` },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="border-orange-100">
                <CardContent className="p-5">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl font-bold text-black mt-1">{s.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-orange-100">
          <CardHeader>
            <CardTitle className="text-lg text-black">Leads Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadsOverTimeChart data={data?.leadsOverTime ?? []} />
          </CardContent>
        </Card>

        <Card className="border-orange-100">
          <CardHeader>
            <CardTitle className="text-lg text-black">Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <SourceBreakdown data={data?.sources ?? []} />
          </CardContent>
        </Card>

        <Card className="border-orange-100 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-black">Qualification Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart data={data?.statusBreakdown ?? { HOT: 0, WARM: 0, COLD: 0 }} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
