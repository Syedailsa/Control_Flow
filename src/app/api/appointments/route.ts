import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCalendarEvent } from "@/lib/calendar"
import { sendEmail } from "@/lib/email"
import { z } from "zod"

export const runtime = "nodejs"

const bookSchema = z.object({
  leadId: z.string(),
  start: z.string(),
  end: z.string().optional(),
  duration: z.number().min(15).max(120).optional().default(30),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = bookSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const { leadId, start, duration } = parsed.data

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    const startDate = new Date(start)
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ error: "Invalid start time" }, { status: 400 })
    }

    const endDate = new Date(startDate.getTime() + duration * 60000)

    const event = await createCalendarEvent({
      summary: `Discovery Call with ${lead.name || "Prospect"}`,
      description: [
        `Lead: ${lead.name || "Unknown"}`,
        lead.company ? `Company: ${lead.company}` : null,
        lead.industry ? `Industry: ${lead.industry}` : null,
        lead.conversationSummary ? `Summary: ${lead.conversationSummary}` : null,
        lead.score ? `Lead Score: ${lead.score}/100` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      start: startDate,
      end: endDate,
      attendeeEmail: lead.email || undefined,
      attendeeName: lead.name || undefined,
    })

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        appointmentTime: startDate,
        appointmentStatus: "CONFIRMED",
        calendlyEventUri: event.eventId,
      },
    })

    if (lead.email) {
      const callDate = startDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
      const callTime = startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })

      await sendEmail({
        to: lead.email,
        type: "CONFIRMATION",
        leadId: lead.id,
        data: {
          leadName: lead.name || "",
          callDate,
          callTime,
          meetLink: event.hangoutLink || "",
          calendarLink: event.htmlLink || "",
        },
      })
    }

    return NextResponse.json({
      success: true,
      event,
      lead: {
        id: lead.id,
        appointmentTime: startDate,
        appointmentStatus: "CONFIRMED",
      },
    })
  } catch (error) {
    console.error("Booking API error:", error)
    return NextResponse.json(
      { error: (error as Error).message || "Failed to book appointment" },
      { status: 500 }
    )
  }
}
