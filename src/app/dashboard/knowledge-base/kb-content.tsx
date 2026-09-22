"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BookOpen, Search, Plus, Tag, Edit2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { TableSkeleton } from "@/components/ui/loading-skeleton"
import EmptyState from "@/components/ui/empty-state"

interface KBEntry {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  active: boolean
}

const categoryColors: Record<string, string> = {
  general: "bg-primary/10 text-primary border-primary/20",
  services: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  pricing: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  booking: "bg-blue-500/10 text-blue-500 border-blue-500/20",
}

export default function KBContent() {
  const [entries, setEntries] = useState<KBEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<KBEntry | null>(null)
  const [form, setForm] = useState({ question: "", answer: "", category: "general", tags: "" })

  const fetchEntries = () => {
    fetch("/api/knowledge-base")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setEntries(Array.isArray(data) ? data : data?.entries ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEntries() }, [])

  const filtered = entries.filter((e) => {
    const matchSearch = !search || e.question.toLowerCase().includes(search.toLowerCase()) || e.answer.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === "all" || e.category === category
    return matchSearch && matchCat
  })

  function openCreate() {
    setEditing(null)
    setForm({ question: "", answer: "", category: "general", tags: "" })
    setDialogOpen(true)
  }

  function openEdit(entry: KBEntry) {
    setEditing(entry)
    setForm({ question: entry.question, answer: entry.answer, category: entry.category, tags: entry.tags.join(", ") })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) }
    if (editing) {
      await fetch(`/api/knowledge-base/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    } else {
      await fetch("/api/knowledge-base", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    }
    setDialogOpen(false)
    fetchEntries()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/knowledge-base/${id}`, { method: "DELETE" })
    fetchEntries()
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground mt-1">Manage FAQs that your AI assistant uses to answer questions.</p>
          </div>
          <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25">
            <Plus className="w-4 h-4 mr-2" /> Add Entry
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search knowledge base..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1 bg-muted p-1 rounded-xl">
          {["all", "general", "services", "pricing", "booking"].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize",
                category === c ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No entries found"
          description={search ? "Try adjusting your search." : "Add FAQ entries to help your AI assistant answer questions."}
          action={
            <Button onClick={openCreate} variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Add First Entry
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="card-hover border-border/50 h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-sm leading-relaxed flex-1">{entry.question}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(entry)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">{entry.answer}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={cn("text-xs", categoryColors[entry.category] || categoryColors.general)}>
                      {entry.category}
                    </Badge>
                    {entry.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Entry" : "New Entry"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Input placeholder="What question does this answer?" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Answer</Label>
              <Textarea placeholder="The answer the AI should give..." value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={4} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm">
                  <option value="general">General</option>
                  <option value="services">Services</option>
                  <option value="pricing">Pricing</option>
                  <option value="booking">Booking</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input placeholder="coaching, pricing, FAQ" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 text-white">
              {editing ? "Update Entry" : "Create Entry"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
