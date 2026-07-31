import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client"

export const runtime = "nodejs"

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

  const existing = await prisma.knowledgeBase.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 })
  }

  const data: Record<string, unknown> = {}
  const allowed = ["question", "answer", "category", "tags", "active"]
  for (const field of allowed) {
    if (body[field] !== undefined) data[field] = body[field]
  }

  const entry = await prisma.knowledgeBase.update({
    where: { id },
    data: data as Prisma.KnowledgeBaseUpdateInput,
  })

  return NextResponse.json({ entry })
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
  const existing = await prisma.knowledgeBase.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 })
  }

  await prisma.knowledgeBase.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
