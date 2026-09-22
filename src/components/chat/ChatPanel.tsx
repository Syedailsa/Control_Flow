"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles } from "lucide-react"
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
    "Welcome! 👋 I'm CoachFlow, your personal coaching assistant. I can help you learn about our coaching programs, answer questions, and book a free discovery call. How can I help you today?",
  timestamp: new Date(),
}

const QUICK_REPLIES = [
  "What coaching programs do you offer?",
  "How much does it cost?",
  "I'd like to book a discovery call",
]

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
  const [showQuickReplies, setShowQuickReplies] = useState(true)

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

  async function sendMessage(content: string) {
    if (!content.trim() || isTyping) return

    setShowQuickReplies(false)

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
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
          message: content.trim(),
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
                    ? "Great news — based on what you've shared, you're a great fit for our coaching! I've sent you an email with a link to pick the best time for your free discovery call."
                    : data.score.status === "WARM"
                    ? "Thanks for sharing those details! I've sent you an email with a link to pick the best time for your free discovery call."
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
        content: "I apologize for the inconvenience. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  function handleQuickReply(text: string) {
    sendMessage(text)
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-200/50",
        fullPage ? "flex-1 min-h-0" : "h-[500px] max-h-[70vh]"
      )}
    >
      {/* Chat header */}
      <div className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">CoachFlow AI</p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online — typically replies instantly
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1.5 hover:bg-gray-100"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#f8f9fc]">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={cn(
                "flex gap-2.5",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              {msg.role === "assistant" ? (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
              )}

              {/* Bubble */}
              <div className="flex flex-col gap-1 max-w-[75%]">
                <div
                  className={cn(
                    "px-4 py-2.5 text-sm leading-relaxed",
                    msg.role === "assistant"
                      ? "bg-white border border-gray-200 text-gray-700 rounded-2xl rounded-tl-md shadow-sm"
                      : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl rounded-tr-md shadow-sm shadow-indigo-200/50"
                  )}
                >
                  {msg.content}
                </div>
                <span
                  className={cn(
                    "text-[10px] text-gray-400 px-1",
                    msg.role === "user" ? "text-right" : "text-left"
                  )}
                >
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2, ease: "easeInOut" }}
                    className="w-2 h-2 rounded-full bg-indigo-400"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick replies */}
        {showQuickReplies && messages.length === 1 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 pl-10"
          >
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                onClick={() => handleQuickReply(reply)}
                className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-full px-3.5 py-2 transition-colors"
              >
                {reply}
              </button>
            ))}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-100 px-4 py-3">
        <form onSubmit={handleSend} className="flex items-center gap-2.5">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="submit"
            disabled={!input.trim() || isTyping}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
              input.trim() && !isTyping
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </form>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Powered by CoachFlow AI · Your conversation is private
        </p>
      </div>
    </div>
  )
}
