"use client"

import type { ChangeEvent, FormEvent, ReactNode } from "react"
import { useMemo, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  Check,
  Copy,
  FileText,
  Upload,
  LoaderCircle,
  X,
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
  const [showSuccessState, setShowSuccessState] = useState(false)

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

  function removeReceipt() {
    setReceiptFile(null)
    setReceiptError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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

      setShowSuccessState(true)
      setReceiptFile(null)
      toast({
        tone: "success",
        title: "Order submitted",
        description: "Your payment receipt and order details have been sent.",
      })
      window.setTimeout(() => {
        setPaymentStepOpen(false)
        setShowSuccessState(false)
        router.push(`/orders/${result.orderId}`)
      }, 1500)
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
        <DialogContent className="max-h-[92vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-[2rem] border-0 bg-[#fcfdff] p-0 shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:max-w-lg" showCloseButton={!isSubmitting}>
          <DialogHeader className="bg-[linear-gradient(180deg,#2f89ff_0%,#0a84ff_100%)] px-4 py-5 text-white sm:px-6">
            <div className="flex items-start justify-between gap-2 pr-8 sm:pr-0">
              <div className="space-y-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                  Payment method
                </p>
                <DialogTitle className="text-2xl font-bold tracking-tight text-white sm:text-[1.75rem]">
                  Bank Transfer
                </DialogTitle>
              </div>
              <div className="shrink-0 rounded-full bg-white/14 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] sm:px-4 sm:py-2 sm:text-sm sm:tracking-[0.18em]">
                {BANK_NAME}
              </div>
            </div>
            <DialogDescription className="pt-3 text-sm leading-6 text-white/78">
              Pay the exact amount below, use your unique code as narration, then upload your receipt here to send the order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-6">
            {showSuccessState ? (
              <div className="space-y-5 py-2">
                <div className="flex flex-col items-center rounded-[1.8rem] border border-[#d9e8ff] bg-[linear-gradient(180deg,#ffffff_0%,#f5f9ff_100%)] px-6 py-10 text-center shadow-[0_18px_40px_rgba(10,132,255,0.08)]">
                  <div className="flex size-16 items-center justify-center rounded-full bg-[#e8f3ff] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    <Check className="size-8" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
                    Payment proof submitted
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    We’ve received your receipt and order details. You’ll be redirected to your order shortly.
                  </p>

                  <div className="mt-6 w-full rounded-[1.35rem] border border-[#d9e8ff] bg-[#edf5ff] p-4 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Transfer reference
                    </p>
                    <p className="mt-2 break-all font-mono text-base font-bold tracking-[0.18em] text-primary">
                      {activeReference}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
            <div className="rounded-[1.6rem] border border-[#d9e8ff] bg-[#edf5ff] p-4 shadow-[0_8px_24px_rgba(10,132,255,0.08)]">
              <div className="flex items-start justify-between gap-3 border-b border-[#d4e3fb] pb-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Account no.
                  </p>
                  <p className="mt-1 break-all font-mono text-[1.5rem] font-bold tracking-[0.08em] text-primary sm:text-[2rem] sm:tracking-[0.18em]">
                    {ACCOUNT_NUMBER}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-xl border-[#c8defe] bg-white text-primary shadow-sm"
                  onClick={() => copyValue(ACCOUNT_NUMBER, "account")}
                >
                  <Copy className="size-4" />
                  {copiedValue === "account" ? "Copied" : "Copy"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Account name
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {ACCOUNT_NAME}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Bank
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {BANK_NAME}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-[#d9e8ff] bg-white px-4 py-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Amount to pay
                </p>
                <p className="mt-2 text-xl font-bold tracking-tight text-primary">
                  {formattedAmount}
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-[#d9e8ff] bg-white px-4 py-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Order plan
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {plan.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {plan.carrier.name}
                </p>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-[#cfe0ff] bg-[#f3f8ff] p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                    Transfer narration
                  </p>
                  <p className="text-sm text-slate-500">
                    Use this exact unique code as your transfer description.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-xl border-[#c8defe] bg-white text-primary shadow-sm"
                  onClick={() => copyValue(activeReference, "reference")}
                >
                  <Copy className="size-4" />
                  {copiedValue === "reference" ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="mt-4 rounded-[1.25rem] border border-[#d8e7ff] bg-white px-4 py-4 shadow-sm">
                <p className="break-all font-mono text-sm font-bold tracking-[0.1em] text-slate-900 sm:text-base sm:tracking-[0.22em]">
                  {activeReference}
                </p>
              </div>
              <div className="mt-4 flex gap-3 rounded-[1.2rem] border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <p>
                  You must include this code in the transfer narration, and the uploaded receipt should clearly show the payment details and this unique reference code.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Proof of payment
                </p>
                <div className="rounded-[1.5rem] border border-border/60 bg-white p-4 shadow-sm">
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
                      "flex min-h-32 w-full flex-col items-center justify-center gap-3 rounded-[1.35rem] border-2 border-dashed px-5 py-6 text-center transition sm:min-h-44 sm:py-8",
                      receiptFile
                        ? "border-[#b9d4ff] bg-[#f4f8ff]"
                        : "border-[#d8e7ff] bg-[#fbfdff] hover:border-primary/40 hover:bg-primary/[0.04]"
                    )}
                  >
                    <div className="flex size-12 items-center justify-center rounded-full bg-[#e8f3ff] text-primary">
                      <Upload className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-slate-800">
                        {receiptFile ? "Receipt selected" : "Click to upload or drag & drop"}
                      </p>
                      <p className="text-xs text-slate-400">
                        PNG, JPG, PDF · max 10MB
                      </p>
                    </div>
                  </button>
                  {receiptFile ? (
                    <div className="mt-3 flex items-center gap-3 rounded-[1rem] border border-border/60 bg-slate-50 px-4 py-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f3ff] text-primary">
                        <FileText className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {receiptFile.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatFileSize(receiptFile.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeReceipt}
                        className="text-slate-300 transition-colors hover:text-red-400"
                        aria-label="Remove receipt"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : null}
                  {receiptError ? <FieldError>{receiptError}</FieldError> : null}
                </div>
              </div>

              <Card className="border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(247,250,255,0.96))] shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Order summary</CardTitle>
                  <CardDescription>
                    The admin gets these details together with your receipt.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <SummaryRow label="Carrier" value={plan.carrier.name} />
                  <SummaryRow label="Plan" value={plan.name} />
                  <SummaryRow label="Amount" value={formattedAmount} />
                  <SummaryRow label="Reference" value={activeReference} mono />
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

            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl border-[#d7e6ff] bg-white"
                disabled={isSubmitting}
                onClick={() => setPaymentStepOpen(false)}
              >
                Back to form
              </Button>
              <Button
                type="button"
                className="h-12 rounded-2xl px-6 text-sm font-bold shadow-[0_16px_30px_rgba(10,132,255,0.22)]"
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
              </>
            )}
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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
