"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { getServerUser } from "@/lib/supabase/auth"

const profileSettingsSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(60, "Name is too long"),
  order_updates: z.boolean().default(true),
  support_emails: z.boolean().default(false),
})

export type UpdateProfileSettingsResult =
  | { ok: true }
  | {
      ok: false
      error?: string
      fieldErrors?: Partial<Record<"full_name", string>>
    }

export async function updateProfileSettings(
  formData: FormData
): Promise<UpdateProfileSettingsResult> {
  const { user } = await getServerUser()
  if (!user) return { ok: false, error: "Please sign in again." }

  const parsed = profileSettingsSchema.safeParse({
    full_name: String(formData.get("full_name") ?? ""),
    order_updates: formData.get("order_updates") === "on",
    support_emails: formData.get("support_emails") === "on",
  })

  if (!parsed.success) {
    const fieldErrors: Partial<Record<"full_name", string>> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]
      if (field === "full_name") {
        fieldErrors[field] = issue.message
      }
    }
    return { ok: false, fieldErrors }
  }

  const supabase = await createClient()
  const currentMeta = user.user_metadata ?? {}
  const { error } = await supabase.auth.updateUser({
    data: {
      ...currentMeta,
      full_name: parsed.data.full_name,
      preferences: {
        order_updates: parsed.data.order_updates,
        support_emails: parsed.data.support_emails,
      },
    },
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath("/profile")
  return { ok: true }
}
