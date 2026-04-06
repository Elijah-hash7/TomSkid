import { createClient } from "./server"
import { redirect } from "next/navigation"
import type { UserRole } from "@/lib/types"

/**
 * Fetches the current authenticated user and their corresponding profile.
 */
export async function getServerUser() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { user: null, profile: null }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("[auth] Error fetching profile for user", user.id, profileError)
    return { user, profile: null }
  }

  return { user, profile }
}

/**
 * Enforces admin role for a Server Component or Action.
 * Redirects if not authenticated or not an admin.
 */
export async function requireAdminRole(redirectTo: string = "/") {
  const { user, profile } = await getServerUser()

  if (!user) {
    redirect("/login?next=/admin/dashboard")
  }

  if (profile?.role !== "admin") {
    redirect(redirectTo)
  }

  return { user, profile }
}

/**
 * Helper to check if the current user is an admin.
 */
export async function isAdmin() {
  const { profile } = await getServerUser()
  return profile?.role === "admin"
}
