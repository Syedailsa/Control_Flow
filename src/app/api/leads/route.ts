import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500)
  const offset = parseInt(searchParams.get("offset") || "0")

  const where: Record<string, unknown> = {
    organizationId: session.user.organizationId,
  }

  if (status && ["HOT", "WARM", "COLD"].includes(status)) {
    where.status = status
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
      { industry: { contains: search, mode: "insensitive" } },
    ]
  }

  const [leads, total, hot, warm, cold] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        industry: true,
        score: true,
        status: true,
        leadSource: true,
        appointmentStatus: true,
        appointmentTime: true,
        createdAt: true,
      },
    }),
    prisma.lead.count({ where }),
    prisma.lead.count({ where: { organizationId: session.user.organizationId, status: "HOT" } }),
    prisma.lead.count({ where: { organizationId: session.user.organizationId, status: "WARM" } }),
    prisma.lead.count({ where: { organizationId: session.user.organizationId, status: "COLD" } }),
  ])

  return NextResponse.json({ leads, total, counts: { hot, warm, cold } })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const lead = await prisma.lead.create({
      data: {
        organizationId: session.user.organizationId,
        name: body.name || null,
        email: body.email || null,
        phone: body.phone || null,
        company: body.company || null,
        jobTitle: body.jobTitle || null,
        industry: body.industry || null,
        businessGoals: body.businessGoals || null,
        challenges: body.challenges || null,
        leadSource: body.leadSource || "manual",
      },
    })

    return NextResponse.json({ lead }, { status: 201 })
  } catch (error) {
    console.error("Create lead error:", error)
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 })
  }
}
