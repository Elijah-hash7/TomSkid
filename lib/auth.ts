/**
 * Deprecated: Hardcoded admin email checks are no longer used.
 * Use lib/supabase/auth.ts for role-based authorization.
 */
export function isAdminEmail(email: string | undefined | null): boolean {
  return false
}
