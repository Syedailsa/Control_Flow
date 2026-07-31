"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react"
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

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
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
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

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
        setHasQualified(true)
        if (data.score) {
          setTimeout(() => {
            const scoreMsg: Message = {
              id: `score-${Date.now()}`,
              role: "assistant",
              content:
                data.score.status === "HOT"
                  ? "🔥 Great news — based on what you've shared, you're a great fit for our coaching! I'd love to get you booked for a free discovery call."
                  : data.score.status === "WARM"
                  ? "👍 Thanks for sharing those details! You look like a strong candidate for our coaching programs. Would you like to book a free discovery call to explore options?"
                  : "Thank you for chatting with us today. Feel free to reach out anytime if you have more questions!",
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, scoreMsg])
          }, 800)
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
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm"
          >
            <div className="flex flex-col h-[500px] max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl shadow-orange-200/50 border border-orange-100 bg-white">
              <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-white font-semibold">CoachFlow AI</p>
                    <p className="text-white/80 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                      Online · Replies instantly
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-orange-50/50 to-white">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex gap-2.5",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                        msg.role === "assistant"
                          ? "bg-gradient-to-br from-orange-400 to-amber-400"
                          : "bg-gray-200"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <Bot className="w-4 h-4 text-white" />
                      ) : (
                        <User className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[80%]",
                        msg.role === "assistant"
                          ? "bg-white border border-orange-100 rounded-tl-sm shadow-sm"
                          : "bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-sm"
                      )}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-orange-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-orange-400"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="p-3 border-t border-orange-100 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/50 placeholder:text-gray-400"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center disabled:opacity-50 hover:from-orange-600 hover:to-amber-600 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center",
          "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400",
          "hover:shadow-orange-200 hover:shadow-2xl transition-shadow"
        )}
        aria-label="Chat with us"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="text-white"
            >
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="text-white"
            >
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}
