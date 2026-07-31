import { google } from "googleapis"

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary"
const COACH_TIMEZONE = process.env.COACH_TIMEZONE || "Asia/Karachi"

let cachedClient: ReturnType<typeof getAuth> | null = null

function getAuth() {
  const privateKey = process.env.GOOGLE_CALENDAR_PRIVATE_KEY
  const clientEmail = process.env.GOOGLE_CALENDAR_CLIENT_EMAIL

  if (!privateKey || !clientEmail) {
    throw new Error("Google Calendar credentials not configured")
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  })

  return auth
}

export function getCalendar() {
  if (!cachedClient) {
    cachedClient = getAuth()
  }
  return google.calendar({ version: "v3", auth: cachedClient })
}

export interface TimeSlot {
  start: string
  end: string
  available: boolean
}

export async function getBusyTimes(start: Date, end: Date): Promise<{ start: string; end: string }[]> {
  try {
    const calendar = getCalendar()
    const res = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 250,
    })

    return (res.data.items ?? [])
      .filter((e) => e.start?.dateTime && e.end?.dateTime)
      .map((e) => ({
        start: e.start!.dateTime!,
        end: e.end!.dateTime!,
      }))
  } catch (error) {
    console.error("Failed to fetch calendar busy times:", error)
    return []
  }
}

const WORK_HOURS = {
  start: 9,
  end: 17,
}

export async function getAvailableSlots(
  date: Date,
  durationMinutes = 30,
  gapMinutes = 0
): Promise<TimeSlot[]> {
  const dayStart = new Date(date)
  dayStart.setHours(WORK_HOURS.start, 0, 0, 0)

  const dayEnd = new Date(date)
  dayEnd.setHours(WORK_HOURS.end, 0, 0, 0)

  const busy = await getBusyTimes(dayStart, dayEnd)

  const slots: TimeSlot[] = []
  const cursor = new Date(dayStart)

  while (cursor < dayEnd) {
    const slotStart = new Date(cursor)
    const slotEnd = new Date(cursor.getTime() + durationMinutes * 60000)

    if (slotEnd <= dayEnd) {
      const isBusy = busy.some((b) => {
        const bStart = new Date(b.start)
        const bEnd = new Date(b.end)
        return slotStart < bEnd && slotEnd > bStart
      })

      if (!isBusy) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          available: true,
        })
      }
    }

    cursor.setTime(cursor.getTime() + (durationMinutes + gapMinutes) * 60000)
  }

  return slots
}

export async function getUpcomingDays(days = 7): Promise<Date[]> {
  const dates: Date[] = []
  const now = new Date()
  for (let i = 1; i <= days; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      dates.push(d)
    }
  }
  return dates
}

export async function createCalendarEvent(params: {
  summary: string
  description?: string
  start: Date
  end: Date
  attendeeEmail?: string
  attendeeName?: string
}) {
  try {
    const calendar = getCalendar()

    const event = {
      summary: params.summary,
      description: params.description,
      start: {
        dateTime: params.start.toISOString(),
        timeZone: COACH_TIMEZONE,
      },
      end: {
        dateTime: params.end.toISOString(),
        timeZone: COACH_TIMEZONE,
      },
      conferenceData: {
        createRequest: {
          requestId: `coachflow-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 15 },
        ],
      },
    }

    let res
    try {
      res = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        requestBody: event,
        conferenceDataVersion: 1,
        sendUpdates: "all",
      })
    } catch {
      // Meet conference creation is not supported on consumer calendars via
      // service accounts. Retry without it so bookings still succeed.
      const { conferenceData: _omit, ...plainEvent } = event
      res = await calendar.events.insert({
        calendarId: CALENDAR_ID,
        requestBody: plainEvent,
        sendUpdates: "all",
      })
    }

    // Attendees are intentionally not attached: service accounts cannot
    // invite attendees without Domain-Wide Delegation, which consumer
    // Gmail calendars cannot set up. The lead receives the event link via
    // the SMTP confirmation email instead.

    return {
      eventId: res.data.id,
      htmlLink: res.data.htmlLink,
      hangoutLink: res.data.hangoutLink,
      start: res.data.start?.dateTime,
      end: res.data.end?.dateTime,
    }
  } catch (error) {
    console.error("Failed to create calendar event:", error)
    throw new Error("Failed to create calendar event")
  }
}

export async function cancelCalendarEvent(eventId: string) {
  try {
    const calendar = getCalendar()
    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId,
    })
    return true
  } catch (error) {
    console.error("Failed to cancel calendar event:", error)
    throw new Error("Failed to cancel calendar event")
  }
}
