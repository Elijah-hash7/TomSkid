import { getOrdersForUser } from "@/lib/data/queries"
import { getServerUser } from "@/lib/supabase/auth"
import { ExpiryWarningModal, type ExpiringOrder } from "./expiry-warning-modal"

export async function ExpiryWarningProvider() {
  const { user } = await getServerUser()
  if (!user) return null

  const orders = await getOrdersForUser(user.id)
  const now = Date.now()
  const twoDays = 2 * 24 * 60 * 60 * 1000

  // Find the most urgent delivered order with an expiry in range
  const urgent = orders
    .filter((o) => o.status === "delivered" && o.expires_at)
    .map((o) => ({
      order: o,
      ms: new Date(o.expires_at!).getTime() - now,
    }))
    .filter(({ ms }) => ms < twoDays) // expired (ms < 0) or expiring within 2 days
    .sort((a, b) => a.ms - b.ms) // most urgent first
    [0]

  if (!urgent) return null

  const { order } = urgent
  const expiringOrder: ExpiringOrder = {
    orderId: order.id,
    planId: order.plan_id,
    planName: order.plan.name,
    expiresAt: order.expires_at!,
    isExpired: urgent.ms < 0,
  }

  return <ExpiryWarningModal order={expiringOrder} />
}
