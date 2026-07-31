"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CalendarCheck, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Slot {
  start: string
  end: string
  available: boolean
}

interface DaySlots {
  date: string
  slots: Slot[]
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export default function BookForm() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session") || ""

  const [days, setDays] = useState<DaySlots[]>([])
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSlot, setSelectedSlot] = useState("")
  const [leadName, setLeadName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function init() {
      try {
        if (sessionId) {
          const lres = await fetch(`/api/leads/by-session?session=${encodeURIComponent(sessionId)}`)
          if (lres.ok) {
            const ldata = await lres.json()
            setLeadName(ldata.lead?.name || null)
          }
        }
        const sres = await fetch("/api/calendar/slots?days=7&duration=30")
        if (sres.ok) {
          const sdata = await sres.json()
          setDays(sdata.days || [])
        }
      } catch {
        // ignore, page still renders slots area with error state
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [sessionId])

  const availableDays = days.filter((d) => d.slots.length > 0)
  const selectedDay = days.find((d) => d.date === selectedDate)

  async function handleBook() {
    if (!selectedSlot) return
    setBooking(true)
    setError("")
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, start: selectedSlot, duration: 30 }),
      })
      const data = await res.json()
      if (res.ok) {
        setBooked(true)
      } else {
        setError(data.error || "Failed to book the call. Please try again.")
      }
    } catch {
      setError("Failed to book the call. Please try again.")
    } finally {
      setBooking(false)
    }
  }

  if (booked) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-orange-100 bg-white shadow-xl shadow-orange-100/50 p-10 text-center"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6">
          <CalendarCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-black mb-3">You&apos;re all booked!</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          A confirmation email is on its way with your Google Meet link and call details. We look
          forward to speaking with you soon!
        </p>
        <Link href="/" className="inline-block mt-8 text-sm font-medium text-orange-700 hover:underline">
          Back to home
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-orange-100 bg-white shadow-xl shadow-orange-100/50 p-6 sm:p-8"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">
          {leadName ? `Great, ${leadName}!` : "Pick a time for your"}
        </h1>
        <p className="text-gray-600 mt-1">
          Choose a time for your free 30-minute discovery call. No obligation — just a conversation.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
        </div>
      ) : availableDays.length === 0 ? (
        <p className="text-sm text-gray-400 py-10 text-center">
          No available slots found. Please check back soon.
        </p>
      ) : (
        <>
          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-orange-500" /> Select Date
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {availableDays.map((d) => (
                <Button
                  key={d.date}
                  variant={selectedDate === d.date ? "default" : "outline"}
                  onClick={() => {
                    setSelectedDate(d.date)
                    setSelectedSlot("")
                  }}
                  className={cn(
                    "flex-shrink-0 flex-col px-3 py-2 h-auto",
                    selectedDate === d.date
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                      : "border-orange-200 text-gray-600 hover:bg-orange-50"
                  )}
                >
                  <span className="text-[10px] uppercase opacity-80">
                    {new Date(d.date).toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className="text-sm font-bold">{new Date(d.date).getDate()}</span>
                </Button>
              ))}
            </div>
          </div>

          {selectedDate && selectedDay && (
            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-500" /> Select Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                {selectedDay.slots.map((slot) => (
                  <Button
                    key={slot.start}
                    variant={selectedSlot === slot.start ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSlot(slot.start)}
                    className={cn(
                      selectedSlot === slot.start
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                        : "border-orange-200 text-gray-600 hover:bg-orange-50"
                    )}
                  >
                    {formatTime(slot.start)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleBook}
            disabled={!selectedSlot || booking}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
          >
            {booking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {booking ? "Booking..." : "Confirm Booking"}
          </Button>

          {error && <p className="text-sm text-red-500 mt-3 text-center">{error}</p>}
        </>
      )}
    </motion.div>
  )
}
