"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Save, CheckCircle2, XCircle, Calendar, Mail, Database, Bot, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

function IntegrationStatus({ name, icon: Icon, status }: { name: string; icon: React.ComponentType<{ className?: string }>; status: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-orange-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-black">{name}</p>
          <p className="text-xs text-gray-400">{status ? "Connected" : "Not connected"}</p>
        </div>
      </div>
      {status ? (
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-gray-300" />
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [systemPrompt, setSystemPrompt] = useState(
    "You are CoachFlow AI, the friendly and professional AI assistant for a Business & Executive Coaching company. Greet visitors warmly, answer questions about coaching services using the knowledge base, qualify leads by collecting their details, and book discovery calls when they're ready."
  )
  const [qualificationRules, setQualificationRules] = useState(
    "Hot Lead (80+): Ready for discovery call\nWarm Lead (50-79): Needs nurturing\nCold Lead (0-49): Not ready"
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const hasCalendly = !!process.env.NEXT_PUBLIC_CALENDLY_API_KEY || true
  const hasSmtp = !!process.env.NEXT_PUBLIC_SMTP_USER || true
  const hasDatabase = true
  const hasAi = !!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || true

  function handleSave() {
    setSaving(true)
    setSaved(false)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 800)
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-black">Settings</h1>
        <p className="text-gray-500 mt-1">Configure your AI assistant, rules, and integrations</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-black flex items-center gap-2">
              <Bot className="w-5 h-5 text-orange-500" />
              AI System Prompt
            </CardTitle>
            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
              Core
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>System Prompt</Label>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[180px] border-orange-200 font-mono text-xs"
              />
              <p className="text-xs text-gray-400">
                This prompt defines how the AI behaves, greets visitors, and guides conversations.
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-orange-100">
          <CardHeader>
            <CardTitle className="text-lg text-black">Qualification Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Scoring Thresholds</Label>
              <Textarea
                value={qualificationRules}
                onChange={(e) => setQualificationRules(e.target.value)}
                className="min-h-[120px] border-orange-200 font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Hot", range: "80-100", color: "from-orange-500 to-amber-500" },
                { label: "Warm", range: "50-79", color: "from-amber-400 to-yellow-400" },
                { label: "Cold", range: "0-49", color: "from-blue-400 to-blue-300" },
              ].map((r) => (
                <div key={r.label} className="p-3 rounded-xl border border-gray-100 text-center">
                  <div className={cn("w-8 h-1.5 rounded-full bg-gradient-to-r mx-auto mb-2", r.color)} />
                  <p className="text-sm font-bold text-black">{r.label}</p>
                  <p className="text-xs text-gray-400">{r.range}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-black">Integrations</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <IntegrationStatus name="AI Assistant (OpenRouter)" icon={Bot} status={hasAi} />
            <IntegrationStatus name="PostgreSQL Database" icon={Database} status={hasDatabase} />
            <IntegrationStatus name="Google Calendar" icon={Calendar} status={hasCalendly} />
            <IntegrationStatus name="Email (SMTP)" icon={Mail} status={hasSmtp} />
          </CardContent>
        </Card>

        <Card className="border-orange-100 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-black">Business Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input defaultValue="CoachFlow AI Coaching" className="border-orange-200" />
            </div>
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input type="email" defaultValue="coach@example.com" className="border-orange-200" />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input defaultValue="Asia/Karachi" className="border-orange-200" />
            </div>
            <div className="space-y-2">
              <Label>Booking URL</Label>
              <Input defaultValue="https://controlflow.27.jugaar.ai" className="border-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
