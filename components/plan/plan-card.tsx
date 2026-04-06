import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { formatMoney } from "@/lib/format"
import type { PlanWithCarrier } from "@/lib/types/database"
import { cn } from "@/lib/utils"

type PlanCardProps = {
  plan: PlanWithCarrier
  href?: string
  ctaLabel?: string
  className?: string
  emphasize?: boolean
}

export function PlanCard({
  plan,
  href,
  ctaLabel = "Select plan",
  className,
  emphasize,
}: PlanCardProps) {
  const features = plan.features?.length ? plan.features : ["5G / LTE", "US coverage"]
  const target = href ?? `/order?planId=${plan.id}`

  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-3xl border border-border/50 bg-card shadow-[var(--shadow-premium)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        emphasize && "ring-2 ring-primary/20",
        className
      )}
    >

      <CardHeader className="gap-3 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
              {plan.carrier.name}
            </p>
            <h3 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {plan.name}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black tabular-nums tracking-tighter text-primary">
              {formatMoney(plan.price_cents, plan.currency)}
            </p>
            <p className="text-[10px] font-medium text-muted-foreground/70">
              {plan.data_label} · {plan.validity_days} days
            </p>
          </div>

        </div>
        {plan.badge ? (
          <Badge variant="secondary" className="w-fit font-normal">
            {plan.badge}
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <ul className="flex flex-wrap gap-2">
          {features.slice(0, 4).map((f) => (
            <li
              key={f}
              className="rounded-full bg-muted/80 px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {f}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="border-t border-border/40 bg-muted/10 p-4">
        <Button 
          className="w-full rounded-[1.25rem] bg-gradient-to-r from-[#0A84FF] to-[#0070EE] font-bold shadow-md shadow-primary/10 transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]" 
          size="lg" 
          asChild
        >
          <Link href={target}>
            {ctaLabel}
            <ArrowUpRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Button>
      </CardFooter>

    </Card>
  )
}
