import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AppointmentsPage from "./appointments-content"

export default async function AppointmentsPageWrapper() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return <AppointmentsPage />
}
