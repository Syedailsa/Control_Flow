import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedPaths = ["/dashboard"]
const authPaths = ["/login"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value

  const isAuthenticated = !!sessionToken

  if (protectedPaths.some(p => pathname.startsWith(p)) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (authPaths.some(p => pathname.startsWith(p)) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
