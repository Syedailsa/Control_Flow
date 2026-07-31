import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"

export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const lead = await prisma.lead.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      conversations: {
        orderBy: { createdAt: "asc" },
      },
      emailLogs: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  return NextResponse.json({ lead })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.lead.findFirst({
    where: { id, organizationId: session.user.organizationId },
  })

  if (!existing) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  const data: Record<string, unknown> = {}
  const allowedFields = [
    "name", "email", "phone", "company", "jobTitle", "industry",
    "monthlyRevenue", "businessGoals", "challenges", "budget",
    "timeframe", "leadSource", "score", "status",
    "appointmentStatus", "appointmentTime",
  ]

  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field]
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: data as Prisma.LeadUpdateInput,
  })

  return NextResponse.json({ lead })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.lead.findFirst({
    where: { id, organizationId: session.user.organizationId },
  })

  if (!existing) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  await prisma.lead.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
