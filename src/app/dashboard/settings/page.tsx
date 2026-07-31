import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import SettingsPage from "./settings-content"

export default async function SettingsPageWrapper() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return <SettingsPage />
}
