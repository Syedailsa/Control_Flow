"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatCardSkeleton } from "@/components/ui/loading-skeleton"
import EmptyState from "@/components/ui/empty-state"

interface Appointment {
  id: string
  leadId: string
  lead?: { name: string | null; email: string | null }
  startTime: string
  endTime: string
  status: string
  meetingLink: string | null
  notes: string | null
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  CONFIRMED: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  PENDING: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
  CANCELLED: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  COMPLETED: { icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
}

export default function AppointmentsContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming")

  useEffect(() => {
    fetch("/api/appointments")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAppointments(Array.isArray(data) ? data : data?.appointments ?? []))
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const upcoming = appointments.filter((a) => new Date(a.startTime) >= now && a.status !== "CANCELLED")
  const past = appointments.filter((a) => new Date(a.startTime) < now || a.status === "CANCELLED")
  const displayed = tab === "upcoming" ? upcoming : past

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold">Appointments</h1>
        <p className="text-muted-foreground mt-1">Manage your discovery calls and scheduled meetings.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-5 py-2 text-sm font-medium rounded-lg transition-all capitalize",
              tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t} ({t === "upcoming" ? upcoming.length : past.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={`No ${tab} appointments`}
          description={tab === "upcoming" ? "New appointments will appear here as they are booked." : "Past appointments will be listed here."}
        />
      ) : (
        <div className="space-y-3">
          {displayed.map((apt, i) => {
            const status = statusConfig[apt.status] || statusConfig.PENDING
            const StatusIcon = status.icon
            return (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="card-hover border-border/50">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${status.bg} flex items-center justify-center flex-shrink-0`}>
                        <StatusIcon className={`w-6 h-6 ${status.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{apt.lead?.name || "Unknown Lead"}</span>
                          <span className="text-xs text-muted-foreground">({apt.lead?.email || "no email"})</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(apt.startTime).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(apt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-medium px-3 py-1 rounded-full", status.bg, status.color)}>
                          {apt.status}
                        </span>
                        {apt.meetingLink && (
                          <a href={apt.meetingLink} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">Join</Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
