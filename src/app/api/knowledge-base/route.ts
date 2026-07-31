import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const runtime = "nodejs"

const kbSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1),
  category: z.string().min(1).max(50),
  tags: z.array(z.string()).default([]),
  active: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const category = searchParams.get("category")
  const search = searchParams.get("search")

  const where: Record<string, unknown> = {}
  if (category && category !== "ALL") where.category = category
  if (search) {
    where.OR = [
      { question: { contains: search, mode: "insensitive" } },
      { answer: { contains: search, mode: "insensitive" } },
    ]
  }

  const entries = await prisma.knowledgeBase.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  })

  const categories = await prisma.knowledgeBase.findMany({
    select: { category: true },
    distinct: ["category"],
  })

  return NextResponse.json({
    entries,
    categories: categories.map((c) => c.category),
  })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = kbSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const entry = await prisma.knowledgeBase.create({
      data: parsed.data,
    })

    return NextResponse.json({ entry }, { status: 201 })
  } catch (error) {
    console.error("Create KB error:", error)
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 })
  }
}
