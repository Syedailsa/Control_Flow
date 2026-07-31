import { Suspense } from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import ChatPanel from "@/components/chat/ChatPanel"

export const metadata = {
  title: "Chat with CoachFlow AI",
  description: "Chat with our AI assistant to learn about coaching programs and book a free discovery call.",
}

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col">
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-700" />
            <span className="text-lg font-bold bg-gradient-to-r from-orange-700 to-amber-700 bg-clip-text text-transparent">
              CoachFlow AI
            </span>
          </Link>
          <Link href="/" className="text-sm font-medium text-orange-900 hover:underline">
            Home
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">
            Chat with{" "}
            <span className="bg-gradient-to-r from-orange-700 to-amber-700 bg-clip-text text-transparent">
              CoachFlow
            </span>
          </h1>
          <p className="text-gray-700 mt-1">
            Ask anything about our coaching programs, or book your free 30-minute discovery call.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="h-[calc(100vh-260px)] min-h-[480px] rounded-2xl border border-orange-100 bg-white flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
            </div>
          }
        >
          <ChatPanel fullPage />
        </Suspense>
      </main>
    </div>
  )
}
