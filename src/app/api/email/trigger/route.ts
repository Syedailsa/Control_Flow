import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { z } from "zod"

export const runtime = "nodejs"

const triggerSchema = z.object({
  leadId: z.string(),
  type: z.enum(["WELCOME", "CONFIRMATION", "REMINDER", "FOLLOWUP", "THANK_YOU", "NURTURE"]),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = triggerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const { leadId, type } = parsed.data

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, organizationId: session.user.organizationId },
    })

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    if (!lead.email) {
      return NextResponse.json({ error: "Lead has no email" }, { status: 400 })
    }

    const callDate = lead.appointmentTime
      ? new Date(lead.appointmentTime).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      : ""

    const callTime = lead.appointmentTime
      ? new Date(lead.appointmentTime).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      : ""

    const result = await sendEmail({
      to: lead.email,
      type,
      leadId: lead.id,
      data: {
        leadName: lead.name || "",
        callDate,
        callTime,
        meetLink: "",
        calendarLink: process.env.NEXTAUTH_URL || "",
      },
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email trigger error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
