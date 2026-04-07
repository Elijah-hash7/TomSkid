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
        "group overflow-hidden rounded-2xl border-0 bg-card shadow-[var(--shadow-premium)] ring-1 ring-border/50 transition-all duration-200 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5",
        emphasize && "ring-primary/25 shadow-[0_4px_6px_rgba(10,132,255,0.06),0_16px_40px_rgba(10,132,255,0.10)]",
        className
      )}
    >
      <CardHeader className="gap-3 pb-2 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/55">
              {plan.carrier.name}
            </p>
            <h3 className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {plan.name}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold tabular-nums tracking-tight text-primary">
              {formatMoney(plan.price_cents, plan.currency)}
            </p>
            <p className="text-[10px] font-medium text-muted-foreground/60">
              {plan.data_label} · {plan.validity_days}d
            </p>
          </div>
        </div>
        {plan.badge ? (
          <Badge variant="secondary" className="w-fit text-[11px] font-medium">
            {plan.badge}
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="pb-4 pt-0">
        <ul className="flex flex-wrap gap-1.5">
          {features.slice(0, 4).map((f) => (
            <li
              key={f}
              className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[11px] text-muted-foreground/70"
            >
              {f}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="border-t border-border/40 bg-muted/[0.06] p-4">
        <Button
          className="w-full rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#0070EE] font-semibold shadow-[0_2px_8px_rgba(10,132,255,0.20)] transition-all hover:shadow-[0_4px_14px_rgba(10,132,255,0.30)] active:scale-[0.98]"
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
