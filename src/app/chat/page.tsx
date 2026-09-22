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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full bg-glass border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <AnimatedLogo size="sm" />
          </Link>
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Chat with{" "}
            <span className="text-gradient-brand">CoachFlow</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Ask anything about our coaching programs, or book your free 30-minute discovery call.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="h-[calc(100vh-260px)] min-h-[480px] rounded-2xl border border-border bg-card flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-muted border-t-primary animate-spin" />
            </div>
          }
        >
          <ChatPanel fullPage />
        </Suspense>
      </main>
    </div>
  )
}
