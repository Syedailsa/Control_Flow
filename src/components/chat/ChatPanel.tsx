"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { X, Send, Bot, User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi there! 👋 I'm CoachFlow, your personal coaching assistant. I can help you learn about our coaching programs, answer questions, and book a free discovery call with our coach. What would you like to know?",
  timestamp: new Date(),
}

interface ChatPanelProps {
  onClose?: () => void
  fullPage?: boolean
}

export default function ChatPanel({ onClose, fullPage = false }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [conversationCount, setConversationCount] = useState(0)
  const [hasQualified, setHasQualified] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionId) {
      const existing = sessionStorage.getItem("coachflow_session")
      if (existing) {
        setSessionId(existing)
      } else {
        const newSession =
          (typeof crypto !== "undefined" && crypto.randomUUID?.()) ||
          `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
        sessionStorage.setItem("coachflow_session", newSession)
        setSessionId(newSession)
      }
    }
  }, [sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    if (inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 300)
      return () => clearTimeout(t)
    }
  }, [])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const content = input.trim()
    if (!content || isTyping) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsTyping(true)

    const shouldQualify = conversationCount >= 3 && !hasQualified

    try {
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: content,
          history,
          qualify: shouldQualify,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to send message")

      if (data.sessionId) setSessionId(data.sessionId)

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (shouldQualify) {
        const emailCaptured = !!(data.qualification && data.qualification.email)
        if (emailCaptured) {
          setHasQualified(true)
          if (data.score) {
            setTimeout(() => {
              const scoreMsg: Message = {
                id: `score-${Date.now()}`,
                role: "assistant",
                content:
                  data.score.status === "HOT"
                    ? "🔥 Great news — based on what you've shared, you're a great fit for our coaching! I've sent you an email with a link to pick the best time for your free discovery call."
                    : data.score.status === "WARM"
                    ? "👍 Thanks for sharing those details! I've sent you an email with a link to pick the best time for your free discovery call."
                    : "Thank you for chatting with us today. Feel free to reach out anytime if you have more questions!",
                timestamp: new Date(),
              }
              setMessages((prev) => [...prev, scoreMsg])
            }, 800)
          }
        }
      }

      setConversationCount((c) => c + 1)
    } catch (err) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I hit a technical glitch. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-border bg-card",
        fullPage ? "h-[calc(100vh-220px)] min-h-[480px]" : "h-[500px] max-h-[70vh]"
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-purple-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <p className="text-white font-semibold">CoachFlow AI</p>
            <p className="text-white/80 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Online · Replies instantly
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors rounded-lg p-1 hover:bg-white/10"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-muted/30 to-background">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex gap-2.5",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1",
                  msg.role === "assistant"
                    ? "bg-gradient-to-br from-primary to-purple-600"
                    : "bg-muted"
                )}
              >
                {msg.role === "assistant" ? (
                  <Bot className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div
                className={cn(
                  "px-4 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[80%]",
                  msg.role === "assistant"
                    ? "bg-card border border-border rounded-tl-sm shadow-sm"
                    : "bg-gradient-to-r from-primary to-purple-600 text-white rounded-tr-sm"
                )}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-primary/40"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background placeholder:text-muted-foreground"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white flex items-center justify-center disabled:opacity-50 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </form>
    </div>
  )
}
