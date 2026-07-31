import { type DefaultSession, type DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "COACH" | "ADMIN"
      organizationId: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: "COACH" | "ADMIN"
    organizationId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "COACH" | "ADMIN"
    organizationId: string
  }
}
