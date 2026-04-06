"use client"

import { useActionState, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { submitOrder, type SubmitOrderResult } from "@/app/actions/orders"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatMoney } from "@/lib/format"
import type { OrderFormValues } from "@/lib/validation/order"
import type { PlanWithCarrier } from "@/lib/types/database"

type FormFields = Omit<OrderFormValues, "plan_id">

function OrderFormInner({
  plan,
  defaultEmail,
}: {
  plan: PlanWithCarrier
  defaultEmail?: string
}) {
  const router = useRouter()
  const [formValues, setFormValues] = useState<FormFields>({
    full_name: "",
    state: "",
    phone_model: "",
    zip_code: "",
    imei: "",
    email: defaultEmail ?? "",
  })
  const [state, formAction, pending] = useActionState<
    SubmitOrderResult | null,
    FormData
  >(async (_prev, formData) => {
    const result = await submitOrder(formData)
    return result
  }, null)

  useEffect(() => {
    if (state?.ok) {
      router.push(`/orders/${state.orderId}`)
    }
  }, [state, router])

  useEffect(() => {
    setFormValues((current) => {
      if (current.email || !defaultEmail) return current
      return { ...current, email: defaultEmail }
    })
  }, [defaultEmail])

  function updateField<K extends keyof FormFields>(field: K, value: FormFields[K]) {
    setFormValues((current) => ({ ...current, [field]: value }))
  }

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined

  return (
    <Card className="overflow-hidden border-0 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_64px_rgba(15,23,42,0.08)] ring-1 ring-border/70">
      <CardHeader className="space-y-4 border-b border-border/60 bg-[linear-gradient(180deg,rgba(10,132,255,0.08),rgba(255,255,255,0))] pb-6">
        <div className="inline-flex w-fit items-center rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          Secure checkout
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl">Order details</CardTitle>
          <CardDescription className="max-w-md text-sm leading-6">
            Fill in your details below to place your order.
          </CardDescription>
        </div>
        <div className="grid gap-3 rounded-2xl border border-border/70 bg-white/90 p-4 shadow-sm sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Carrier
            </p>
            <p className="font-medium text-foreground">{plan.carrier.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Plan
            </p>
            <p className="font-medium text-foreground">{plan.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Price
            </p>
            <p className="font-semibold text-primary">
              {formatMoney(plan.price_cents, plan.currency)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <form action={formAction} className="space-y-8">
          <input type="hidden" name="plan_id" value={plan.id} />

          <section className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight">Your info</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  autoComplete="name"
                  required
                  value={formValues.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  placeholder="Jane Doe"
                  aria-invalid={fieldErrors?.full_name ? true : undefined}
                  className="h-12 rounded-2xl border-border/80 bg-muted/20 px-4"
                />
                {fieldErrors?.full_name ? (
                  <FieldError>{fieldErrors.full_name}</FieldError>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formValues.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  autoComplete="email"
                  placeholder="you@email.com"
                  aria-invalid={fieldErrors?.email ? true : undefined}
                  className="h-12 rounded-2xl border-border/80 bg-muted/20 px-4"
                />
                {fieldErrors?.email ? (
                  <FieldError>{fieldErrors.email}</FieldError>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_model">Phone model</Label>
                <Input
                  id="phone_model"
                  name="phone_model"
                  required
                  value={formValues.phone_model}
                  onChange={(e) => updateField("phone_model", e.target.value)}
                  placeholder="e.g. iPhone 15 Pro"
                  aria-invalid={fieldErrors?.phone_model ? true : undefined}
                  className="h-12 rounded-2xl border-border/80 bg-muted/20 px-4"
                />
                {fieldErrors?.phone_model ? (
                  <FieldError>{fieldErrors.phone_model}</FieldError>
                ) : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight">
                Device details
              </h3>
              <p className="text-sm text-muted-foreground">
                Make sure everything matches the phone you want to use.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="state">State needed</Label>
                <Input
                  id="state"
                  name="state"
                  required
                  value={formValues.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  placeholder="CA"
                  aria-invalid={fieldErrors?.state ? true : undefined}
                  className="h-12 rounded-2xl border-border/80 bg-muted/20 px-4"
                />
                {fieldErrors?.state ? (
                  <FieldError>{fieldErrors.state}</FieldError>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">ZIP code</Label>
                <Input
                  id="zip_code"
                  name="zip_code"
                  required
                  value={formValues.zip_code}
                  onChange={(e) => updateField("zip_code", e.target.value)}
                  placeholder="94102"
                  aria-invalid={fieldErrors?.zip_code ? true : undefined}
                  className="h-12 rounded-2xl border-border/80 bg-muted/20 px-4"
                />
                {fieldErrors?.zip_code ? (
                  <FieldError>{fieldErrors.zip_code}</FieldError>
                ) : null}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="imei">IMEI</Label>
                <Input
                  id="imei"
                  name="imei"
                  required
                  inputMode="numeric"
                  value={formValues.imei}
                  onChange={(e) => updateField("imei", e.target.value)}
                  placeholder="Dial *#06# on your phone"
                  aria-invalid={fieldErrors?.imei ? true : undefined}
                  className="h-12 rounded-2xl border-border/80 bg-muted/20 px-4 font-mono text-sm"
                />
                {fieldErrors?.imei ? (
                  <FieldError>{fieldErrors.imei}</FieldError>
                ) : (
                <p className="text-xs text-muted-foreground">
                  Find the IMEI in Settings or by dialing *#06#.
                </p>
                )}
              </div>
            </div>
          </section>

          {state && !state.ok && state.error ? (
            <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="h-12 w-full rounded-2xl text-base shadow-[0_16px_30px_rgba(10,132,255,0.22)]"
            disabled={pending}
          >
            {pending ? "Submitting…" : "Submit order"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Review your details before submitting.{" "}
            <Link
              href="/faq"
              className="text-primary underline-offset-4 hover:underline"
            >
              Questions?
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

export function OrderForm(props: {
  plan: PlanWithCarrier
  defaultEmail?: string
}) {
  return <OrderFormInner {...props} />
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-destructive">{children}</p>
}
