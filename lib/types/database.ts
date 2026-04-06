/** Expected Supabase tables — align names/columns with backend migrations. */

export type OrderStatus = "pending" | "processing" | "delivered"

export type CarrierRow = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  description: string | null
  sort_order: number
  created_at: string
}

export type PlanRow = {
  id: string
  carrier_id: string
  name: string
  data_label: string
  validity_days: number
  price_cents: number
  currency: string
  features: string[] | null
  badge: string | null
  is_featured: boolean
  is_active: boolean
  archived_at: string | null
  created_at: string
}

export type OrderRow = {
  id: string
  user_id: string
  plan_id: string
  status: OrderStatus
  full_name: string
  state: string
  phone_model: string
  zip_code: string
  imei: string
  email: string
  imei_screenshot_path: string | null
  delivery_proof_path: string | null
  created_at: string
  updated_at: string
}

export type PlanWithCarrier = PlanRow & {
  carrier: Pick<CarrierRow, "id" | "name" | "slug" | "logo_url">
}

export type OrderWithPlan = OrderRow & {
  plan: PlanRow & { carrier: Pick<CarrierRow, "name" | "slug"> }
}
