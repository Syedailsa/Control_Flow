import { prisma } from "@/lib/prisma"

export interface KBEntry {
  question: string
  answer: string
  category: string
  tags: string[]
}

export async function searchKnowledgeBase(query: string): Promise<KBEntry[]> {
  const words = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2)

  if (words.length === 0) return []

  const entries = await prisma.knowledgeBase.findMany({
    where: { active: true },
    select: {
      question: true,
      answer: true,
      category: true,
      tags: true,
    },
    take: 100,
  })

  return entries
    .map((entry) => {
      const searchable = `${entry.question} ${entry.answer} ${entry.category} ${entry.tags.join(" ")}`.toLowerCase()
      let score = 0
      for (const word of words) {
        if (searchable.includes(word)) score++
      }
      return { entry, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((r) => r.entry)
}

export function formatKBForContext(entries: KBEntry[]): string {
  if (entries.length === 0) return ""

  return (
    "\n\n[Knowledge Base Context — use this to answer accurately if relevant]:\n" +
    entries
      .map((e, i) => `${i + 1}. Q: ${e.question}\n   A: ${e.answer}`)
      .join("\n")
  )
}
