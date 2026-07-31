import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AnalyticsPage from "./analytics-content"

export default async function AnalyticsPageWrapper() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return <AnalyticsPage />
}
