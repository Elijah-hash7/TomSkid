import Link from "next/link"
import { notFound } from "next/navigation"
import { AdminOrderPanel } from "@/components/admin/admin-order-panel"
import { formatDate, formatMoney } from "@/lib/format"
import { getOrderByIdAdmin } from "@/lib/data/queries"
import { getStoragePublicUrl, STORAGE_BUCKETS } from "@/lib/storage"

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrderByIdAdmin(id)
  if (!order) notFound()

  const [imeiImageUrl, proofUrl, paymentReceiptUrl] = await Promise.all([
    getStoragePublicUrl(STORAGE_BUCKETS.imei, order.imei_screenshot_path),
    getStoragePublicUrl(STORAGE_BUCKETS.delivery, order.delivery_proof_path),
    getStoragePublicUrl(STORAGE_BUCKETS.payment, order.payment_receipt_path),
  ])

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/orders"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← All orders
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {order.full_name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {order.plan.carrier.name} · {order.plan.name} ·{" "}
          {formatMoney(order.plan.price_cents, order.plan.currency)} ·{" "}
          {formatDate(order.created_at)}
        </p>
      </div>

      <AdminOrderPanel
        order={order}
        imeiImageUrl={imeiImageUrl}
        proofUrl={proofUrl}
        paymentReceiptUrl={paymentReceiptUrl}
      />
    </div>
  )
}
