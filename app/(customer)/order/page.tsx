import Link from "next/link"
import { redirect } from "next/navigation"
import { OrderForm } from "@/components/order/order-form"
import { Button } from "@/components/ui/button"
import { getPlanById, getOrderForUser } from "@/lib/data/queries"
import { getServerUser } from "@/lib/supabase/auth"

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string; refillOrderId?: string }>
}) {
  const { planId, refillOrderId } = await searchParams
  if (!planId) {
    redirect("/plans")
  }

  const plan = await getPlanById(planId)
  if (!plan) {
    redirect("/plans")
  }

  const { user } = await getServerUser()
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/order?planId=${planId}`)}`)
  }

  // Load previous order for refill pre-fill
  let refillDefaults: {
    full_name: string
    email: string
    phone_model: string
    state: string
    zip_code: string
    imei: string
  } | undefined

  if (refillOrderId) {
    const prev = await getOrderForUser(refillOrderId, user.id)
    if (prev) {
      refillDefaults = {
        full_name: prev.full_name,
        email: prev.email,
        phone_model: prev.phone_model,
        state: prev.state,
        zip_code: prev.zip_code,
        imei: prev.imei,
      }
    }
  }

  const isRefill = !!refillDefaults

  return (
    <div className="flex flex-col">
      <header className="border-b border-border/60 bg-muted/20 px-5 py-6">
        <div className="mx-auto max-w-lg">
          <Button variant="ghost" className="mb-2 -ml-2 text-muted-foreground" asChild>
            <Link href="/plans">← Back to plans</Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isRefill ? "Refill your plan" : "Complete your order"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRefill
              ? "Your previous details are pre-filled. Update anything that has changed."
              : "We use this information to activate your eSIM manually."}
          </p>
        </div>
      </header>
      <div className="mx-auto w-full max-w-lg flex-1 px-5 py-8">
        <OrderForm
          plan={plan}
          defaultEmail={user.email ?? undefined}
          defaultValues={refillDefaults}
          isRefill={isRefill}
        />
      </div>
    </div>
  )
}
