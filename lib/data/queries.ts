import { createClient } from "@/lib/supabase/server"
import { carrierCatalog, getCatalogRows } from "@/lib/carrier-catalog"
import { demoCarriers, demoOrders, demoPlans } from "@/lib/demo-data"
import { isDemoModeEnabled } from "@/lib/demo-mode"
import {
  getLocalCarrierBySlug,
  getLocalCarriers,
  isMissingTableError,
  type PlanVisibilityFilter,
  readAdminStore,
  seedLocalCarriers,
} from "@/lib/local-admin-store"
import type {
  CarrierRow,
  OrderRow,
  OrderWithPlan,
  PlanWithCarrier,
} from "@/lib/types/database"

export async function getCarriers(): Promise<CarrierRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("carriers")
    .select("*")
    .order("sort_order", { ascending: true })
  if (error) {
    console.error("[getCarriers]", error.message)
    if (isMissingTableError(error.message)) {
      const local = await getLocalCarriers()
      if (local.length > 0) return local
      await seedLocalCarriers()
      return getLocalCarriers()
    }
    return []
  }
  const rows = (data ?? []) as CarrierRow[]
  return rows.length > 0 ? rows : getCatalogRows()
}

export async function getCarrierBySlug(
  slug: string
): Promise<CarrierRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("carriers")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()
  if (error) {
    console.error("[getCarrierBySlug]", error.message)
    if (isMissingTableError(error.message)) {
      const local = await getLocalCarrierBySlug(slug)
      if (local) return local
      return getCatalogRows().find((carrier) => carrier.slug === slug) ?? null
    }
    return null
  }
  if (data) return data as CarrierRow | null
  return getCatalogRows().find((carrier) => carrier.slug === slug) ?? null
}

export async function getPlans(
  carrierId?: string,
  visibility: PlanVisibilityFilter = "active"
): Promise<PlanWithCarrier[]> {
  const supabase = await createClient()
  let q = supabase
    .from("plans")
    .select(
      `
      *,
      carrier:carriers ( id, name, slug, logo_url )
    `
    )
    .order("price_cents", { ascending: true })
  if (visibility === "active") {
    q = q.eq("is_active", true)
  } else if (visibility === "archived") {
    q = q.eq("is_active", false)
  }
  if (carrierId) {
    q = q.eq("carrier_id", carrierId)
  }
  const { data, error } = await q
  if (error) {
    console.error("[getPlans]", error.message)
    return []
  }
  return (data ?? []) as PlanWithCarrier[]
}

export async function getPlanById(
  id: string,
  options?: { includeArchived?: boolean }
): Promise<PlanWithCarrier | null> {
  const supabase = await createClient()
  let q = supabase
    .from("plans")
    .select(
      `
      *,
      carrier:carriers ( id, name, slug, logo_url )
    `
    )
    .eq("id", id)
  if (!options?.includeArchived) {
    q = q.eq("is_active", true)
  }
  const { data, error } = await q.maybeSingle()
  if (error) {
    console.error("[getPlanById]", error.message)
    return null
  }
  return data as PlanWithCarrier | null
}

export async function getFeaturedPlans(
  limit = 6
): Promise<PlanWithCarrier[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("plans")
    .select(
      `
      *,
      carrier:carriers ( id, name, slug, logo_url )
    `
    )
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("price_cents", { ascending: true })
    .limit(limit)
  if (error) {
    console.error("[getFeaturedPlans]", error.message)
    return []
  }
  if (data?.length) return data as PlanWithCarrier[]
  const fallback = await supabase
    .from("plans")
    .select(
      `
      *,
      carrier:carriers ( id, name, slug, logo_url )
    `
    )
    .eq("is_active", true)
    .order("price_cents", { ascending: true })
    .limit(limit)
  if (fallback.error) {
    console.error("[getFeaturedPlans fallback]", fallback.error.message)
    return []
  }
  return (fallback.data ?? []) as PlanWithCarrier[]
}

export async function getOrdersForUser(
  userId: string
): Promise<OrderWithPlan[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      plan:plans (
        *,
        carrier:carriers ( name, slug )
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) {
    console.error("[getOrdersForUser]", error.message)
    return []
  }
  return (data ?? []) as OrderWithPlan[]
}

export async function getOrderForUser(
  orderId: string,
  userId: string
): Promise<OrderWithPlan | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      plan:plans (
        *,
        carrier:carriers ( name, slug )
      )
    `
    )
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle()
  if (error) {
    console.error("[getOrderForUser]", error.message)
    return null
  }
  return data as OrderWithPlan | null
}

/** Admin */
export async function getAllOrders(): Promise<OrderWithPlan[]> {
  if (isDemoModeEnabled()) {
    return demoOrders
  }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      plan:plans (
        *,
        carrier:carriers ( name, slug )
      )
    `
    )
    .order("created_at", { ascending: false })
  if (error) {
    console.error("[getAllOrders]", error.message)
    if (isMissingTableError(error.message)) {
      const store = await readAdminStore()
      if (!store.orders.length) return []
    }
    return []
  }
  return (data ?? []) as OrderWithPlan[]
}

export async function getOrderByIdAdmin(
  orderId: string
): Promise<OrderWithPlan | null> {
  if (isDemoModeEnabled()) {
    return demoOrders.find((order) => order.id === orderId) ?? null
  }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      plan:plans (
        *,
        carrier:carriers ( name, slug )
      )
    `
    )
    .eq("id", orderId)
    .maybeSingle()
  if (error) {
    console.error("[getOrderByIdAdmin]", error.message)
    if (isMissingTableError(error.message)) {
      return null
    }
    return null
  }
  return data as OrderWithPlan | null
}

export async function getPlansAdmin(): Promise<PlanWithCarrier[]> {
  if (isDemoModeEnabled()) {
    return demoPlans
  }
  return getPlans(undefined, "all")
}

export async function getCarriersAdmin(): Promise<CarrierRow[]> {
  if (isDemoModeEnabled()) {
    return demoCarriers
  }
  const carriers = await getCarriers()
  if (carriers.some((carrier) => carrier.id.startsWith("catalog-"))) {
    const supabase = await createClient()
    const { data, error } = await supabase.from("carriers").select("id, slug")
    if (error && isMissingTableError(error.message)) {
      await seedLocalCarriers()
      return getLocalCarriers()
    }
    if (!error) {
      const existing = new Map((data ?? []).map((row) => [row.slug, row.id]))
      for (const carrier of carrierCatalog) {
        const id = existing.get(carrier.slug)
        if (id) {
          await supabase.from("carriers").update(carrier).eq("id", id)
        } else {
          await supabase.from("carriers").insert(carrier)
        }
      }
      return getCarriers()
    }
  }
  return carriers
}

export type DashboardCounts = {
  total: number
  pending: number
  delivered: number
}

export async function getDashboardCounts(): Promise<DashboardCounts> {
  if (isDemoModeEnabled()) {
    const total = demoOrders.length
    const pending = demoOrders.filter(
      (r) => r.status === "pending" || r.status === "processing"
    ).length
    const delivered = demoOrders.filter((r) => r.status === "delivered").length
    return { total, pending, delivered }
  }
  const supabase = await createClient()
  const { data, error } = await supabase.from("orders").select("status")
  if (error) {
    console.error("[getDashboardCounts]", error.message)
    if (isMissingTableError(error.message)) {
      const store = await readAdminStore()
      const total = store.orders.length
      const pending = store.orders.filter(
        (r) => r.status === "pending" || r.status === "processing"
      ).length
      const delivered = store.orders.filter((r) => r.status === "delivered").length
      return { total, pending, delivered }
    }
    return { total: 0, pending: 0, delivered: 0 }
  }
  const rows = (data ?? []) as Pick<OrderRow, "status">[]
  const total = rows.length
  const pending = rows.filter(
    (r) => r.status === "pending" || r.status === "processing"
  ).length
  const delivered = rows.filter((r) => r.status === "delivered").length
  return { total, pending, delivered }
}
