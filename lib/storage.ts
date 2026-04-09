import { createClient } from "@/lib/supabase/server"
import { isDemoModeEnabled } from "@/lib/demo-mode"

export const STORAGE_BUCKETS = {
  imei: "imei-screenshots",
  delivery: "delivery-proofs",
  payment: "payment-receipts",
} as const

export async function getStoragePublicUrl(
  bucket: string,
  path: string | null | undefined
): Promise<string | null> {
  if (isDemoModeEnabled()) return null
  if (!path) return null
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60)
  if (error) {
    console.error("[getStoragePublicUrl]", error.message)
    return null
  }
  return data.signedUrl
}
