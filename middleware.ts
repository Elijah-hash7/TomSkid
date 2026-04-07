import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

const PUBLIC_PATHS = new Set(["/login", "/signup", "/auth/callback"])

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true
  if (pathname.startsWith("/api")) return true
  return false
}

export async function middleware(request: NextRequest) {
  const { response, supabase } = await updateSession(request)
  const { pathname, search } = request.nextUrl

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect all app routes except public auth/callback/api endpoints.
  if (!isPublicPath(pathname)) {
    if (!user) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("next", `${pathname}${search}`)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect already-logged-in users away from /login and /signup
  const isAuthPage = pathname === "/login" || pathname === "/signup"
  if (isAuthPage && user) {
    const next = request.nextUrl.searchParams.get("next") || "/"
    return NextResponse.redirect(new URL(next, request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
