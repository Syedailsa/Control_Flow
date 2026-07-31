"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  Users,
  Loader2,
  Flame,
  Thermometer,
  Snowflake,
  ArrowUpRight,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { LeadFormDialog } from "./lead-form-dialog"

interface Lead {
  id: string
  name: string | null
  email: string | null
  company: string | null
  industry: string | null
  score: number
  status: "HOT" | "WARM" | "COLD"
  leadSource: string | null
  appointmentStatus: string
  appointmentTime: string | null
  createdAt: string
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

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
      : score >= 50
      ? "bg-amber-100 text-amber-700"
      : "bg-gray-100 text-gray-500"
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold", color)}>
      {score}
    </span>
  )
}

function formatDate(date: string | null) {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [counts, setCounts] = useState({ hot: 0, warm: 0, cold: 0 })
  const [total, setTotal] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)

  async function fetchLeads() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (statusFilter !== "ALL") params.set("status", statusFilter)

      const res = await fetch(`/api/leads?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setLeads(data.leads)
        setTotal(data.total)
        setCounts(data.counts)
      }
    } catch {
      console.error("Failed to fetch leads")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(fetchLeads, 300)
    return () => clearTimeout(timeout)
  }, [search, statusFilter])

  useEffect(() => {
    fetchLeads()
  }, [])

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Leads</h1>
          <p className="text-gray-500 mt-1">
            {total} total leads · <span className="text-orange-600 font-medium">{counts.hot} hot</span> ·{" "}
            <span className="text-amber-600 font-medium">{counts.warm} warm</span> ·{" "}
            <span className="text-blue-600 font-medium">{counts.cold} cold</span>
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </motion.div>

      <Card className="border-orange-100">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, company, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 border-orange-200"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "ALL")}>
              <SelectTrigger className="w-full sm:w-40 border-orange-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="HOT">Hot</SelectItem>
                <SelectItem value="WARM">Warm</SelectItem>
                <SelectItem value="COLD">Cold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
            </div>
          ) : leads.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                No leads yet. Leads will appear here once your AI assistant starts qualifying.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {leads.map((lead) => (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-gray-100 hover:bg-orange-50/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {(lead.name || "?")?.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </div>
                            <div>
                              <p className="font-medium text-black text-sm">{lead.name || "Anonymous"}</p>
                              {lead.email && (
                                <p className="text-xs text-gray-500 truncate max-w-[180px]">{lead.email}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-700">{lead.company || "—"}</p>
                          {lead.industry && (
                            <p className="text-xs text-gray-400">{lead.industry}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={lead.status} />
                        </TableCell>
                        <TableCell>
                          <ScoreBadge score={lead.score} />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize text-gray-600">
                            {lead.leadSource || "unknown"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {formatDate(lead.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/leads/${lead.id}`}>
                            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                              <ArrowUpRight className="w-4 h-4" />
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <LeadFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={fetchLeads} />
    </div>
  )
}
