"use server"

import { requireAdminRole } from "@/lib/supabase/auth"
import { createServiceClient } from "@/lib/supabase/server"

export type AdminUser = {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  await requireAdminRole("/")
  const supabase = await createServiceClient()

  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (error) throw new Error(error.message)

  return (data.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? "",
    full_name: (u.user_metadata?.full_name as string | undefined) ?? null,
    created_at: u.created_at,
  }))
}
