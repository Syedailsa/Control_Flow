"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageCircle, CalendarCheck, TrendingUp, Loader2, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import type { Session } from "next-auth"

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
    transition: { staggerChildren: 0.1 },
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
      color: "from-orange-400 to-amber-400",
      sub: "All AI conversations",
    },
    {
      title: "Qualified Leads",
      value: stats?.totalLeads ?? 0,
      icon: Users,
      color: "from-amber-400 to-yellow-400",
      sub: `${stats?.hotLeads ?? 0} hot · ${stats?.warmLeads ?? 0} warm · ${stats?.coldLeads ?? 0} cold`,
    },
    {
      title: "Appointments Booked",
      value: stats?.totalAppointments ?? 0,
      icon: CalendarCheck,
      color: "from-orange-500 to-orange-400",
      sub: `${stats?.confirmedAppointments ?? 0} confirmed`,
    },
    {
      title: "Conversion Rate",
      value: stats ? `${stats.conversionRate}%` : "0%",
      icon: TrendingUp,
      color: "from-yellow-400 to-amber-300",
      sub: "Leads → booked calls",
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-black">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back{session.user?.name ? `, ${session.user.name}` : ""}! Here&apos;s your lead flow overview.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
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
                <Card className="border-orange-100 hover:shadow-lg hover:shadow-orange-100/30 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </CardTitle>
                    <div
                      className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                    >
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-black">{stat.value}</div>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      {stat.sub}
                      {stat.title === "Qualified Leads" && stats && stats.monthGrowth !== 0 && (
                        <span className="text-green-600 ml-2">
                          {stats.monthGrowth > 0 ? "+" : ""}{stats.monthGrowth}% this month
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
              <Card className="border-orange-100 hover:shadow-lg hover:shadow-orange-100/30 transition-all duration-300 h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-black">Qualified Leads</CardTitle>
                  <ArrowUpRight className="w-5 h-5 text-orange-400" />
                </CardHeader>
                <CardContent>
                  {stats && stats.totalLeads === 0 ? (
                    <div className="flex items-center justify-center h-40 text-gray-400">
                      No leads yet. Configure your AI assistant to get started.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-orange-600 font-medium">Hot ({stats?.hotLeads ?? 0})</span>
                          <span className="text-gray-400">Call ready</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-orange-50 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((stats?.hotLeads ?? 0) / Math.max(stats?.totalLeads ?? 1, 1)) * 100}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-amber-600 font-medium">Warm ({stats?.warmLeads ?? 0})</span>
                          <span className="text-gray-400">Needs nurturing</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-amber-50 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((stats?.warmLeads ?? 0) / Math.max(stats?.totalLeads ?? 1, 1)) * 100}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-blue-600 font-medium">Cold ({stats?.coldLeads ?? 0})</span>
                          <span className="text-gray-400">Not ready</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-blue-50 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((stats?.coldLeads ?? 0) / Math.max(stats?.totalLeads ?? 1, 1)) * 100}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full bg-blue-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/appointments">
              <Card className="border-orange-100 hover:shadow-lg hover:shadow-orange-100/30 transition-all duration-300 h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-black">Upcoming Appointments</CardTitle>
                  <ArrowUpRight className="w-5 h-5 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40 text-gray-400">
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
