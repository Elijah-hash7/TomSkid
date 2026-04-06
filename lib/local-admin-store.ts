import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"
import type { CarrierRow, OrderRow, PlanRow, PlanWithCarrier } from "@/lib/types/database"
import { carrierCatalog } from "@/lib/carrier-catalog"

export type PlanVisibilityFilter = "active" | "archived" | "all"

type AdminStore = {
  carriers: CarrierRow[]
  plans: PlanRow[]
  orders: OrderRow[]
  archived_plan_ids: string[]
}


const STORE_PATH = path.join(process.cwd(), ".data", "admin-store.json")

const emptyStore: AdminStore = {
  carriers: [],
  plans: [],
  orders: [],
  archived_plan_ids: [],
}


export function isMissingTableError(message: string) {
  return (
    message.includes("Could not find the table") ||
    message.includes("schema cache") ||
    message.includes('relation "') ||
    message.includes("does not exist")
  )
}

export async function readAdminStore(): Promise<AdminStore> {
  try {
    const raw = await readFile(STORE_PATH, "utf8")
    const parsed = JSON.parse(raw) as Partial<AdminStore>
    return {
      carriers: parsed.carriers ?? [],
      plans: (parsed.plans ?? []).map(({ is_active = true, archived_at = null, ...plan }) => ({
        ...plan,
        is_active,
        archived_at,
      })),

      orders: parsed.orders ?? [],
      archived_plan_ids: parsed.archived_plan_ids ?? [],
    }

  } catch {
    return emptyStore
  }
}

export async function writeAdminStore(store: AdminStore) {
  await mkdir(path.dirname(STORE_PATH), { recursive: true })
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8")
}

export async function getLocalCarriers() {
  const store = await readAdminStore()
  return [...store.carriers].sort((a, b) => a.sort_order - b.sort_order)
}

export async function getLocalCarrierBySlug(slug: string) {
  const carriers = await getLocalCarriers()
  return carriers.find((carrier) => carrier.slug === slug) ?? null
}

export async function getLocalPlans(
  carrierId?: string,
  visibility: PlanVisibilityFilter = "active"
): Promise<PlanWithCarrier[]> {
  const store = await readAdminStore()
  const carriersById = new Map(store.carriers.map((carrier) => [carrier.id, carrier]))

  return store.plans
    .filter((plan) => {
      if (carrierId && plan.carrier_id !== carrierId) return false
      if (visibility === "active") return plan.is_active !== false
      if (visibility === "archived") return plan.is_active === false
      return true
    })
    .sort((a, b) => a.price_cents - b.price_cents)
    .flatMap((plan) => {
      const carrier = carriersById.get(plan.carrier_id)
      if (!carrier) return []
      return [
        {
          ...plan,
          carrier: {
            id: carrier.id,
            name: carrier.name,
            slug: carrier.slug,
            logo_url: carrier.logo_url,
          },
        },
      ]
    })
}

export async function getLocalPlanById(id: string) {
  const plans = await getLocalPlans(undefined, "all")
  return plans.find((plan) => plan.id === id) ?? null
}

export async function upsertLocalCarrier(
  id: string | null,
  input: Omit<CarrierRow, "id" | "created_at">
) {
  const store = await readAdminStore()
  const now = new Date().toISOString()

  if (id) {
    store.carriers = store.carriers.map((carrier) =>
      carrier.id === id ? { ...carrier, ...input } : carrier
    )
  } else {
    store.carriers.push({
      id: randomUUID(),
      created_at: now,
      ...input,
    })
  }

  await writeAdminStore(store)
}

export async function deleteLocalCarrier(id: string) {
  const store = await readAdminStore()
  store.carriers = store.carriers.filter((carrier) => carrier.id !== id)
  store.plans = store.plans.filter((plan) => plan.carrier_id !== id)
  await writeAdminStore(store)
}

export async function upsertLocalPlan(
  id: string | null,
  input: Omit<PlanRow, "id" | "created_at">
) {
  const store = await readAdminStore()
  const now = new Date().toISOString()

  if (id) {
    store.plans = store.plans.map((plan) =>
      plan.id === id ? { ...plan, ...input } : plan
    )
  } else {
    const { is_active = true, archived_at = null, ...rest } = input
    store.plans.push({
      id: randomUUID(),
      created_at: now,
      is_active,
      archived_at,
      ...rest,
    })
  }


  await writeAdminStore(store)
}

export async function deleteLocalPlan(id: string) {
  const store = await readAdminStore()
  store.plans = store.plans.filter((plan) => plan.id !== id)
  await writeAdminStore(store)
}

export async function archiveLocalPlan(id: string) {
  const store = await readAdminStore()
  const archivedAt = new Date().toISOString()
  if (!store.archived_plan_ids.includes(id)) {
    store.archived_plan_ids.push(id)
  }
  store.plans = store.plans.map((plan) =>
    plan.id === id ? { ...plan, is_active: false, archived_at: archivedAt } : plan
  )
  await writeAdminStore(store)
}

export async function clearArchivedPlanId(id: string) {
  const store = await readAdminStore()
  store.archived_plan_ids = store.archived_plan_ids.filter((i) => i !== id)
  store.plans = store.plans.map((plan) =>
    plan.id === id ? { ...plan, is_active: true, archived_at: null } : plan
  )
  await writeAdminStore(store)
}

export async function getArchivedPlanIds() {
  const store = await readAdminStore()
  return store.archived_plan_ids
}


export async function countLocalOrdersForPlan(id: string) {
  const store = await readAdminStore()
  return store.orders.filter((order) => order.plan_id === id).length
}

export async function seedLocalCarriers(
  carriers: ReadonlyArray<{
    name: string
    slug: string
    description: string | null
    logo_url: string | null
    sort_order: number
  }> = carrierCatalog
) {
  const store = await readAdminStore()
  const now = new Date().toISOString()

  for (const carrier of carriers) {
    const existing = store.carriers.find((item) => item.slug === carrier.slug)
    if (existing) {
      Object.assign(existing, carrier)
      continue
    }

    store.carriers.push({
      id: randomUUID(),
      created_at: now,
      ...carrier,
    })
  }

  await writeAdminStore(store)
}
