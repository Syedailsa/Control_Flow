import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const orgId = session.user.organizationId
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [
    totalLeads,
    monthLeads,
    lastMonthLeads,
    totalConversations,
    totalAppointments,
    confirmedAppointments,
    hotLeads,
    warmLeads,
    coldLeads,
    sources,
    leadsOverTime,
    statusBreakdown,
  ] = await Promise.all([
    prisma.lead.count({ where: { organizationId: orgId } }),
    prisma.lead.count({ where: { organizationId: orgId, createdAt: { gte: monthStart } } }),
    prisma.lead.count({
      where: { organizationId: orgId, createdAt: { gte: lastMonthStart, lt: monthStart } },
    }),
    prisma.conversation.count({
      where: { lead: { organizationId: orgId } },
    }),
    prisma.lead.count({
      where: { organizationId: orgId, appointmentStatus: { in: ["CONFIRMED", "PENDING"] } },
    }),
    prisma.lead.count({ where: { organizationId: orgId, appointmentStatus: "CONFIRMED" } }),
    prisma.lead.count({ where: { organizationId: orgId, status: "HOT" } }),
    prisma.lead.count({ where: { organizationId: orgId, status: "WARM" } }),
    prisma.lead.count({ where: { organizationId: orgId, status: "COLD" } }),
    prisma.lead.groupBy({
      by: ["leadSource"],
      where: { organizationId: orgId },
      _count: { id: true },
    }),
    prisma.lead.groupBy({
      by: ["createdAt"],
      where: { organizationId: orgId, createdAt: { gte: monthStart } },
      _count: { id: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.lead.groupBy({
      by: ["status"],
      where: { organizationId: orgId },
      _count: { id: true },
    }),
  ])

  const conversionRate = totalLeads > 0 ? (confirmedAppointments / totalLeads) * 100 : 0

  const monthGrowth = lastMonthLeads > 0
    ? Math.round(((monthLeads - lastMonthLeads) / lastMonthLeads) * 100)
    : monthLeads > 0 ? 100 : 0

  return NextResponse.json({
    stats: {
      totalLeads,
      monthLeads,
      monthGrowth,
      totalConversations,
      totalAppointments,
      confirmedAppointments,
      conversionRate: Math.round(conversionRate * 10) / 10,
      hotLeads,
      warmLeads,
      coldLeads,
    },
    sources: sources.map((s) => ({
      source: s.leadSource || "unknown",
      count: s._count.id,
    })),
    leadsOverTime: leadsOverTime.map((l) => ({
      date: l.createdAt.toISOString().split("T")[0],
      count: l._count.id,
    })),
    statusBreakdown: {
      HOT: statusBreakdown.find((s) => s.status === "HOT")?._count.id ?? 0,
      WARM: statusBreakdown.find((s) => s.status === "WARM")?._count.id ?? 0,
      COLD: statusBreakdown.find((s) => s.status === "COLD")?._count.id ?? 0,
    },
  })
}
