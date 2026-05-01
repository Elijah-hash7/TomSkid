"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  orderFormSchema,
  paymentReferenceSchema,
  type OrderFormValues,
} from "@/lib/validation/order"
import { STORAGE_BUCKETS } from "@/lib/storage"
import { getServerUser } from "@/lib/supabase/auth"
import { buildNewOrderEmail, sendEmail } from "@/lib/email"
import { formatMoney } from "@/lib/format"

type OrderFieldName = keyof Omit<OrderFormValues, "plan_id">
type OrderFieldErrors = Partial<Record<OrderFieldName, string>>

export type SubmitOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error?: string; fieldErrors?: OrderFieldErrors }

const allowedReceiptTypes = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
])

export async function submitOrder(formData: FormData): Promise<SubmitOrderResult> {
  const { user } = await getServerUser()
  if (!user) return { ok: false, error: "Please sign in to place an order." }

  const parsed = orderFormSchema.safeParse({
    plan_id: String(formData.get("plan_id") ?? ""),
    full_name: String(formData.get("full_name") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    phone_model: String(formData.get("phone_model") ?? "").trim(),
    zip_code: String(formData.get("zip_code") ?? "").trim(),
    imei: String(formData.get("imei") ?? "").trim(),
    eid: String(formData.get("eid") ?? "").trim(),
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

  const paymentReference = paymentReferenceSchema.safeParse(
    String(formData.get("payment_reference") ?? "").trim().toUpperCase()
  )
  if (!paymentReference.success) {
    return { ok: false, error: paymentReference.error.issues[0]?.message }
  }

  const receipt = formData.get("payment_receipt")
  if (!(receipt instanceof File) || receipt.size === 0) {
    return { ok: false, error: "Upload your payment receipt to continue." }
  }
  if (!allowedReceiptTypes.has(receipt.type)) {
    return { ok: false, error: "Receipt must be a JPG, PNG, or PDF file." }
  }

  const supabase = await createClient()
  const orderId = crypto.randomUUID()
  const safeName = receipt.name.replace(/[^\w.\-]/g, "_") || "receipt"
  const receiptPath = `${user.id}/${paymentReference.data}/${safeName}`

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.payment)
    .upload(receiptPath, receipt, {
      cacheControl: "3600",
      contentType: receipt.type || undefined,
      upsert: false,
    })

  if (uploadError) {
    return { ok: false, error: uploadError.message }
  }

  const { data: order, error: insertError } = await supabase
    .from("orders")
    .insert({
      id: orderId,
      user_id: user.id,
      plan_id: parsed.data.plan_id,
      status: "pending",
      full_name: parsed.data.full_name,
      state: parsed.data.state,
      phone_model: parsed.data.phone_model,
      zip_code: parsed.data.zip_code,
      imei: parsed.data.imei,
      eid: parsed.data.eid,
      email: parsed.data.email,
      payment_reference: paymentReference.data,
      payment_receipt_path: receiptPath,
    })
    .select("id")
    .single()

  if (insertError || !order) {
    await supabase.storage.from(STORAGE_BUCKETS.payment).remove([receiptPath])
    return { ok: false, error: insertError?.message ?? "Could not create order." }
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? "tomiwatomiwa966@gmail.com"
  const { data: planRow } = await supabase
    .from("plans")
    .select("name, price_cents, currency, carrier:carriers(name)")
    .eq("id", parsed.data.plan_id)
    .single<{ name: string; price_cents: number; currency: string; carrier: { name: string } | null }>()

  if (planRow) {
    const { subject, html } = buildNewOrderEmail({
      orderId: order.id,
      customerName: parsed.data.full_name,
      customerEmail: parsed.data.email,
      planName: planRow.name,
      carrierName: planRow.carrier?.name ?? "—",
      amount: formatMoney(planRow.price_cents, planRow.currency),
      paymentReference: paymentReference.data,
      imei: parsed.data.imei,
      eid: parsed.data.eid,
      phoneModel: parsed.data.phone_model,
      state: parsed.data.state,
      zipCode: parsed.data.zip_code,
    })
    void sendEmail({ to: adminEmail, subject, html })
  }

  revalidatePath("/orders")
  revalidatePath("/profile")
  revalidatePath("/admin/orders")
  return { ok: true, orderId: order.id }
}
