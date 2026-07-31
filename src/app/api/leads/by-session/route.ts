import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const session = request.nextUrl.searchParams.get("session")
    if (!session) {
      return NextResponse.json({ error: "Missing session" }, { status: 400 })
    }

    const lead = await prisma.lead.findUnique({
      where: { sessionId: session },
      select: { id: true, name: true },
    })

    if (!lead) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({ lead })
  } catch (error) {
    console.error("Lead by session error:", error)
    return NextResponse.json({ error: "Failed to load lead" }, { status: 500 })
  }
}
