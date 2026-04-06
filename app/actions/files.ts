'use server'

import { createClient } from '@/lib/supabase/server'
import { isAdmin, getServerUser } from '@/lib/supabase/auth'
import { STORAGE_BUCKETS } from '@/lib/storage'

const SIGNED_URL_EXPIRY = 60 * 60 // 1 hour

/**
 * Returns a temporary signed URL for an IMEI screenshot.
 * Customers can only access their own orders; admins can access any.
 */
export async function getImeiScreenshotUrl(
  orderId: string,
  path: string
): Promise<string | null> {
  const { user } = await getServerUser()
  if (!user) return null

  const supabase = await createClient()

  const isUserAdmin = await isAdmin()

  if (!isUserAdmin) {
    // Confirm the order belongs to this user
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!order) return null
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.imei)
    .createSignedUrl(path, SIGNED_URL_EXPIRY)

  if (error) {
    console.error('[getImeiScreenshotUrl]', error.message)
    return null
  }
  return data.signedUrl
}

/**
 * Returns a temporary signed URL for a delivery proof.
 * Customers can only access their own orders; admins can access any.
 */
export async function getDeliveryProofUrl(
  orderId: string,
  path: string
): Promise<string | null> {
  const { user } = await getServerUser()
  if (!user) return null

  const supabase = await createClient()

  const isUserAdmin = await isAdmin()

  if (!isUserAdmin) {
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!order) return null
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.delivery)
    .createSignedUrl(path, SIGNED_URL_EXPIRY)

  if (error) {
    console.error('[getDeliveryProofUrl]', error.message)
    return null
  }
  return data.signedUrl
}
