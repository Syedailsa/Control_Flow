"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Flame,
  Thermometer,
  Snowflake,
  Calendar,
  MessageCircle,
  Bot,
  User,
  Target,
  AlertTriangle,
  Users,
  Globe,
  DollarSign,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  role: string
  content: string
  createdAt: string
}

interface LeadDetail {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  company: string | null
  jobTitle: string | null
  industry: string | null
  monthlyRevenue: number | null
  businessGoals: string | null
  challenges: string | null
  budget: string | null
  timeframe: string | null
  leadSource: string | null
  score: number
  status: "HOT" | "WARM" | "COLD"
  qualificationData: Record<string, unknown> | null
  conversationSummary: string | null
  appointmentStatus: string
  appointmentTime: string | null
  createdAt: string
  conversations: Conversation[]
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    HOT: { icon: Flame, className: "bg-orange-100 text-orange-700 border-orange-200", label: "Hot" },
    WARM: { icon: Thermometer, className: "bg-amber-100 text-amber-700 border-amber-200", label: "Warm" },
    COLD: { icon: Snowflake, className: "bg-blue-100 text-blue-700 border-blue-200", label: "Cold" },
  }[status as "HOT" | "WARM" | "COLD"] ?? {
    icon: Users,
    className: "bg-gray-100 text-gray-600 border-gray-200",
    label: status,
  }
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", config.className)}>
      <config.icon className="w-3 h-3" />
      {config.label}
    </Badge>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-orange-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-800 mt-0.5 break-words">{value || "—"}</p>
      </div>
    </div>
  )
}

function formatDateTime(date: string | null) {
  if (!date) return "—"
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [lead, setLead] = useState<LeadDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/leads/${params.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setLead(data?.lead ?? null))
      .catch(() => setLead(null))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-bold text-black mb-2">Lead Not Found</h2>
        <p className="text-gray-500 mb-6">This lead may have been removed or you don't have access.</p>
        <Button onClick={() => router.push("/dashboard/leads")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Button>
      </div>
    )
  }

  const qualification = lead.qualificationData as Record<string, unknown> | null

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/leads")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-black">{lead.name || "Anonymous Lead"}</h1>
              <StatusBadge status={lead.status} />
            </div>
            <p className="text-gray-500 text-sm mt-0.5">
              Lead score: <span className="font-semibold text-orange-600">{lead.score}/100</span> · Added {formatDateTime(lead.createdAt)}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/appointments")}
          className="border-orange-200 text-orange-700 hover:bg-orange-50"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {lead.appointmentStatus === "CONFIRMED" ? "View Appointment" : "Book Appointment"}
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="text-lg text-black">Lead Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InfoItem icon={Mail} label="Email" value={lead.email ?? ""} />
                <InfoItem icon={Phone} label="Phone" value={lead.phone ?? ""} />
                <InfoItem icon={Building2} label="Company" value={lead.company ?? ""} />
                <InfoItem icon={Briefcase} label="Job Title" value={lead.jobTitle ?? ""} />
                <InfoItem icon={Users} label="Industry" value={lead.industry ?? ""} />
                <InfoItem icon={Globe} label="Lead Source" value={lead.leadSource ?? ""} />
                <InfoItem
                  icon={DollarSign}
                  label="Monthly Revenue"
                  value={lead.monthlyRevenue ? `$${lead.monthlyRevenue.toLocaleString()}` : ""}
                />
                <InfoItem icon={Clock} label="Timeframe" value={lead.timeframe ?? ""} />
              </div>
            </CardContent>
          </Card>

          {(lead.businessGoals || lead.challenges || lead.budget) && (
            <Card className="border-orange-100">
              <CardHeader>
                <CardTitle className="text-lg text-black flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  Business Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lead.businessGoals && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Business Goals</p>
                    <p className="text-sm text-gray-800">{lead.businessGoals}</p>
                  </div>
                )}
                {lead.challenges && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Current Challenges</p>
                    <p className="text-sm text-gray-800">{lead.challenges}</p>
                  </div>
                )}
                {lead.budget && (
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Budget</p>
                    <p className="text-sm text-gray-800">{lead.budget}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="text-lg text-black flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-orange-500" />
                Conversation Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lead.conversations.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No conversation recorded for this lead.
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {lead.conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={cn(
                        "flex gap-3",
                        conv.role === "assistant" ? "flex-row" : "flex-row-reverse"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          conv.role === "assistant"
                            ? "bg-gradient-to-br from-orange-400 to-amber-400"
                            : "bg-gray-200"
                        )}
                      >
                        {conv.role === "assistant" ? (
                          <Bot className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm max-w-[75%]",
                          conv.role === "assistant"
                            ? "bg-white border border-orange-100 rounded-tl-sm"
                            : "bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-sm"
                        )}
                      >
                        <p className="leading-relaxed">{conv.content}</p>
                        <p className={cn("text-[10px] mt-1.5", conv.role === "assistant" ? "text-gray-400" : "text-white/70")}>
                          {formatDateTime(conv.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="text-lg text-black">AI Qualification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 font-medium">Lead Score</span>
                  <span className="text-lg font-bold text-black">{lead.score}/100</span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${lead.score}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={cn(
                      "h-full rounded-full",
                      lead.score >= 80
                        ? "bg-gradient-to-r from-orange-500 to-amber-500"
                        : lead.score >= 50
                        ? "bg-gradient-to-r from-amber-400 to-yellow-400"
                        : "bg-gray-300"
                    )}
                  />
                </div>
              </div>

              {qualification?.needHumanHandoff === true && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">Human handoff requested — a coach should contact this lead personally.</p>
                </div>
              )}

              {lead.conversationSummary && (
                <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
                  <p className="text-xs text-orange-500 font-medium uppercase tracking-wide mb-1">AI Summary</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{lead.conversationSummary}</p>
                </div>
              )}

              {qualification && Object.keys(qualification).length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Extracted Data</p>
                  <div className="space-y-1.5">
                    {Object.entries(qualification)
                      .filter(([k, v]) => v !== null && v !== undefined && v !== "" && k !== "needHumanHandoff" && k !== "conversationSummary")
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between gap-2 text-sm">
                          <span className="text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                          </span>
                          <span className="text-gray-800 font-medium text-right">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="text-lg text-black">Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {lead.appointmentStatus === "CONFIRMED" || lead.appointmentStatus === "PENDING"
                      ? formatDateTime(lead.appointmentTime)
                      : "No appointment scheduled"}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{lead.appointmentStatus.toLowerCase()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
