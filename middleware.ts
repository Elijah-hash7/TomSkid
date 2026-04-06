import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { response, supabase } = await updateSession(request)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect /admin routes — must be authenticated (role check happens in layout)
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("next", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect already-logged-in users away from /login and /signup
  const isAuthPage = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup"
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
