import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Hero } from "@/components/marketing/hero"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/format"
import { getCarriers, getOrdersForUser, getPlans } from "@/lib/data/queries"
import { getServerUser } from "@/lib/supabase/auth"
import type { CarrierRow, PlanWithCarrier } from "@/lib/types/database"

export default async function HomePage() {
  const { user } = await getServerUser()
  const [carriers, plans] = await Promise.all([
    getCarriers(),
    getPlans(),
  ])
  const featuredCarriers = pickFeaturedCarriers(carriers, 6)
  const userOrders = user ? await getOrdersForUser(user.id) : []
  const homeStats = user
    ? {
        total: userOrders.length,
        pending: userOrders.filter((order) => order.status !== "delivered").length,
        delivered: userOrders.filter((order) => order.status === "delivered").length,
      }
    : null

  return (
    <div className="flex flex-col">
      <Hero stats={homeStats} />

      <div className="mx-auto w-full px-3 py-8 md:max-w-lg md:px-5 md:py-10">
        <div className="space-y-16">

          <section className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
                  Popular Carriers
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground/80">
                  Choose your network, then pick your perfect plan.
                </p>
              </div>
              <Button variant="ghost" className="shrink-0 gap-1 px-0 text-primary hover:text-primary/80" asChild>
                <Link href="/plans">
                  View all
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            {carriers.length === 0 ? (
              <div className="rounded-2xl border border-border bg-muted px-6 py-12 text-center">
                <div className="mx-auto max-w-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted-foreground/20">
                    <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-foreground font-heading">No carriers available</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Carriers will appear here once the catalog is available.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {featuredCarriers.map((carrier, index) => (
                  <CarrierShowcaseCard
                    key={carrier.id}
                    carrier={carrier}
                    index={index}
                    price={getStartingPrice(plans, carrier.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
                  Featured Plans
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground/80">
                  Hand-picked plans with the best value across carriers.
                </p>
              </div>
              <Button variant="ghost" className="shrink-0 gap-1 px-0 text-primary hover:text-primary/80" asChild>
                <Link href="/plans">
                  Browse all
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            {plans.length === 0 ? (
              <div className="rounded-2xl border border-border bg-muted px-6 py-12 text-center">
                <div className="mx-auto max-w-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted-foreground/20">
                    <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-foreground font-heading">No plans available</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Plans will appear here once published by the admin.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {pickFeaturedPlans(plans, 4).map((plan, index) => (
                  <PlanRow key={plan.id} plan={plan} index={index} />
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}

function CarrierShowcaseCard({
  carrier,
  index,
  price,
}: {
  carrier: CarrierRow
  index: number
  price: number | null
}) {
  return (
    <Link
      href={`/carriers/${carrier.slug}`}
      className="group block rounded-2xl border-0 bg-card p-4 text-center shadow-[var(--shadow-card)] ring-1 ring-border/50 transition-all duration-200 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5"
    >

      <div className="flex justify-center">
          {carrier.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={carrier.logo_url}
              alt={carrier.name}
              className="size-14 rounded-xl object-contain"
            />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-xl bg-gray-100">
              <span className="text-lg font-bold font-heading text-gray-600">
                {carrierInitials(carrier.name)}
              </span>
            </div>
          )}
        </div>
      <p className="mt-3.5 truncate text-sm font-semibold text-foreground font-heading">
        {shortCarrierName(carrier.name)}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground/75">
        {price == null ? "Starting soon" : `From $${price}`}
      </p>
    </Link>
  )
}

function PlanRow({
  plan,
  index,
}: {
  plan: PlanWithCarrier
  index: number
}) {
  return (
    <Link
      href={`/order?planId=${plan.id}`}
      className="group flex items-center justify-between gap-4 rounded-2xl border-0 bg-card p-4 shadow-[var(--shadow-card)] ring-1 ring-border/50 transition-all duration-150 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5"
    >

      <div className="flex min-w-0 items-center gap-4">
          {plan.carrier.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={plan.carrier.logo_url}
              alt={plan.carrier.name}
              className="size-12 rounded-xl object-contain shrink-0"
            />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-xl bg-gray-100 shrink-0">
              <span className="text-sm font-bold font-heading text-gray-600">
                {carrierInitials(plan.carrier.name)}
              </span>
            </div>
          )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground font-heading">
            {compactPlanTitle(plan)}
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{plan.data_label}</span>
            <span className="text-border">•</span>
            <span>{plan.validity_days} days</span>
            {plan.is_featured && (
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                Featured
              </span>
            )}
          </div>
          {plan.features && plan.features.length > 0 && (
            <div className="mt-1 text-xs text-muted-foreground">
              {plan.features.slice(0, 2).join(", ")}
              {plan.features.length > 2 && "+" + (plan.features.length - 2) + " more"}
            </div>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xl font-bold text-primary font-heading">
          {formatMoney(plan.price_cents, plan.currency)}
        </p>
        <p className="text-xs text-muted-foreground">
          {plan.validity_days === 30 ? "per month" : `per ${plan.validity_days} days`}
        </p>
      </div>
    </Link>
  )
}

function getStartingPrice(plans: PlanWithCarrier[], carrierId: string) {
  const first = plans.find((plan) => plan.carrier_id === carrierId)
  return first ? Math.round(first.price_cents / 100) : null
}

function carrierInitials(name: string) {
  return name
    .split(/[\s&-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function carrierAccent(index: number) {
  const accents = [
    "bg-pink-600",
    "bg-sky-500",
    "bg-red-600",
    "bg-orange-500",
    "bg-violet-500",
    "bg-emerald-600",
  ] as const

  return accents[index % accents.length]
}

function pickFeaturedPlans(plans: PlanWithCarrier[], limit: number) {
  // Prioritise explicitly featured plans, then fill with remaining
  const featured = plans.filter((p) => p.is_featured)
  const rest = plans.filter((p) => !p.is_featured)
  return [...featured, ...rest].slice(0, limit)
}

function pickFeaturedCarriers(carriers: CarrierRow[], limit: number) {
  if (carriers.length <= 1) return carriers.slice(0, limit)

  const shuffled = [...carriers].sort(() => Math.random() - 0.5)
  const seenNames = new Set<string>()
  const uniqueCarriers: CarrierRow[] = []

  for (const carrier of shuffled) {
    const displayName = shortCarrierName(carrier.name).toLowerCase()

    if (seenNames.has(displayName)) {
      continue
    }

    seenNames.add(displayName)
    uniqueCarriers.push(carrier)

    if (uniqueCarriers.length === limit) {
      break
    }
  }

  return uniqueCarriers
}

function shortCarrierName(name: string) {
  return name
    .replace(/\s*\(.+?\)/g, "")
    .replace(" PREPAID", "")
    .replace(" iMessage only 1yr plan", "")
    .replace("CARRIER UNLIMITED", "Unlimited")
    .trim()
}

function compactPlanTitle(plan: PlanWithCarrier) {
  return `${shortCarrierName(plan.carrier.name)} ${plan.name}`
}
