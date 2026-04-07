import { Clock3, Package, ShieldCheck } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getDashboardCounts } from "@/lib/data/queries"

export default async function AdminDashboardPage() {
  const { total, pending, delivered } = await getDashboardCounts()

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground/80">
          Manual fulfillment overview.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard title="Total orders" value={total} />
        <StatCard title="Pending / processing" value={pending} accent />
        <StatCard title="Delivered" value={delivered} />
      </div>

      <Card className="border-0 bg-card shadow-[var(--shadow-premium)] ring-1 ring-border/50">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 pt-5">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold">Queue status</CardTitle>
            <CardDescription className="text-xs">
              Orders waiting for IMEI review or delivery proof upload.
            </CardDescription>
          </div>
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
            <Package className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 pb-5">
          <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Clock3 className="size-3.5 text-primary/70" />
              Active queue
            </div>
            <p className="mt-3 text-4xl font-bold tracking-tight text-foreground">
              {pending}
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary/70" />
              Fulfillment flow
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground/80">
              New orders surface in the Orders section automatically so the team
              can jump straight into review.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  accent,
}: {
  title: string
  value: number
  accent?: boolean
}) {
  return (
    <Card
      className={`border-0 shadow-[var(--shadow-card)] ring-1 ${accent ? "ring-primary/20 bg-primary/[0.02]" : "ring-border/50"}`}
    >
      <CardHeader className="pb-1 pt-5">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-5">
        <p className={`text-4xl font-bold tabular-nums tracking-tight ${accent ? "text-primary" : "text-foreground"}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
