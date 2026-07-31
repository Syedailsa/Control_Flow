import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import KnowledgeBasePage from "./kb-content"

export default async function KnowledgeBasePageWrapper() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return <KnowledgeBasePage />
}
