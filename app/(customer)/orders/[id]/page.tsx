import { notFound, redirect } from "next/navigation"
import { OrderStatusBadge } from "@/components/order/status-badge"
import { BackButton } from "@/components/ui/back-button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatDate, formatMoney } from "@/lib/format"
import { getOrderForUser } from "@/lib/data/queries"
import { getStoragePublicUrl, STORAGE_BUCKETS } from "@/lib/storage"
import { getServerUser } from "@/lib/supabase/auth"

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { user } = await getServerUser()
  if (!user) {
    redirect(`/login?next=/orders/${id}`)
  }

  const order = await getOrderForUser(id, user.id)
  if (!order) notFound()

  const proofUrl = await getStoragePublicUrl(
    STORAGE_BUCKETS.delivery,
    order.delivery_proof_path
  )

  return (
    <div className="flex flex-col">
      <header className="border-b border-border/60 bg-muted/20 px-5 md:px-10 lg:px-14 py-6">
        <div className="mx-auto max-w-lg md:max-w-none">
          <BackButton label="Back" />
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Order detail
          </h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg md:max-w-3xl flex-1 space-y-6 px-5 md:px-10 lg:px-14 py-8">
        <Card className="border-0 shadow-sm ring-1 ring-border/70">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
            <CardTitle className="text-lg">
              {order.plan.carrier.name} · {order.plan.name}
            </CardTitle>
            <OrderStatusBadge status={order.status} />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold tabular-nums text-primary">
                {formatMoney(order.plan.price_cents, order.plan.currency)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Placed</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Email</span>
              <span className="truncate">{order.email}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border/70">
          <CardHeader>
            <CardTitle className="text-base">Submitted details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <DetailRow label="Full name" value={order.full_name} />
            <DetailRow label="Email" value={order.email} />
            <DetailRow label="Phone model" value={order.phone_model} />
            <DetailRow label="State needed" value={order.state} />
            <DetailRow label="ZIP code" value={order.zip_code} />
            <DetailRow label="IMEI" value={order.imei} mono />
          </CardContent>
        </Card>

        {proofUrl ? (
          <Card className="border-0 shadow-sm ring-1 ring-border/70">
            <CardHeader>
              <CardTitle className="text-base">Delivery confirmation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                Your order includes the following proof from our team.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proofUrl}
                alt="Delivery proof"
                className="max-h-80 w-full rounded-xl border border-border object-contain"
              />
            </CardContent>
          </Card>
        ) : order.status === "delivered" ? (
          <p className="text-sm text-muted-foreground">
            Proof image will appear here once uploaded by our team.
          </p>
        ) : null}
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className={mono ? "mt-1 font-mono text-sm text-foreground" : "mt-1 text-sm font-medium text-foreground"}>
        {value}
      </p>
    </div>
  )
}
