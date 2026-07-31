"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, Plus, Search, Pencil, Trash2, Save, X, BookOpen, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface KBEntry {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  active: boolean
  createdAt: string
  updatedAt: string
}

const EMPTY_FORM = {
  question: "",
  answer: "",
  category: "general",
  tags: "",
  active: true,
}

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KBEntry[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  async function fetchEntries() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (categoryFilter !== "ALL") params.set("category", categoryFilter)

      const res = await fetch(`/api/knowledge-base?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setEntries(data.entries)
        setCategories(data.categories)
      }
    } catch {
      console.error("Failed to fetch entries")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(fetchEntries, 300)
    return () => clearTimeout(timeout)
  }, [search, categoryFilter])

  useEffect(() => {
    fetchEntries()
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(entry: KBEntry) {
    setEditingId(entry.id)
    setForm({
      question: entry.question,
      answer: entry.answer,
      category: entry.category,
      tags: entry.tags.join(", "),
      active: entry.active,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.question.trim() || !form.answer.trim()) return
    setSaving(true)
    try {
      const payload = {
        question: form.question,
        answer: form.answer,
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        active: form.active,
      }

      const url = editingId ? `/api/knowledge-base/${editingId}` : "/api/knowledge-base"
      const method = editingId ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setDialogOpen(false)
        fetchEntries()
      }
    } catch {
      console.error("Failed to save entry")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this knowledge base entry?")) return
    try {
      const res = await fetch(`/api/knowledge-base/${id}`, { method: "DELETE" })
      if (res.ok) fetchEntries()
    } catch {
      console.error("Failed to delete entry")
    }
  }

  async function toggleActive(entry: KBEntry) {
    try {
      const res = await fetch(`/api/knowledge-base/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !entry.active }),
      })
      if (res.ok) fetchEntries()
    } catch {
      console.error("Failed to toggle entry")
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Knowledge Base</h1>
          <p className="text-gray-500 mt-1">Manage FAQs that power your AI assistant</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </motion.div>

      <Card className="border-orange-100">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 border-orange-200"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "ALL")}>
              <SelectTrigger className="w-full sm:w-40 border-orange-200">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                No entries yet. Add FAQs to help your AI assistant answer visitor questions.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "p-4 rounded-xl border transition-colors",
                    entry.active ? "border-orange-100 bg-white" : "border-gray-200 bg-gray-50 opacity-60"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <h3 className="font-medium text-black text-sm">{entry.question}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 capitalize">
                          {entry.category}
                        </span>
                        {!entry.active && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{entry.answer}</p>
                      {entry.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <Tag className="w-3 h-3 text-gray-400" />
                          {entry.tags.map((tag) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(entry)}
                        className={cn(
                          entry.active ? "text-gray-500" : "text-green-600"
                        )}
                        title={entry.active ? "Deactivate" : "Activate"}
                      >
                        <span className="text-xs">{entry.active ? "Active" : "Draft"}</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(entry)} className="text-orange-600">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} className="text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black">
              {editingId ? "Edit Entry" : "Add Knowledge Base Entry"}
            </DialogTitle>
            <DialogDescription>
              These entries are injected into the AI's context to answer visitor questions accurately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="e.g. How much does coaching cost?"
                className="border-orange-200"
              />
            </div>
            <div className="space-y-2">
              <Label>Answer</Label>
              <Textarea
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="Provide a detailed, accurate answer..."
                className="min-h-[120px] border-orange-200"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v ?? "general" })}>
                  <SelectTrigger className="border-orange-200">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="pricing">Pricing</SelectItem>
                    <SelectItem value="booking">Booking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="pricing, cost, coaching"
                  className="border-orange-200"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.question.trim() || !form.answer.trim()}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {editingId ? "Save Changes" : "Add Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
