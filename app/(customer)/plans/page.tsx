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
      <header className="rounded-b-[3rem] md:rounded-none bg-gradient-to-b from-[#0A84FF] to-[#0066CC] px-5 md:px-10 lg:px-14 pb-10 pt-10 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
        <div className="relative md:flex md:items-end md:justify-between md:gap-8 max-w-none">
          <div className="space-y-1">
            <h1 className="text-[2rem] font-bold tracking-tight leading-tight">
              Browse plans
            </h1>
            <p className="text-white/70 text-sm font-medium">
              Filter by carrier. Every price includes manual activation support.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 mt-2 md:mt-0">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
              🇺🇸 US Coverage
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
              5G / LTE
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg md:max-w-none flex-1 space-y-10 px-5 md:px-10 lg:px-14 py-12">
        <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
        "shrink-0 rounded-2xl border px-5 py-2.5 text-sm font-bold transition-all duration-300",
        active
          ? "border-primary bg-primary text-white shadow-[0_4px_12px_rgba(10,132,255,0.25)] scale-105"
          : "border-border/60 bg-card text-muted-foreground/80 hover:border-primary/40 hover:text-foreground hover:bg-accent/50"
      )}
    >

      {label}
    </Link>
  )
}
