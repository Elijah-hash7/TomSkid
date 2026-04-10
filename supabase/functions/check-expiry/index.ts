import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API = "https://api.resend.com/emails"
const FROM_ADDRESS = "noreply@tomskid.com"

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY")
  if (!apiKey) {
    console.warn("[check-expiry] RESEND_API_KEY not set — skipping email to", to)
    return
  }
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
  })
  if (!res.ok) {
    const text = await res.text()
    console.error("[check-expiry] Resend error:", res.status, text)
  }
}

function reminderHtml(name: string, planName: string, expiresAt: string) {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#0a84ff;margin-bottom:8px">Your eSIM plan expires in 2 days</h2>
  <p>Hi ${name},</p>
  <p>Your <strong>${planName}</strong> plan will expire on <strong>${new Date(expiresAt).toLocaleDateString("en-US", { dateStyle: "long" })}</strong>.</p>
  <p>Refill now to stay connected without interruption.</p>
  <a href="https://tomskid.com/plans" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#0a84ff;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Refill my plan</a>
  <p style="margin-top:24px;color:#888;font-size:13px">— The Tomskid Team</p>
</div>`
}

function expiredHtml(name: string, planName: string) {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#ef4444;margin-bottom:8px">Your eSIM plan has expired</h2>
  <p>Hi ${name},</p>
  <p>Your <strong>${planName}</strong> plan expired today. Your eSIM service has ended.</p>
  <p>Browse our plans to get back online.</p>
  <a href="https://tomskid.com/plans" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#0a84ff;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Browse plans</a>
  <p style="margin-top:24px;color:#888;font-size:13px">— The Tomskid Team</p>
</div>`
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  )

  const now = new Date()

  // ── 2-day reminder window (orders expiring in 1–2 days from now)
  const reminderStart = new Date(now)
  reminderStart.setDate(reminderStart.getDate() + 1)
  reminderStart.setHours(0, 0, 0, 0)
  const reminderEnd = new Date(now)
  reminderEnd.setDate(reminderEnd.getDate() + 2)
  reminderEnd.setHours(23, 59, 59, 999)

  const { data: expiringOrders, error: e1 } = await supabase
    .from("orders")
    .select("id, email, full_name, expires_at, plan:plans(name)")
    .gte("expires_at", reminderStart.toISOString())
    .lte("expires_at", reminderEnd.toISOString())
    .eq("status", "delivered")

  if (e1) console.error("[check-expiry] expiring query error:", e1.message)

  // ── Orders that expired today
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)

  const { data: expiredOrders, error: e2 } = await supabase
    .from("orders")
    .select("id, email, full_name, expires_at, plan:plans(name)")
    .gte("expires_at", todayStart.toISOString())
    .lte("expires_at", todayEnd.toISOString())
    .eq("status", "delivered")

  if (e2) console.error("[check-expiry] expired query error:", e2.message)

  let reminders = 0
  let expirations = 0

  for (const order of expiringOrders ?? []) {
    const planName = (order.plan as { name: string } | null)?.name ?? "your plan"
    await sendEmail(
      order.email,
      "Your Tomskid eSIM plan expires in 2 days",
      reminderHtml(order.full_name, planName, order.expires_at!)
    )
    reminders++
  }

  for (const order of expiredOrders ?? []) {
    const planName = (order.plan as { name: string } | null)?.name ?? "your plan"
    await sendEmail(
      order.email,
      "Your Tomskid eSIM plan has expired",
      expiredHtml(order.full_name, planName)
    )
    expirations++
  }

  return new Response(
    JSON.stringify({ ok: true, reminders_sent: reminders, expiry_notices_sent: expirations }),
    { headers: { "Content-Type": "application/json" } }
  )
})
