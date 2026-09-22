import { Suspense } from "react"
import Link from "next/link"
import AnimatedLogo from "@/components/ui/animated-logo"
import BookForm from "./book-form"

export const metadata = {
  title: "Book a Discovery Call — CoachFlow AI",
  description: "Book a free 30-minute discovery call with our coaching team.",
}

export default function BookPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full bg-glass border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <AnimatedLogo size="sm" />
          </Link>
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-border bg-card h-96 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-muted border-t-primary animate-spin" />
            </div>
          }
        >
          <BookForm />
        </Suspense>
      </main>
    </div>
  )
}
