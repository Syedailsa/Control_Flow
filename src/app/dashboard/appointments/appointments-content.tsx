"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Calendar,
  CalendarCheck,
  CalendarX,
  Clock,
  Mail,
  Video,
  ExternalLink,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface Appointment {
  id: string
  name: string | null
  email: string | null
  company: string | null
  score: number
  status: string
  appointmentStatus: string
  appointmentTime: string
  calendlyEventUri: string | null
}

interface Slot {
  start: string
  end: string
  available: boolean
}

interface DaySlots {
  date: string
  slots: Slot[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function AppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState<DaySlots[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedSlot, setSelectedSlot] = useState<string>("")
  const [selectedLeadId, setSelectedLeadId] = useState<string>("")
  const [booking, setBooking] = useState(false)
  const [bookingMessage, setBookingMessage] = useState("")
  const [leads, setLeads] = useState<{ id: string; name: string }[]>([])

  const futureAppointments = appointments.filter(
    (a) => a.appointmentStatus === "CONFIRMED" || a.appointmentStatus === "PENDING"
  )
  const pastAppointments = appointments.filter(
    (a) => a.appointmentStatus === "COMPLETED" || a.appointmentStatus === "CANCELLED"
  )

  useEffect(() => {
    async function fetchData() {
      try {
        const [apptRes, slotsRes, leadsRes] = await Promise.all([
          fetch("/api/appointments"),
          fetch("/api/calendar/slots?days=7&duration=30"),
          fetch("/api/leads?limit=50"),
        ])
        const apptData = await apptRes.json()
        const slotsData = await slotsRes.json()
        const leadsData = await leadsRes.json()

        if (apptRes.ok) setAppointments(apptData.appointments)
        if (slotsRes.ok) setDays(slotsData.days)
        if (leadsRes.ok && Array.isArray(leadsData.leads)) {
          setLeads(leadsData.leads.map((l: { id: string; name: string | null }) => ({ id: l.id, name: l.name || "Unknown" })))
          if (leadsData.leads.length > 0) setSelectedLeadId(leadsData.leads[0].id)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const availableDays = days.filter((d) => d.slots.length > 0)
  const selectedDay = days.find((d) => d.date === selectedDate)
  const dateKey = selectedDate.split("T")[0]

  async function handleBook() {
    if (!selectedLeadId || !selectedSlot) return
    setBooking(true)
    setBookingMessage("")
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: selectedLeadId,
          start: selectedSlot,
          duration: 30,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setBookingMessage("Appointment booked successfully! A confirmation email has been sent.")
        setSelectedSlot("")
        const apptRes = await fetch("/api/appointments")
        const apptData = await apptRes.json()
        if (apptRes.ok) setAppointments(apptData.appointments)
      } else {
        setBookingMessage(data.error || "Failed to book appointment.")
      }
    } catch {
      setBookingMessage("Failed to book appointment.")
    } finally {
      setBooking(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-black">Appointments</h1>
        <p className="text-gray-500 mt-1">Manage discovery calls and bookings</p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-orange-100">
              <CardHeader>
                <CardTitle className="text-lg text-black flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-orange-500" />
                  Upcoming Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                {futureAppointments.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">
                    No upcoming appointments. Book one using the slot picker.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {futureAppointments.map((a) => (
                      <div
                        key={a.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-orange-50/50 border border-orange-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-black text-sm">{a.name || "Unknown Lead"}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(a.appointmentTime)} · {formatTime(a.appointmentTime)} · {a.company || "No company"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-medium",
                              a.appointmentStatus === "CONFIRMED"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            )}
                          >
                            {a.appointmentStatus}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-600"
                            onClick={() => router.push(`/dashboard/leads/${a.id}`)}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {pastAppointments.length > 0 && (
              <Card className="border-orange-100">
                <CardHeader>
                  <CardTitle className="text-lg text-black flex items-center gap-2">
                    <CalendarX className="w-5 h-5 text-gray-400" />
                    Past / Cancelled
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pastAppointments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-700 text-sm">{a.name || "Unknown"}</p>
                          <p className="text-xs text-gray-400">{formatDate(a.appointmentTime)}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-200 text-gray-600">
                          {a.appointmentStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="border-orange-100 h-fit">
            <CardHeader>
              <CardTitle className="text-lg text-black flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Book a Discovery Call
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Lead</label>
                <Select value={selectedLeadId} onValueChange={(value) => setSelectedLeadId(value ?? "")}>
                  <SelectTrigger className="border-orange-200">
                    <SelectValue placeholder="Select a lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {availableDays.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">
                  No available slots found. Please check calendar configuration.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Select Date</label>
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
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Select Time</label>
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
                    disabled={!selectedLeadId || !selectedSlot || booking}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
                  >
                    {booking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {booking ? "Booking..." : "Confirm Booking"}
                  </Button>

                  {bookingMessage && (
                    <p className={cn("text-sm", bookingMessage.includes("success") ? "text-green-600" : "text-red-500")}>
                      {bookingMessage}
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
