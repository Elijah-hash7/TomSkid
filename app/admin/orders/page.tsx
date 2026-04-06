import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { OrderStatusBadge } from "@/components/order/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate, formatMoney } from "@/lib/format"
import { getAllOrders } from "@/lib/data/queries"
import type { OrderStatus } from "@/lib/types/database"

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
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
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
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(10,132,255,0.18)]"
                  : "border-border bg-white text-foreground hover:bg-muted/60",
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
              <Card className="overflow-hidden border-0 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_rgba(15,23,42,0.06)] ring-1 ring-border/70 transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(15,23,42,0.10)]">
                <CardContent className="space-y-4 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-base font-semibold text-foreground">
                        {order.full_name}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {order.plan.carrier.name} · {order.plan.name}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                  </div>

                  <div className="grid gap-3 rounded-2xl bg-muted/25 p-3 text-sm sm:grid-cols-3">
                    <InfoPair
                      label="Amount"
                      value={formatMoney(order.plan.price_cents, order.plan.currency)}
                    />
                    <InfoPair label="When" value={formatDate(order.created_at)} />
                    <InfoPair label="State" value={order.state} />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
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
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  )
}
