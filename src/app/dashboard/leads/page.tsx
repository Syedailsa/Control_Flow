import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import LeadsPage from "./leads-content"

export default async function LeadsPageWrapper() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return <LeadsPage />
}
