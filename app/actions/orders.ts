"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  orderFormSchema,
  type OrderFormValues,
} from "@/lib/validation/order"
import { getServerUser } from "@/lib/supabase/auth"

type OrderFieldName = keyof Omit<OrderFormValues, "plan_id">
type OrderFieldErrors = Partial<Record<OrderFieldName, string>>

export type SubmitOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error?: string; fieldErrors?: OrderFieldErrors }

export async function submitOrder(formData: FormData): Promise<SubmitOrderResult> {
  const { user } = await getServerUser()
  if (!user) return { ok: false, error: "Please sign in to place an order." }

  const supabase = await createClient()

  const parsed = orderFormSchema.safeParse({
    plan_id: String(formData.get("plan_id") ?? ""),
    full_name: String(formData.get("full_name") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    phone_model: String(formData.get("phone_model") ?? "").trim(),
    zip_code: String(formData.get("zip_code") ?? "").trim(),
    imei: String(formData.get("imei") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
  })
  if (!parsed.success) {
    const fieldErrors: OrderFieldErrors = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]
      if (
        field &&
        field !== "plan_id" &&
        typeof field === "string" &&
        !(field in fieldErrors)
      ) {
        fieldErrors[field as OrderFieldName] = issue.message
      }
    }
    return { ok: false, fieldErrors }
  }

  const { data: order, error: insertError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      plan_id: parsed.data.plan_id,
      status: "pending",
      full_name: parsed.data.full_name,
      state: parsed.data.state,
      phone_model: parsed.data.phone_model,
      zip_code: parsed.data.zip_code,
      imei: parsed.data.imei,
      email: parsed.data.email,
    })
    .select("id")
    .single()

  if (insertError || !order) {
    return { ok: false, error: insertError?.message ?? "Could not create order." }
  }

  revalidatePath("/orders")
  revalidatePath("/profile")
  return { ok: true, orderId: order.id }
}
