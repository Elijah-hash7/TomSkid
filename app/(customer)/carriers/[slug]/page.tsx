import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { PlanCard } from "@/components/plan/plan-card"
import { Button } from "@/components/ui/button"
import { getCarrierBySlug, getPlans } from "@/lib/data/queries"

export default async function CarrierPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const carrier = await getCarrierBySlug(slug)
  if (!carrier) notFound()

  const plans = await getPlans(carrier.id)

  return (
    <div className="flex flex-col">
      <header className="rounded-b-[2rem] bg-primary px-5 pb-10 pt-8 text-primary-foreground">
        <div className="mx-auto max-w-lg space-y-4">
          <Button
            variant="ghost"
            className="gap-2 text-primary-foreground/90 hover:bg-white/10 hover:text-primary-foreground"
            asChild
          >
            <Link href="/plans">
              <ArrowLeft className="size-4" />
              All carriers
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            {carrier.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={carrier.logo_url}
                alt=""
                className="size-14 rounded-2xl bg-white object-contain p-2 ring-1 ring-white/30"
              />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 text-lg font-semibold">
                {carrier.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {carrier.name}
              </h1>
              {carrier.description ? (
                <p className="mt-1 text-sm text-primary-foreground/80">
                  {carrier.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg space-y-6 px-5 py-10">
        <h2 className="text-lg font-semibold">Plans</h2>
        {plans.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            No plans for this carrier yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {plans.map((p) => (
              <PlanCard key={p.id} plan={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
