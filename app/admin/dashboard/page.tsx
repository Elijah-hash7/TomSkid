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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manual fulfillment overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total orders" value={total} />
        <StatCard title="Pending / processing" value={pending} accent />
        <StatCard title="Delivered" value={delivered} />
      </div>

      <Card className="border-0 bg-card shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ring-border/70">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">Queue status</CardTitle>
            <CardDescription>
              Orders waiting for IMEI review or delivery proof upload.
            </CardDescription>
          </div>
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Package className="size-5" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock3 className="size-4 text-primary" />
              Active queue
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              {pending}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Fulfillment flow
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
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
      className={`border-0 shadow-sm ring-1 ring-border/70 ${accent ? "ring-2 ring-primary/15" : ""}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tabular-nums tracking-tight">
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
