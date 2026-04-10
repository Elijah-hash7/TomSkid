"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { requireAdminRole } from "@/lib/supabase/auth"
import { carrierCatalog } from "@/lib/carrier-catalog"
import { isDemoModeEnabled } from "@/lib/demo-mode"
import { normalizeCurrencyCode } from "@/lib/format"
import {
  deleteLocalCarrier,
  isMissingTableError,
  seedLocalCarriers,
  upsertLocalCarrier,
} from "@/lib/local-admin-store"
import { STORAGE_BUCKETS } from "@/lib/storage"
import type { OrderStatus } from "@/lib/types/database"

async function requireAdmin() {
  if (isDemoModeEnabled()) {
    return { supabase: null, user: null }
  }
  
  // This helper fetches the profile and checks the role.
  // It redirects if not authorized, but for server actions, 
  // we might want to handle it slightly differently or just let it redirect.
  const { user, profile } = await requireAdminRole("/")
  
  const supabase = await createClient()
  return { supabase, user }
}

const statusSchema = z.enum(["pending", "processing", "delivered"])

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin()
  const parsed = statusSchema.safeParse(status)
  if (!parsed.success) throw new Error("Invalid status")
  if (isDemoModeEnabled()) {
    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)
    return
  }
  const supabase = await createClient()
  const now = new Date()

  let expiryFields: { delivered_at?: string; expires_at?: string } = {}
  if (parsed.data === "delivered") {
    // Fetch validity_days from the order's linked plan
    const { data: orderData } = await supabase
      .from("orders")
      .select("plan_id")
      .eq("id", orderId)
      .single()
    if (orderData) {
      const { data: planData } = await supabase
        .from("plans")
        .select("validity_days")
        .eq("id", orderData.plan_id)
        .single()
      if (planData) {
        const expiresAt = new Date(now)
        expiresAt.setDate(expiresAt.getDate() + planData.validity_days)
        expiryFields = {
          delivered_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        }
      }
    }
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: parsed.data, updated_at: now.toISOString(), ...expiryFields })
    .eq("id", orderId)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/orders")
  revalidatePath(`/orders/${orderId}`)
}

export async function uploadDeliveryProof(orderId: string, formData: FormData) {
  await requireAdmin()
  if (isDemoModeEnabled()) {
    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)
    return
  }
  const file = formData.get("proof")
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose an image file")
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Upload a PNG, JPG, JPEG, or another image format")
  }
  const supabase = await createClient()
  const safeName = file.name.replace(/[^\w.\-]/g, "_") || "proof.png"
  const path = `${orderId}/${safeName}`
  const { error: upError } = await supabase.storage
    .from(STORAGE_BUCKETS.delivery)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type || undefined,
      upsert: true,
    })
  if (upError) throw new Error(upError.message)
  const now = new Date()
  let expiryFields: { delivered_at?: string; expires_at?: string } = {}
  const { data: orderData2 } = await supabase
    .from("orders")
    .select("plan_id")
    .eq("id", orderId)
    .single()
  if (orderData2) {
    const { data: planData2 } = await supabase
      .from("plans")
      .select("validity_days")
      .eq("id", orderData2.plan_id)
      .single()
    if (planData2) {
      const expiresAt = new Date(now)
      expiresAt.setDate(expiresAt.getDate() + planData2.validity_days)
      expiryFields = {
        delivered_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      }
    }
  }

  const { error: dbError } = await supabase
    .from("orders")
    .update({
      delivery_proof_path: path,
      status: "delivered",
      updated_at: now.toISOString(),
      ...expiryFields,
    })
    .eq("id", orderId)
  if (dbError) throw new Error(dbError.message)
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/orders")
  revalidatePath(`/orders/${orderId}`)
}

const carrierSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  logo_url: z.union([z.string().url(), z.literal("")]).optional(),
  sort_order: z.coerce.number().int().default(0),
})

export async function upsertCarrier(
  id: string | null,
  input: z.infer<typeof carrierSchema>
) {
  await requireAdmin()
  const data = carrierSchema.parse(input)
  if (isDemoModeEnabled()) {
    revalidatePath("/admin/carriers")
    revalidatePath("/")
    revalidatePath("/plans")
    return
  }
  const supabase = await createClient()
  const row = {
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    logo_url: data.logo_url || null,
    sort_order: data.sort_order,
  }
  if (id) {
    const { error } = await supabase.from("carriers").update(row).eq("id", id)
    if (error) {
      if (isMissingTableError(error.message)) {
        await upsertLocalCarrier(id, row)
      } else {
        throw new Error(error.message)
      }
    }
  } else {
    const { error } = await supabase.from("carriers").insert(row)
    if (error) {
      if (isMissingTableError(error.message)) {
        await upsertLocalCarrier(null, row)
      } else {
        throw new Error(error.message)
      }
    }
  }
  revalidatePath("/admin/carriers")
  revalidatePath("/")
  revalidatePath("/plans")
}

export async function deleteCarrier(id: string) {
  await requireAdmin()
  if (isDemoModeEnabled()) {
    revalidatePath("/admin/carriers")
    revalidatePath("/plans")
    return
  }
  const supabase = await createClient()
  const { error } = await supabase.from("carriers").delete().eq("id", id)
  if (error) {
    if (isMissingTableError(error.message)) {
      await deleteLocalCarrier(id)
    } else {
      throw new Error(error.message)
    }
  }
  revalidatePath("/admin/carriers")
  revalidatePath("/plans")
}

export async function seedDefaultCarriers() {
  await requireAdmin()
  if (isDemoModeEnabled()) {
    revalidatePath("/admin/plans")
    revalidatePath("/")
    revalidatePath("/plans")
    return
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from("carriers").select("id, slug")
  if (error) {
    if (isMissingTableError(error.message)) {
      await seedLocalCarriers(carrierCatalog)
      revalidatePath("/admin/plans")
      revalidatePath("/admin/carriers")
      revalidatePath("/")
      revalidatePath("/plans")
      return
    }
    throw new Error(error.message)
  }

  const existingBySlug = new Map((data ?? []).map((row) => [row.slug, row.id]))

  for (const carrier of carrierCatalog) {
    const existingId = existingBySlug.get(carrier.slug)
    if (existingId) {
      const { error: updateError } = await supabase
        .from("carriers")
        .update(carrier)
        .eq("id", existingId)
      if (updateError) throw new Error(updateError.message)
      continue
    }

    const { error: insertError } = await supabase.from("carriers").insert(carrier)
    if (insertError) throw new Error(insertError.message)
  }

  revalidatePath("/admin/plans")
  revalidatePath("/admin/carriers")
  revalidatePath("/")
  revalidatePath("/plans")
}

const planSchema = z.object({
  carrier_id: z.string().min(1, "Carrier is required"),
  name: z.string().min(1, "Plan name is required"),
  data_label: z.string().min(1, "Data label is required"),
  validity_days: z.coerce.number().int().positive("Validity must be a positive number"),
  price_cents: z.coerce.number().int().nonnegative("Price must be non-negative"),
  currency: z.string().min(1).default("NGN"),
  features: z.string().optional(),
  badge: z.string().optional(),
  is_featured: z.boolean().default(false),
})

export async function upsertPlan(
  id: string | null,
  input: z.infer<typeof planSchema>
) {
  await requireAdmin()
  const data = planSchema.parse(input)
  
  if (isDemoModeEnabled()) {
    revalidatePath("/admin/plans")
    revalidatePath("/plans")
    revalidatePath("/")
    return
  }
  const features = data.features
    ? data.features
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : null
  const supabase = await createClient()
  const row = {
    carrier_id: data.carrier_id,
    name: data.name,
    data_label: data.data_label,
    validity_days: data.validity_days,
    price_cents: data.price_cents,
    currency: normalizeCurrencyCode(data.currency),
    features,
    badge: data.badge || null,
    is_featured: data.is_featured,
  }
  
  if (id) {
    const { error } = await supabase.from("plans").update(row).eq("id", id)
    if (error) {
      throw new Error(`Supabase error: ${error.message} (Code: ${error.code})`)
    }
  } else {
    const { error } = await supabase.from("plans").insert(row)
    if (error) {
      throw new Error(`Supabase error: ${error.message} (Code: ${error.code})`)
    }
  }
  revalidatePath("/admin/plans")
  revalidatePath("/plans")
  revalidatePath("/")
}

export async function deletePlan(id: string): Promise<{
  status: "deleted" | "archived"
  message: string
}> {
  await requireAdmin()
  if (isDemoModeEnabled()) {
    revalidatePath("/admin/plans")
    revalidatePath("/plans")
    revalidatePath("/")
    return {
      status: "deleted",
      message: "Plan deleted successfully.",
    }
  }
  const supabase = await createClient()
  const { count, error: countError } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("plan_id", id)

  if (countError) throw new Error(countError.message)

  if ((count ?? 0) > 0) {
    const { error: archiveError } = await supabase
      .from("plans")
      .update({
        is_active: false,
        archived_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (archiveError) throw new Error(archiveError.message)

    revalidatePath("/admin/plans")
    revalidatePath("/plans")
    revalidatePath("/")
    return {
      status: "archived",
      message: "Plan deleted successfully.",
    }
  }

  const { error } = await supabase.from("plans").delete().eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath("/admin/plans")
  revalidatePath("/plans")
  revalidatePath("/")
  return {
    status: "deleted",
    message: "Plan permanently deleted.",
  }
}
