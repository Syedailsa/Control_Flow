import { Suspense } from "react"
import Link from "next/link"
import ChatPanel from "@/components/chat/ChatPanel"
import AnimatedLogo from "@/components/ui/animated-logo"

export const metadata = {
  title: "Chat with CoachFlow AI",
  description: "Chat with our AI assistant to learn about coaching programs and book a free discovery call.",
}

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
      {/* Top bar */}
      <header className="w-full bg-white border-b border-gray-200/80 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <AnimatedLogo size="sm" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI Assistant Online
            </span>
            <Link
              href="/"
              className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col">
        {/* Heading area */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold mb-3">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
            </svg>
            AI-POWERED ASSISTANT
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Chat with{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CoachFlow
            </span>
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm sm:text-base max-w-lg mx-auto">
            Ask about our coaching programs, pricing, or book your free 30-minute discovery call.
          </p>
        </div>

        {/* Chat panel */}
        <Suspense
          fallback={
            <div className="flex-1 rounded-2xl border border-gray-200 bg-white shadow-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 border-t-indigo-500 animate-spin" />
                <p className="text-sm text-gray-400 font-medium">Loading assistant...</p>
              </div>
            </div>
          }
        >
          <ChatPanel fullPage />
        </Suspense>
      </main>
    </div>
  )
}
