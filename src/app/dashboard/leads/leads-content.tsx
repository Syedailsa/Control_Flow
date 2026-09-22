"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Users, Search, Plus, Mail, Phone, Building2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { TableSkeleton } from "@/components/ui/loading-skeleton"
import EmptyState from "@/components/ui/empty-state"

interface Lead {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  company: string | null
  score: number
  status: string
  sessionId: string | null
  createdAt: string
}

const statusColors: Record<string, string> = {
  HOT: "bg-red-500/10 text-red-500 border-red-500/20",
  WARM: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  COLD: "bg-blue-500/10 text-blue-500 border-blue-500/20",
}

export default function LeadsContent() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", jobTitle: "", industry: "" })

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setLeads(Array.isArray(data) ? data : data?.leads ?? []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = leads.filter((l) => {
    const matchSearch = !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase()) || l.company?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "ALL" || l.status === filter
    return matchSearch && matchFilter
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setDialogOpen(false)
    setForm({ name: "", email: "", phone: "", company: "", jobTitle: "", industry: "" })
    setLoading(true)
    fetch("/api/leads")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setLeads(Array.isArray(data) ? data : data?.leads ?? []))
      .finally(() => setLoading(false))
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Leads</h1>
            <p className="text-muted-foreground mt-1">Manage and track your qualified leads.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <Button className="bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25">
                <Plus className="w-4 h-4 mr-2" /> Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-4">
                {[
                  { key: "name", label: "Name", placeholder: "John Doe" },
                  { key: "email", label: "Email", placeholder: "john@example.com", type: "email" },
                  { key: "phone", label: "Phone", placeholder: "+1 234 567 890" },
                  { key: "company", label: "Company", placeholder: "Acme Corp" },
                  { key: "jobTitle", label: "Job Title", placeholder: "CEO" },
                  { key: "industry", label: "Industry", placeholder: "Technology" },
                ].map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <Input
                      id={field.key}
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      value={form[field.key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    />
                  </div>
                ))}
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 text-white">Create Lead</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 bg-muted p-1 rounded-xl">
          {["ALL", "HOT", "WARM", "COLD"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads found"
          description={search ? "Try adjusting your search or filter criteria." : "Leads will appear here as your AI assistant qualifies them."}
        />
      ) : (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Lead</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Company</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3 hidden md:table-cell">Score</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                            {lead.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{lead.name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{lead.email || "No email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">{lead.company || "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn("text-xs font-medium", statusColors[lead.status])}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                              style={{ width: `${lead.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">{lead.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/dashboard/leads/${lead.id}`}>
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">View</Button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
