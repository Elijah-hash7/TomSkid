import Link from "next/link"
import { PlanCard } from "@/components/plan/plan-card"
import { cn } from "@/lib/utils"
import { getCarriers, getPlans } from "@/lib/data/queries"

type SearchParams = { carrier?: string }

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { carrier: carrierId } = await searchParams
  const [carriers, plans] = await Promise.all([
    getCarriers(),
    getPlans(carrierId),
  ])

  return (
    <div className="flex flex-col">
      <header className="relative overflow-hidden rounded-b-[3rem] bg-gradient-to-b from-[#1A8FFF] via-[#0A84FF] to-[#0060CC] px-5 pb-10 pt-10 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none" />
        <div className="relative space-y-4">
          <div className="space-y-1">
            <h1 className="text-[2rem] font-bold tracking-tight leading-tight">
              Browse plans
            </h1>
            <p className="text-sm text-white/70">
              Filter by carrier. Every price includes manual activation support.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/20 bg-white/[0.10] px-3 py-1 text-[11px] font-medium text-white/85">
              🇺🇸 US Coverage
            </span>
            <span className="rounded-full border border-white/20 bg-white/[0.10] px-3 py-1 text-[11px] font-medium text-white/85">
              5G / LTE
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg flex-1 space-y-8 px-5 py-8">
        <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterPill
            href="/plans"
            active={!carrierId}
            label="All"
          />
          {carriers.map((c) => (
            <FilterPill
              key={c.id}
              href={`/plans?carrier=${c.id}`}
              active={carrierId === c.id}
              label={c.name}
            />
          ))}
        </div>

        {plans.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-12 text-center text-sm text-muted-foreground">
            No plans for this filter yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {plans.map((p) => (
              <PlanCard key={p.id} plan={p} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

function FilterPill({
  href,
  active,
  label,
}: {
  href: string
  active: boolean
  label: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-150",
        active
          ? "border-primary/30 bg-primary/[0.08] text-primary"
          : "border-border/60 bg-card text-foreground/55 hover:text-foreground/80 hover:bg-accent/60 hover:border-border"
      )}
    >

      {label}
    </Link>
  )
}
