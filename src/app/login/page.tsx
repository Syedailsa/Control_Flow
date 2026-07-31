"use client"

import { Suspense } from "react"
import { motion } from "framer-motion"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password")
      setLoading(false)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <Card className="border-orange-100 shadow-xl shadow-orange-100/50">
      <CardHeader>
        <CardTitle className="text-2xl text-black">Welcome Back</CardTitle>
        <CardDescription>Sign in to your CoachFlow dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="coach@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-orange-200 focus-visible:ring-orange-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-orange-200 focus-visible:ring-orange-400"
            />
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-warm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-orange-500" />
            <span className="text-2xl font-bold text-gradient-warm">CoachFlow AI</span>
          </Link>
        </div>

        <Suspense fallback={
          <Card className="border-orange-100 shadow-xl shadow-orange-100/50">
            <CardHeader>
              <CardTitle className="text-2xl text-black">Welcome Back</CardTitle>
              <CardDescription>Sign in to your CoachFlow dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            </CardContent>
          </Card>
        }>
          <LoginForm />
        </Suspense>
      </motion.div>
    </div>
  )
}
