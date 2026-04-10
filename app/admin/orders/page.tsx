import Link from "next/link"
import { AlertTriangle, ChevronRight } from "lucide-react"
import { OrderStatusBadge } from "@/components/order/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate, formatMoney } from "@/lib/format"
import { getAllOrders } from "@/lib/data/queries"
import type { OrderStatus } from "@/lib/types/database"

function getExpiryWarning(expiresAt: string | null): "expired" | "soon" | null {
  if (!expiresAt) return null
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms < 0) return "expired"
  if (ms < 2 * 24 * 60 * 60 * 1000) return "soon"
  return null
}

const FILTERS: Array<{ label: string; value: "all" | OrderStatus }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Delivered", value: "delivered" },
]

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>
}) {
  const params = (await searchParams) ?? {}
  const currentFilter = FILTERS.some((item) => item.value === params.status)
    ? (params.status as "all" | OrderStatus)
    : "all"

  const orders = await getAllOrders()
  const filteredOrders =
    currentFilter === "all"
      ? orders
      : orders.filter((order) => order.status === currentFilter)

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground/80">
          Newest first. Filter by status and open any order to view full details.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = filter.value === currentFilter
          const href =
            filter.value === "all"
              ? "/admin/orders"
              : `/admin/orders?status=${filter.value}`

          return (
            <Link
              key={filter.value}
              href={href}
              className={[
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-150",
                active
                  ? "border-primary/30 bg-primary/[0.08] text-primary"
                  : "border-border/70 bg-card text-foreground/60 hover:text-foreground hover:border-border hover:bg-accent/60",
              ].join(" ")}
            >
              {filter.label}
            </Link>
          )
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
          No {currentFilter === "all" ? "" : currentFilter + " "}orders yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {filteredOrders.map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`} className="block">
              <Card className="overflow-hidden border-0 bg-card shadow-[var(--shadow-card)] ring-1 ring-border/50 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]">
                <CardContent className="space-y-4 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {order.full_name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground/80">
                        {order.plan.carrier.name} · {order.plan.name}
                      </p>
                    </div>
                    <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground/40" />
                  </div>

                  <div className="grid gap-3 rounded-xl bg-muted/30 p-3 text-sm sm:grid-cols-3">
                    <InfoPair
                      label="Amount"
                      value={formatMoney(order.plan.price_cents, order.plan.currency)}
                    />
                    <InfoPair label="When" value={formatDate(order.created_at)} />
                    <InfoPair label="State" value={order.state} />
                  </div>

                  <div className="rounded-xl border border-border/60 bg-white/70 px-3 py-2.5">
                    <InfoPair
                      label="Payment reference"
                      value={order.payment_reference ?? "Not provided"}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      {(() => {
                        const w = getExpiryWarning(order.expires_at ?? null)
                        if (!w) return null
                        return (
                          <span className={[
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold",
                            w === "expired"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700",
                          ].join(" ")}>
                            <AlertTriangle className="size-3" />
                            {w === "expired" ? "Expired" : "Expiring soon"}
                          </span>
                        )
                      })()}
                    </div>
                    <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/50">
                      Open details
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
