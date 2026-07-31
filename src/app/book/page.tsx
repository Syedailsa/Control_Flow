import { Suspense } from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import BookForm from "./book-form"

export const metadata = {
  title: "Book a Discovery Call",
  description: "Pick a time that works best for your free 30-minute discovery call.",
}

export default function BookPage() {
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

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-10">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-orange-100 bg-white p-10 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
            </div>
          }
        >
          <BookForm />
        </Suspense>
      </main>
    </div>
  )
}
