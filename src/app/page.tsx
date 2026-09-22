"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { useRef } from "react"
import {
  ArrowRight,
  MessageCircle,
  Sparkles,
  BarChart3,
  Calendar,
  Shield,
  Zap,
  ChevronDown,
  Bot,
  Clock,
  Target,
} from "lucide-react"
import ShimmerButton from "@/components/ui/shimmer-button"
import GlowCard from "@/components/ui/glow-card"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
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
    desc: "Engage prospects naturally with human-like conversation that qualifies and converts — 24/7.",
    gradient: "from-indigo-500 to-purple-600",
    number: "01",
  },
  {
    icon: Sparkles,
    title: "Smart Lead Scoring",
    desc: "Automatically score leads as Hot, Warm, or Cold based on conversation intelligence.",
    gradient: "from-amber-500 to-orange-500",
    number: "02",
  },
  {
    icon: Calendar,
    title: "Instant Booking",
    desc: "Book discovery calls directly from chat — no back-and-forth emails needed.",
    gradient: "from-emerald-500 to-teal-500",
    number: "03",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    desc: "Track conversations, conversion rates, and team performance in one dashboard.",
    gradient: "from-blue-500 to-indigo-500",
    number: "04",
  },
  {
    icon: Shield,
    title: "Human Handoff",
    desc: "Seamlessly escalate complex queries to your team when the AI detects the need.",
    gradient: "from-rose-500 to-pink-500",
    number: "05",
  },
  {
    icon: Zap,
    title: "Knowledge Base",
    desc: "Feed your FAQs and the AI searches them instantly to answer visitor questions.",
    gradient: "from-violet-500 to-purple-500",
    number: "06",
  },
]

const steps = [
  {
    step: "01",
    title: "Visitor Lands on Your Site",
    desc: "The AI chat widget greets them instantly with a personalized message.",
    icon: Target,
  },
  {
    step: "02",
    title: "AI Qualifies the Lead",
    desc: "Natural conversation extracts key info: needs, budget, timeline, and decision role.",
    icon: Bot,
  },
  {
    step: "03",
    title: "Book & Convert",
    desc: "Qualified leads book a discovery call on your Google Calendar — automatically.",
    icon: Clock,
  },
]

const stats = [
  { value: "500+", label: "Coaches Using CoachFlow" },
  { value: "50k+", label: "Leads Qualified" },
  { value: "2.5x", label: "Higher Conversion Rate" },
  { value: "20+", label: "Hours Saved Per Week" },
]

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section — Dark background */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[oklch(0.13_0.025_270)]">
          {/* Animated gradient background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.25_0.08_270)] via-[oklch(0.18_0.04_290)] to-[oklch(0.12_0.03_270)]" />
            <div className="absolute inset-0 animate-gradient-shift" style={{
              backgroundSize: "200% 200%",
              background: "linear-gradient(135deg, oklch(0.25 0.08 270 / 0.8) 0%, oklch(0.18 0.04 290 / 0.6) 50%, oklch(0.12 0.03 270 / 0.8) 100%)",
            }} />
          </div>

          {/* Floating orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/6 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ y: [10, -30, 10] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/3 right-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"
            />
          </div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />

          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 shadow-sm mb-8"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-white/80">
                  AI-Powered Lead Qualification
                </span>
              </motion.div>

              {/* Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-white">
                Never Miss a{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                  Qualified Lead
                </span>
                {" "}Again
              </h1>

              <p className="max-w-2xl mx-auto text-lg sm:text-xl text-white/60 mb-10 leading-relaxed">
                CoachFlow AI automates lead qualification, answers FAQs, books
                discovery calls, and syncs your CRM — so you can focus on
                coaching, not admin work.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login">
                  <ShimmerButton size="lg" className="px-8 py-6 text-lg bg-white text-[oklch(0.13_0.025_270)] hover:bg-white/90 shadow-2xl shadow-white/10">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </ShimmerButton>
                </Link>
                <Link href="#features">
                  <ShimmerButton variant="outline" size="lg" className="px-8 py-6 text-lg border-white/20 text-white hover:bg-white/10">
                    See Features
                  </ShimmerButton>
                </Link>
              </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ChevronDown className="w-6 h-6 text-white/30" />
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-y border-white/10 bg-[oklch(0.15_0.03_270)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  className="text-center"
                >
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">{stat.value}</div>
                  <p className="text-sm text-white/50 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section — 21st.dev bento style */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4"
              >
                <Sparkles className="w-3 h-3" />
                FEATURES
              </motion.div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Everything You Need to{" "}
                <span className="text-gradient-brand">Scale</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From first touch to booked call — CoachFlow handles the journey
                so your team only talks to qualified buyers.
              </p>
            </motion.div>

            {/* Bento grid — 2 col large + 1 col small pattern */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <GlowCard className="h-full group relative overflow-hidden">
                    {/* Number watermark */}
                    <div className="absolute -top-4 -right-2 text-8xl font-black text-primary/[0.03] select-none pointer-events-none">
                      {feature.number}
                    </div>
                    <div className="relative z-10">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  </GlowCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4"
              >
                <Zap className="w-3 h-3" />
                HOW IT WORKS
              </motion.div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                How It <span className="text-gradient-brand">Works</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to automate your entire lead flow.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

              {steps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative text-center"
                >
                  <div className="relative inline-flex mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/25">
                      <step.icon className="w-7 h-7" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 gradient-brand opacity-90" />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }} />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Automate Your Lead Flow?
              </h2>
              <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
                Join coaches who save 20+ hours per week on lead qualification
                and double their conversion rates.
              </p>
              <Link href="/login">
                <ShimmerButton size="lg" className="bg-white text-primary hover:bg-white/90 px-10 py-6 text-lg shadow-2xl">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </ShimmerButton>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  )
}
