import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL?.replace("?sslmode=require&pgbouncer=true", ""),
  ssl: { rejectUnauthorized: false },
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: "coachflow-demo" },
    update: {},
    create: {
      name: "CoachFlow Demo",
      slug: "coachflow-demo",
      timezone: "Asia/Karachi",
    },
  })

  const password = await bcrypt.hash("admin123", 12)

  await prisma.user.upsert({
    where: { email: "admin@coachflow.ai" },
    update: {},
    create: {
      name: "Admin Coach",
      email: "admin@coachflow.ai",
      password,
      role: "ADMIN",
      organizationId: org.id,
    },
  })

  await prisma.knowledgeBase.createMany({
    skipDuplicates: true,
    data: [
      {
        question: "What does CoachFlow do?",
        answer:
          "CoachFlow is an AI-powered platform that automates lead qualification, appointment booking, and client management for coaches and service providers. It includes an AI chat widget that engages visitors 24/7, automatically qualifies leads, books discovery calls on your Google Calendar, sends confirmation emails, and tracks everything in a CRM dashboard — all on autopilot.",
        category: "services",
        tags: ["platform", "automation", "lead", "overview"],
      },
      {
        question: "What coaching services do you offer?",
        answer:
          "We offer one-on-one executive coaching, group coaching programs, leadership development programs, business consulting, and online masterclasses. Each program is tailored to help professionals and business owners achieve breakthrough results.",
        category: "services",
        tags: ["services", "programs", "coaching"],
      },
      {
        question: "Can you build a custom lead flow for my business?",
        answer:
          "Absolutely! That's exactly what CoachFlow does. We set up an AI-powered lead flow where your website visitors or DM contacts are automatically engaged, qualified, and routed to your CRM or Google Sheets. You get real-time tracking of who to respond to urgently, automated follow-ups, and appointment booking — all without manual work. Book a free discovery call and we'll build your custom lead flow.",
        category: "services",
        tags: ["custom", "lead flow", "automation", "DM", "CRM", "sheets"],
      },
      {
        question: "How do DMs and leads get tracked?",
        answer:
          "CoachFlow captures every lead that interacts with your AI chat widget or sends a DM. Each conversation is logged, the lead is automatically scored (HOT/WARM/COLD), and all details — name, email, goals, challenges — are stored in your CRM dashboard. You can also integrate with Google Sheets for real-time tracking. You'll always know who to respond to and when.",
        category: "services",
        tags: ["DM", "tracking", "CRM", "sheets", "lead management"],
      },
      {
        question: "How much does it cost?",
        answer:
          "Our pricing varies based on the program and duration. One-on-one coaching packages start from $500/session, group programs start from $200/month, and masterclasses are typically $97-297. Custom lead automation setups are discussed during your free discovery call. We recommend booking a call to find the best fit for your needs and budget.",
        category: "pricing",
        tags: ["pricing", "cost", "investment"],
      },
      {
        question: "How long is a typical coaching engagement?",
        answer:
          "Most clients commit to a minimum of 3 months for one-on-one coaching to see meaningful transformation. Group programs run for 8-12 weeks, and masterclasses are typically 1-2 day intensive sessions. We'll discuss the right duration during your discovery call.",
        category: "general",
        tags: ["duration", "commitment", "timeline"],
      },
      {
        question: "Do you offer a free consultation?",
        answer:
          "Yes! We offer a free 30-minute discovery call where we discuss your goals, challenges, and determine if CoachFlow is the right fit. There's absolutely no obligation — it's simply an opportunity to explore how we can help you automate your lead flow and grow your business.",
        category: "general",
        tags: ["free", "consultation", "discovery call"],
      },
      {
        question: "What is the difference between one-on-one and group coaching?",
        answer:
          "One-on-one coaching provides personalized attention with sessions tailored specifically to your situation, schedule, and goals. Group coaching offers the benefit of peer learning, diverse perspectives, and is more cost-effective. Both are highly effective — the choice depends on your learning style and budget.",
        category: "services",
        tags: ["one-on-one", "group", "difference", "comparison"],
      },
      {
        question: "Who is CoachFlow for?",
        answer:
          "CoachFlow is designed for coaches, consultants, service providers, agencies, and business owners who want to capture leads automatically, qualify them without manual effort, book discovery calls on autopilot, and keep track of who to respond to. Whether you're a solo coach or running a team, we have a solution for you.",
        category: "general",
        tags: ["who", "audience", "eligibility"],
      },
      {
        question: "Is coaching conducted online or in-person?",
        answer:
          "We primarily conduct coaching sessions online via Zoom or Google Meet for maximum flexibility and convenience. In-person sessions can be arranged for local clients and corporate engagements. All our online sessions are recorded so you can revisit them anytime.",
        category: "general",
        tags: ["online", "in-person", "format", "location"],
      },
      {
        question: "What results can I expect?",
        answer:
          "Results vary by individual, but our clients typically report improved leadership effectiveness, clearer strategic direction, increased revenue and profitability, better work-life balance, enhanced communication skills, and greater overall confidence. We work with you to define and track specific measurable outcomes.",
        category: "general",
        tags: ["results", "outcomes", "roi", "benefits"],
      },
    ],
  })

  const demoLeads = [
    {
      name: "Sarah Chen",
      email: "sarah@nexustech.io",
      phone: "+1 415 555 0134",
      company: "Nexus Technologies",
      jobTitle: "CEO",
      industry: "Technology",
      monthlyRevenue: 85000,
      businessGoals: "Scale from $1M to $5M annual revenue and build an executive team",
      challenges: "Hiring and retaining senior leadership talent",
      budget: "$1,000+ per month",
      timeframe: "Immediately",
      leadSource: "Website",
      score: 92,
      status: "HOT" as const,
      appointmentStatus: "CONFIRMED" as const,
      appointmentTime: new Date(Date.now() + 2 * 86400000),
    },
    {
      name: "Marcus Johnson",
      email: "marcus@brightline.consulting",
      phone: "+1 212 555 0189",
      company: "Brightline Consulting",
      jobTitle: "Managing Director",
      industry: "Consulting",
      monthlyRevenue: 45000,
      businessGoals: "Improve client retention and expand service offerings",
      challenges: "Time management and delegation",
      budget: "$500-999 per month",
      timeframe: "This quarter",
      leadSource: "LinkedIn",
      score: 74,
      status: "WARM" as const,
      appointmentStatus: "PENDING" as const,
      appointmentTime: null,
    },
    {
      name: "Emily Rodriguez",
      email: "emily@meridianhealth.com",
      phone: null,
      company: "Meridian Health",
      jobTitle: "Director of Operations",
      industry: "Healthcare",
      monthlyRevenue: 30000,
      businessGoals: "Develop leadership pipeline for 12 regional clinics",
      challenges: "Standardizing leadership training across locations",
      budget: "$500-999 per month",
      timeframe: "This year",
      leadSource: "Instagram",
      score: 62,
      status: "WARM" as const,
      appointmentStatus: "PENDING" as const,
      appointmentTime: null,
    },
    {
      name: "David Kim",
      email: "david.kim@gmail.com",
      phone: null,
      company: null,
      jobTitle: "Marketing Manager",
      industry: "Marketing",
      monthlyRevenue: null,
      businessGoals: "Career advancement",
      challenges: "Feeling stuck in current role",
      budget: null,
      timeframe: "Exploring",
      leadSource: "Facebook",
      score: 38,
      status: "COLD" as const,
      appointmentStatus: "PENDING" as const,
      appointmentTime: null,
    },
  ]

  for (const lead of demoLeads) {
    const existing = await prisma.lead.findFirst({
      where: { email: lead.email ?? undefined },
    })
    if (existing) continue
    await prisma.lead.create({
      data: {
        ...lead,
        organizationId: org.id,
        conversationSummary: `Interested in coaching for ${lead.businessGoals?.toLowerCase() ?? "growth"}.`,
        qualificationData: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          jobTitle: lead.jobTitle,
          industry: lead.industry,
          businessGoals: lead.businessGoals,
          challenges: lead.challenges,
          budget: lead.budget,
          timeframe: lead.timeframe,
          interestLevel: lead.status === "HOT" ? "HIGH" : lead.status === "WARM" ? "MEDIUM" : "LOW",
        },
      },
    })
  }

  console.log("Seed completed successfully")
  console.log("Login: admin@coachflow.ai / admin123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
