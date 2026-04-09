import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatMoney } from "@/lib/format"
import { getPlans } from "@/lib/data/queries"
import type { CarrierRow } from "@/lib/types/database"
import { cn } from "@/lib/utils"

function CarrierCard({
  carrier,
  minCents,
}: {
  carrier: CarrierRow
  minCents: number | null
}) {
  return (
    <Link href={`/carriers/${carrier.slug}`} className="group block">
      <Card
        className={cn(
          "h-full border-0 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] ring-1 ring-border/70 transition-all hover:ring-primary/25"
        )}
      >
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              {carrier.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={carrier.logo_url}
                  alt=""
                  className="size-11 shrink-0 rounded-xl bg-white object-contain p-1 ring-1 ring-border/60"
                />
              ) : (
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-semibold text-muted-foreground">
                  {carrier.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium leading-tight text-foreground">
                  {carrier.name}
                </p>
                {minCents != null ? (
                  <p className="text-xs text-muted-foreground">
                    From {formatMoney(minCents, "NGN")}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">View plans</p>
                )}
              </div>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export async function CarrierGrid({ carriers }: { carriers: CarrierRow[] }) {
  if (!carriers.length) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
        Carrier options will appear here once they are available.
      </p>
    )
  }

  const allPlans = await getPlans()
  const minByCarrier = new Map<string, number>()
  for (const p of allPlans) {
    const cur = minByCarrier.get(p.carrier_id)
    if (cur === undefined || p.price_cents < cur) {
      minByCarrier.set(p.carrier_id, p.price_cents)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {carriers.map((c) => (
        <CarrierCard
          key={c.id}
          carrier={c}
          minCents={minByCarrier.get(c.id) ?? null}
        />
      ))}
    </div>
  )
}
