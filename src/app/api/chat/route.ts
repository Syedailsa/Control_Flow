import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { chatCompletion, type ChatMessage } from "@/lib/ai"
import { SYSTEM_PROMPT, QUALIFICATION_PROMPT } from "@/lib/prompts"
import { searchKnowledgeBase, formatKBForContext } from "@/lib/knowledge-base"
import { scoreLead, type QualificationData } from "@/lib/lead-scoring"
import { sendEmail } from "@/lib/email"
import { z } from "zod"

type JsonInput = Prisma.InputJsonValue
import { Prisma } from "@/generated/prisma/client"

export const runtime = "nodejs"

function stripReasoning(text: string): string {
  if (!text) return text
  let cleaned = text

  // Remove everything before the first actual sentence if it looks like reasoning
  // Pattern: lines starting with thinking markers before actual content
  const lines = cleaned.split('\n')
  let startIdx = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    // Skip lines that are clearly internal reasoning
    if (
      /^(First|Okay|Hmm|Wait|Ah|Note|So|Now|Let me|I need to|I should|Looking at|The user|But|However|Actually|Based on|According|Following|My plan|Step \d|Rule:|Guideline:|IMPORTANT)/i.test(line) ||
      /^\d+\.\s+\*{0,2}(Analyze|Consider|Check|Greet|Understand|Present|Follow|Ensure|Make sure|Remember|The goal|Key point)/i.test(line) ||
      /\*\*[^*]+\*\*:?\s/i.test(line)
    ) {
      startIdx = i + 1
      continue
    }
    // If line looks like actual content (starts with greeting, answer, etc.), stop skipping
    if (line.length > 0 && startIdx > 0) break
  }
  if (startIdx > 0 && startIdx < lines.length) {
    cleaned = lines.slice(startIdx).join('\n').trim()
  }

  // Remove common reasoning patterns
  cleaned = cleaned.replace(/^(Here'?s?\s+(a|my|the)\s+(thinking|reasoning|analysis|thought)\s+process[^:]*:\s*\n?)/im, '')
  cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim()

  // If nothing meaningful left, return a fallback
  if (cleaned.length < 10) {
    return "I'd be happy to help you with that! Could you tell me a bit more about what you're looking for?"
  }
  return cleaned
}

const chatRequestSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(50)
    .default([]),
  qualify: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = chatRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const { sessionId, message, history, qualify } = parsed.data
    const sid = sessionId || randomUUID()

    const organization = await prisma.organization.findFirst({
      orderBy: { createdAt: "asc" },
    })

    if (!organization) {
      return NextResponse.json(
        { error: "No organization configured" },
        { status: 500 }
      )
    }

    let lead = await prisma.lead.findUnique({ where: { sessionId: sid } })

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          sessionId: sid,
          organizationId: organization.id,
          leadSource: "website",
        },
      })
    }

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ]

    const historyMessages: ChatMessage[] = history.map((h) => ({
      role: h.role,
      content: h.content,
    }))

    messages.push(...historyMessages)
    messages.push({ role: "user" as const, content: message })

    const kbEntries = await searchKnowledgeBase(message)
    const kbContext = formatKBForContext(kbEntries)

    if (kbContext) {
      messages[0] = {
        role: "system",
        content: SYSTEM_PROMPT + kbContext,
      }
    }

    const aiResponse = await chatCompletion(messages, { temperature: 0.7 })

    // Strip leaked reasoning from response
    const cleanResponse = stripReasoning(aiResponse.content)

    await prisma.conversation.createMany({
      data: [
        {
          leadId: lead.id,
          role: "user",
          content: message,
          metadata: { sessionId: sid },
        },
        {
          leadId: lead.id,
          role: "assistant",
          content: cleanResponse,
          metadata: { sessionId: sid },
        },
      ],
    })

    let qualification: QualificationData | null = null
    let scoreResult = null
    let handoffNeeded = false

    const transcript = [...historyMessages, { role: "user" as const, content: message }, { role: "assistant" as const, content: cleanResponse }]
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n")

    const hasEmailInTranscript = /[\w.+-]+@[\w-]+\.[\w.]+/.test(transcript)
    const shouldQualify = qualify || (lead.email === null && hasEmailInTranscript)

    if (shouldQualify) {
      const qualResponse = await chatCompletion(
        [
          { role: "system", content: QUALIFICATION_PROMPT },
          { role: "user", content: `Here is the conversation transcript:\n\n${transcript}` },
        ],
        { temperature: 0, json: true }
      )

      try {
        const rawQual = JSON.parse(qualResponse.content)
        qualification = {
          name: rawQual.name ?? null,
          email: rawQual.email ?? null,
          phone: rawQual.phone ?? null,
          company: rawQual.company ?? null,
          jobTitle: rawQual.jobTitle ?? null,
          industry: rawQual.industry ?? null,
          monthlyRevenue: typeof rawQual.monthlyRevenue === "number" ? rawQual.monthlyRevenue : null,
          businessGoals: rawQual.businessGoals ?? null,
          challenges: rawQual.challenges ?? null,
          budget: rawQual.budget ?? null,
          timeframe: rawQual.timeframe ?? null,
          leadSource: rawQual.leadSource ?? "website",
          conversationSummary: rawQual.conversationSummary ?? "",
          interestLevel: rawQual.interestLevel ?? "LOW",
          bookedAppointment: !!rawQual.bookedAppointment,
          agreedToCall: !!rawQual.agreedToCall,
          needHumanHandoff: !!rawQual.needHumanHandoff,
        }

        scoreResult = scoreLead(qualification)
        handoffNeeded = qualification.needHumanHandoff

        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            name: qualification.name,
            email: qualification.email,
            phone: qualification.phone,
            company: qualification.company,
            jobTitle: qualification.jobTitle,
            industry: qualification.industry,
            monthlyRevenue: qualification.monthlyRevenue,
            businessGoals: qualification.businessGoals,
            challenges: qualification.challenges,
            budget: qualification.budget,
            timeframe: qualification.timeframe,
            qualificationData: qualification as unknown as JsonInput,
            conversationSummary: qualification.conversationSummary,
            score: scoreResult.score,
            status: scoreResult.status,
          },
        })

        if (handoffNeeded) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              qualificationData: {
                ...(qualification as unknown as Record<string, unknown>),
                handoffRequested: true,
              } as JsonInput,
            },
          })
        }

        const agreedToCall = qualification.agreedToCall
        const strongInterest = scoreResult.status === "HOT" || scoreResult.status === "WARM"

        if (qualification.email && (agreedToCall || strongInterest)) {
          const existingWelcome = await prisma.emailLog.findFirst({
            where: { leadId: lead.id, type: "WELCOME" },
          })

          if (!existingWelcome) {
            await sendEmail({
              to: qualification.email,
              type: "WELCOME",
              leadId: lead.id,
              data: {
                leadName: qualification.name || "",
                calendarLink: `${process.env.NEXTAUTH_URL || ""}/book?session=${sid}`,
              },
            })
          }
        }
      } catch {
        console.error("Failed to parse qualification JSON")
      }
    }

    return NextResponse.json({
      response: cleanResponse,
      sessionId: sid,
      leadId: lead.id,
      qualification,
      score: scoreResult,
      handoffNeeded,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
