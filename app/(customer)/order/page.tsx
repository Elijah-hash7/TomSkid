import Link from "next/link"
import { redirect } from "next/navigation"
import { OrderForm } from "@/components/order/order-form"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { getPlanById } from "@/lib/data/queries"
import { getServerUser } from "@/lib/supabase/auth"

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string }>
}) {
  const { planId } = await searchParams
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

  const supabase = await createClient()

  return (
    <div className="flex flex-col">
      <header className="border-b border-border/60 bg-muted/20 px-5 md:px-10 lg:px-14 py-6">
        <div className="mx-auto max-w-lg md:max-w-none">
          <Button variant="ghost" className="mb-2 -ml-2 text-muted-foreground" asChild>
            <Link href="/plans">← Back to plans</Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Complete your order</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We use this information to activate your eSIM manually.
          </p>
        </div>
      </header>
      <div className="mx-auto w-full max-w-lg md:max-w-2xl flex-1 px-5 md:px-10 lg:px-14 py-8">
        <OrderForm plan={plan} defaultEmail={user.email ?? undefined} />
      </div>
    </div>
  )
}
