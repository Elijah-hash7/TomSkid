import Link from "next/link"
import { redirect } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { OrderStatusBadge } from "@/components/order/status-badge"
import { BackButton } from "@/components/ui/back-button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate, formatMoney } from "@/lib/format"
import { getOrdersForUser } from "@/lib/data/queries"
import { getServerUser } from "@/lib/supabase/auth"
import type { OrderStatus } from "@/lib/types/database"

const FILTERS: Array<{ label: string; value: "all" | Extract<OrderStatus, "pending" | "delivered"> }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Delivered", value: "delivered" },
]

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>
}) {
  const { user } = await getServerUser()
  if (!user) {
    redirect("/login?next=/orders")
  }

  const params = (await searchParams) ?? {}
  const activeFilter = FILTERS.some((filter) => filter.value === params.status)
    ? (params.status as "all" | "pending" | "delivered")
    : "all"

  const orders = await getOrdersForUser(user.id)
  const filteredOrders =
    activeFilter === "all"
      ? orders
      : activeFilter === "pending"
        ? orders.filter((order) => order.status !== "delivered")
        : orders.filter((order) => order.status === "delivered")

  return (
    <div className="flex flex-col">
      <header className="border-b border-border/50 bg-card/70 px-5 py-8">
        <div className="mx-auto max-w-lg">
          <BackButton label="Back" />
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground/80">
            Status updates appear here as we process your request.
          </p>
        </div>
      </header>
      <div className="mx-auto w-full max-w-lg flex-1 space-y-4 px-5 py-8">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const href =
              filter.value === "all" ? "/orders" : `/orders?status=${filter.value}`
            const active = activeFilter === filter.value

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
          <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
            No {activeFilter === "all" ? "" : `${activeFilter} `}orders yet.{" "}
            <Link
              href="/plans"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Browse plans
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} className="block">
              <Card className="border-0 shadow-[var(--shadow-card)] ring-1 ring-border/50 transition-all duration-150 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate font-medium leading-tight">
                      {o.plan.carrier.name} · {o.plan.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(o.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold tabular-nums text-primary">
                      {formatMoney(o.plan.price_cents, o.plan.currency)}
                    </span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
          </div>
        )}
      </div>
    </div>
  )
}
