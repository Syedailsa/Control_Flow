"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, MessageCircle, Sparkles, BarChart3, Calendar, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import ChatWidget from "@/components/chat/ChatWidget"

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
}

const features = [
  {
    icon: MessageCircle,
    title: "AI Chat Assistant",
    desc: "Engage prospects naturally with human-like conversation",
  },
  {
    icon: Sparkles,
    title: "Lead Qualification",
    desc: "Automatically score and classify leads as Hot, Warm, or Cold",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    desc: "Book discovery calls without back-and-forth emails",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Track conversations, conversions, and team performance",
  },
  {
    icon: Shield,
    title: "Human Handoff",
    desc: "Seamlessly escalate to your team when needed",
  },
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-gradient-warm">CoachFlow AI</span>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="flex-1">
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-warm">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-200 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-orange-200 mb-8"
              >
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">
                  AI-Powered Lead Qualification
                </span>
              </motion.div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-black mb-6 leading-tight">
                Never Miss a{" "}
                <span className="text-gradient-warm">Qualified Lead</span>
                {" "}Again
              </h1>

              <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-700 mb-10 leading-relaxed">
                CoachFlow AI automates lead qualification, answers FAQs, books
                discovery calls, and syncs your CRM — so you can focus on
                coaching, not admin work.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-200 px-8 py-6 text-lg"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-6 text-lg border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    See Features
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
                Everything You Need to{" "}
                <span className="text-gradient-warm">Scale</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                From first touch to booked call — CoachFlow handles the journey
                so your team only talks to qualified buyers.
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  className="group relative p-8 rounded-2xl border border-orange-100 bg-gradient-to-br from-white to-orange-50 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-gradient-warm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-black mb-6">
                Ready to Automate Your Lead Flow?
              </h2>
              <p className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
                Join coaches who save 20+ hours per week on lead qualification
                and double their conversion rates.
              </p>
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800 shadow-xl px-10 py-6 text-lg"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} CoachFlow AI. All rights reserved.
        </div>
      </footer>

      <ChatWidget />
    </div>
  )
}
