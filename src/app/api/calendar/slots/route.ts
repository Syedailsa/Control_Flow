import { NextRequest, NextResponse } from "next/server"
import { getAvailableSlots, getUpcomingDays } from "@/lib/calendar"
import { z } from "zod"

export const runtime = "nodejs"

const slotsQuerySchema = z.object({
  date: z.string().optional(),
  days: z.coerce.number().min(1).max(14).optional().default(7),
  duration: z.coerce.number().min(15).max(120).optional().default(30),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const parsed = slotsQuerySchema.safeParse({
      date: searchParams.get("date") || undefined,
      days: searchParams.get("days") || undefined,
      duration: searchParams.get("duration") || undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const { date, days, duration } = parsed.data

    if (date) {
      const targetDate = new Date(date)
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 })
      }
      const slots = await getAvailableSlots(targetDate, duration)
      return NextResponse.json({ date: targetDate.toISOString(), slots })
    }

    const upcomingDates = await getUpcomingDays(days)
    const results = await Promise.all(
      upcomingDates.map(async (d) => ({
        date: d.toISOString(),
        slots: await getAvailableSlots(d, duration),
      }))
    )

    return NextResponse.json({ days: results })
  } catch (error) {
    console.error("Slots API error:", error)
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 })
  }
}
