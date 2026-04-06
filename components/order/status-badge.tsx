import { Badge } from "@/components/ui/badge"
import type { OrderStatus } from "@/lib/types/database"
import { cn } from "@/lib/utils"

const styles: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className:
      "border-amber-200/80 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100",
  },
  processing: {
    label: "Processing",
    className:
      "border-primary/25 bg-primary/5 text-primary",
  },
  delivered: {
    label: "Delivered",
    className:
      "border-emerald-200/80 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100",
  },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = styles[status]
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", s.className)}
    >
      {s.label}
    </Badge>
  )
}
