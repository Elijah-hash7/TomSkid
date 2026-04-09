"use client"

import type { ChangeEvent, FormEvent, ReactNode } from "react"
import { useMemo, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  BadgeCheck,
  Copy,
  FileText,
  Landmark,
  LoaderCircle,
} from "lucide-react"
import { submitOrder, type SubmitOrderResult } from "@/app/actions/orders"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast-provider"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  orderFormSchema,
  paymentReferenceSchema,
  type OrderFormValues,
} from "@/lib/validation/order"
import type { PlanWithCarrier } from "@/lib/types/database"

type FormFields = Omit<OrderFormValues, "plan_id">

const BANK_NAME = "PalmPay"
const ACCOUNT_NUMBER = "8081824760"
const ACCOUNT_NAME = "Tomiwa Oluwasegun"
const RECEIPT_ACCEPT = ".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"

function OrderFormInner({
  plan,
  defaultEmail,
}: {
  plan: PlanWithCarrier
  defaultEmail?: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, startTransition] = useTransition()
  const [formValues, setFormValues] = useState<FormFields>({
    full_name: "",
    state: "",
    phone_model: "",
    zip_code: "",
    imei: "",
    email: defaultEmail ?? "",
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormFields, string>>>({})
  const [submitState, setSubmitState] = useState<SubmitOrderResult | null>(null)
  const [paymentStepOpen, setPaymentStepOpen] = useState(false)
  const [paymentReference, setPaymentReference] = useState<string | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptError, setReceiptError] = useState<string | null>(null)
  const [copiedValue, setCopiedValue] = useState<"account" | "reference" | null>(null)

  const formattedAmount = useMemo(
    () => formatMoney(plan.price_cents, plan.currency),
    [plan.currency, plan.price_cents]
  )


  function updateField<K extends keyof FormFields>(field: K, value: FormFields[K]) {
    setFormValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => {
      if (!current[field]) return current
      return { ...current, [field]: undefined }
    })
  }

  function buildFieldErrors(result: SubmitOrderResult | null) {
    if (!result || result.ok || !result.fieldErrors) return {}
    return result.fieldErrors
  }

  function onInitialSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitState(null)

    const parsed = orderFormSchema.safeParse({
      plan_id: plan.id,
      ...formValues,
    })

    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof FormFields, string>> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (field && field !== "plan_id" && typeof field === "string") {
          const typedField = field as keyof FormFields
          if (!nextErrors[typedField]) {
            nextErrors[typedField] = issue.message
          }
        }
      }
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    setPaymentReference((current) => current ?? generateReferenceCode())
    setPaymentStepOpen(true)
  }

  function onReceiptChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setReceiptFile(null)
      setReceiptError(null)
      return
    }

    const allowedTypes = new Set(["image/jpeg", "image/png", "application/pdf"])
    if (!allowedTypes.has(file.type)) {
      setReceiptFile(null)
      setReceiptError("Receipt must be a JPG, PNG, or PDF file.")
      event.target.value = ""
      return
    }

    setReceiptFile(file)
    setReceiptError(null)
  }

  function onClosePaymentStep(nextOpen: boolean) {
    if (isSubmitting) return
    setPaymentStepOpen(nextOpen)
  }

  function onFinalSubmit() {
    const reference = paymentReference ?? generateReferenceCode()
    const referenceCheck = paymentReferenceSchema.safeParse(reference)

    if (!referenceCheck.success) {
      setSubmitState({ ok: false, error: "Could not generate a valid payment reference." })
      return
    }

    if (!receiptFile) {
      setReceiptError("Upload your payment receipt before submitting.")
      return
    }

    setReceiptError(null)
    setSubmitState(null)

    const formData = new FormData()
    formData.set("plan_id", plan.id)
    formData.set("full_name", formValues.full_name)
    formData.set("state", formValues.state)
    formData.set("phone_model", formValues.phone_model)
    formData.set("zip_code", formValues.zip_code)
    formData.set("imei", formValues.imei)
    formData.set("email", formValues.email)
    formData.set("payment_reference", referenceCheck.data)
    formData.set("payment_receipt", receiptFile)

    startTransition(async () => {
      const result = await submitOrder(formData)
      setSubmitState(result)
      const nextErrors = buildFieldErrors(result)
      setFieldErrors(nextErrors)

      if (!result.ok) {
        if (result.error) {
          toast({
            tone: "error",
            title: "Could not submit order",
            description: result.error,
          })
        }
        return
      }

      setPaymentStepOpen(false)
      setReceiptFile(null)
      toast({
        tone: "success",
        title: "Order submitted",
        description: "Your payment receipt and order details have been sent.",
      })
      router.push(`/orders/${result.orderId}`)
    })
  }

  async function copyValue(value: string, type: "account" | "reference") {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedValue(type)
      window.setTimeout(() => setCopiedValue((current) => (current === type ? null : current)), 1600)
    } catch {
      toast({
        tone: "error",
        title: "Copy failed",
        description: "Please copy it manually.",
      })
    }
  }

  const activeReference = paymentReference ?? ""

  return (
    <>
      <Card className="overflow-hidden border-0 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_64px_rgba(15,23,42,0.08)] ring-1 ring-border/70">
        <CardHeader className="space-y-4 border-b border-border/60 bg-[linear-gradient(180deg,rgba(10,132,255,0.08),rgba(255,255,255,0))] pb-6">
          <div className="inline-flex w-fit items-center rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Secure checkout
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Order details</CardTitle>
            <CardDescription className="max-w-md text-sm leading-6">
              Fill in your details below, then complete payment before your order is sent.
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
              <p className="font-semibold text-primary">{formattedAmount}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={onInitialSubmit} className="space-y-8">
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
                    aria-invalid={fieldErrors.full_name ? true : undefined}
                    className="h-12 rounded-2xl border-border/80 bg-muted/20 px-4"
                  />
                  {fieldErrors.full_name ? <FieldError>{fieldErrors.full_name}</FieldError> : null}
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
                    aria-invalid={fieldErrors.email ? true : undefined}
                    className="h-12 rounded-2xl border-border/80 bg-muted/20 px-4"
                  />
                  {fieldErrors.email ? <FieldError>{fieldErrors.email}</FieldError> : null}
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
                    aria-invalid={fieldErrors.phone_model ? true : undefined}
                    className="h-12 rounded-2xl border-border/80 bg-muted/20 px-4"
                  />
                  {fieldErrors.phone_model ? <FieldError>{fieldErrors.phone_model}</FieldError> : null}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold tracking-tight">Device details</h3>
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
                    aria-invalid={fieldErrors.state ? true : undefined}
                    className="h-12 rounded-2xl border-border/80 bg-muted/20 px-4"
                  />
                  {fieldErrors.state ? <FieldError>{fieldErrors.state}</FieldError> : null}
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
                    aria-invalid={fieldErrors.zip_code ? true : undefined}
                    className="h-12 rounded-2xl border-border/80 bg-muted/20 px-4"
                  />
                  {fieldErrors.zip_code ? <FieldError>{fieldErrors.zip_code}</FieldError> : null}
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
                    aria-invalid={fieldErrors.imei ? true : undefined}
                    className="h-12 rounded-2xl border-border/80 bg-muted/20 px-4 font-mono text-sm"
                  />
                  {fieldErrors.imei ? (
                    <FieldError>{fieldErrors.imei}</FieldError>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Find the IMEI in Settings or by dialing *#06#.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {submitState && !submitState.ok && submitState.error ? (
              <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {submitState.error}
              </p>
            ) : null}

            <Button
              type="submit"
              className="h-12 w-full rounded-2xl text-base shadow-[0_16px_30px_rgba(10,132,255,0.22)]"
            >
              Continue to payment
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Review your details before submitting. <Link href="/faq" className="text-primary underline-offset-4 hover:underline">Questions?</Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <Dialog open={paymentStepOpen} onOpenChange={onClosePaymentStep}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-[28px] border-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,255,0.98))] p-0 shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:max-w-2xl" showCloseButton={!isSubmitting}>
          <DialogHeader className="border-b border-border/60 bg-[linear-gradient(180deg,rgba(10,132,255,0.1),rgba(255,255,255,0))] px-6 py-6 sm:px-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              <BadgeCheck className="size-3.5" />
              Payment required
            </div>
            <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground">
              Complete payment to send your order
            </DialogTitle>
            <DialogDescription className="max-w-xl text-sm leading-6">
              No refresh, no redirect. Once you pay and upload the receipt here, we send the full order to the admin dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 px-6 py-6 sm:px-7">
            <div className="grid gap-4 md:grid-cols-2">
              <PaymentInfoCard
                label="Bank"
                value={BANK_NAME}
                icon={<Landmark className="size-4" />}
              />
              <CopyablePaymentCard
                label="Account number"
                value={ACCOUNT_NUMBER}
                copied={copiedValue === "account"}
                onCopy={() => copyValue(ACCOUNT_NUMBER, "account")}
              />
              <PaymentInfoCard label="Account name" value={ACCOUNT_NAME} icon={<BadgeCheck className="size-4" />} />
              <PaymentInfoCard label="Amount to pay" value={formattedAmount} icon={<FileText className="size-4" />} highlight />
            </div>

            <div className="rounded-[24px] border border-primary/15 bg-primary/[0.05] p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                    Transfer narration
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add this unique code as your transfer description/narration. Keep it exactly the same.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => copyValue(activeReference, "reference")}
                >
                  <Copy className="size-4" />
                  {copiedValue === "reference" ? "Copied" : "Copy code"}
                </Button>
              </div>
              <div className="mt-4 rounded-2xl border border-primary/20 bg-white px-4 py-4 shadow-sm">
                <p className="break-all font-mono text-lg font-semibold tracking-[0.16em] text-foreground sm:text-xl">
                  {activeReference}
                </p>
              </div>
              <div className="mt-4 flex gap-3 rounded-2xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <p>
                  You must include this code in the transfer narration, and the uploaded receipt should clearly show the payment details and this unique reference code.
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <Card className="border border-border/70 bg-white/90 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Upload receipt</CardTitle>
                  <CardDescription>
                    Accepts JPG, PNG, or PDF. Make sure the receipt clearly shows the amount and reference code.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <input
                    ref={fileInputRef}
                    id="payment_receipt"
                    name="payment_receipt"
                    type="file"
                    accept={RECEIPT_ACCEPT}
                    onChange={onReceiptChange}
                    className="sr-only"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-border bg-muted/25 px-5 py-8 text-center transition hover:border-primary/40 hover:bg-primary/[0.04]",
                      receiptFile && "border-primary/30 bg-primary/[0.05]"
                    )}
                  >
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <FileText className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {receiptFile ? receiptFile.name : "Tap to upload receipt"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, JPEG, or PDF
                      </p>
                    </div>
                  </button>
                  {receiptError ? <FieldError>{receiptError}</FieldError> : null}
                </CardContent>
              </Card>

              <Card className="border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,250,255,0.98))] shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Order summary</CardTitle>
                  <CardDescription>Double-check what you are about to send.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <SummaryRow label="Carrier" value={plan.carrier.name} />
                  <SummaryRow label="Plan" value={plan.name} />
                  <SummaryRow label="Amount" value={formattedAmount} />
                  <SummaryRow label="Email" value={formValues.email} />
                  <SummaryRow label="IMEI" value={formValues.imei} mono />
                </CardContent>
              </Card>
            </div>

            {submitState && !submitState.ok && submitState.error ? (
              <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {submitState.error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl"
                disabled={isSubmitting}
                onClick={() => setPaymentStepOpen(false)}
              >
                Back to form
              </Button>
              <Button
                type="button"
                className="h-11 rounded-2xl px-6 shadow-[0_16px_30px_rgba(10,132,255,0.22)]"
                disabled={isSubmitting}
                onClick={onFinalSubmit}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Submitting order...
                  </>
                ) : (
                  "I’ve Paid, Submit Order"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function OrderForm(props: {
  plan: PlanWithCarrier
  defaultEmail?: string
}) {
  return <OrderFormInner {...props} />
}

function PaymentInfoCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string
  value: string
  icon: ReactNode
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-border/70 bg-white px-4 py-4 shadow-sm",
        highlight && "border-primary/20 bg-primary/[0.05]"
      )}
    >
      <div className="mb-2 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function CopyablePaymentCard({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string
  value: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="rounded-[24px] border border-border/70 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-mono text-base font-semibold text-foreground">{value}</p>
        </div>
        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onCopy}>
          <Copy className="size-4" />
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 bg-muted/15 px-4 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("max-w-[65%] text-right font-medium text-foreground", mono && "font-mono text-xs sm:text-sm")}>
        {value}
      </span>
    </div>
  )
}

function FieldError({ children }: { children: ReactNode }) {
  return <p className="text-sm text-destructive">{children}</p>
}

function generateReferenceCode() {
  const now = new Date()
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("")
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "0")
  return `TSK-${datePart}-${randomPart}`
}
