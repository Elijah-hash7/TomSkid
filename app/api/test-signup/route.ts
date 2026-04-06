import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/test-signup?email=test@example.com&password=test123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")
  const password = searchParams.get("password")

  if (!email || !password) {
    return NextResponse.json({
      usage: "Visit /api/test-signup?email=YOUR_EMAIL&password=YOUR_PASSWORD",
    })
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/profile`,
    },
  })

  return NextResponse.json({
    error: error ? { message: error.message, status: error.status } : null,
    user: data.user
      ? {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at,
          created_at: data.user.created_at,
        }
      : null,
    session: data.session ? "EXISTS (email confirm is DISABLED — user logged in immediately)" : "NULL (email confirm is ENABLED — check inbox)",
    diagnosis: error
      ? `❌ Signup failed: ${error.message}`
      : data.session
      ? "✅ Signup succeeded, session created immediately (no email confirm needed)"
      : "✅ Signup succeeded, waiting for email confirmation",
  })
}
