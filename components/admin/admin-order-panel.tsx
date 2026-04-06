"use client"

import type { ComponentType, FormEvent } from "react"
import { useState, useTransition } from "react"
import { Check, Copy, Mail, MapPin, Smartphone, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { uploadDeliveryProof } from "@/app/actions/admin"
import { OrderStatusBadge } from "@/components/order/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast-provider"
import type { OrderWithPlan } from "@/lib/types/database"

type DetailItem = {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
}

export function AdminOrderPanel({
  order,
  imeiImageUrl,
  proofUrl,
}: {
  order: OrderWithPlan
  imeiImageUrl: string | null
  proofUrl: string | null
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()

  function onProofSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await uploadDeliveryProof(order.id, fd)
        e.currentTarget.reset()
        toast({
          tone: "success",
          title: "Proof uploaded",
          description: "The order has been updated to delivered.",
        })
        router.refresh()
      } catch (err) {
        toast({
          tone: "error",
          title: "Could not upload proof",
          description: err instanceof Error ? err.message : "Upload failed",
        })
      }
    })
  }

  const detailItems: DetailItem[] = [
    { label: "Name", value: order.full_name, icon: User },
    { label: "State needed", value: order.state, icon: MapPin },
    { label: "Phone model", value: order.phone_model, icon: Smartphone },
    { label: "ZIP code", value: order.zip_code, icon: MapPin },
    { label: "IMEI", value: order.imei, icon: Smartphone },
    { label: "Email", value: order.email, icon: Mail },
  ]

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)] ring-1 ring-border/70">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Order details
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <OrderStatusBadge status={order.status} />
                <span className="text-sm text-muted-foreground">
                  Upload proof to complete this order.
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {detailItems.map((item) => (
              <CopyableDetailCard key={item.label} {...item} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-white shadow-sm ring-1 ring-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Delivery proof</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {proofUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={proofUrl}
              alt="Delivery proof"
              className="max-h-64 w-full rounded-2xl border border-border/70 bg-muted/20 object-contain"
            />
          ) : (
            <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/25 px-4 text-center text-sm text-muted-foreground">
              Upload a proof screenshot. The order will automatically move to delivered.
            </div>
          )}
          <form onSubmit={onProofSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="proof">Upload screenshot</Label>
              <input
                id="proof"
                name="proof"
                type="file"
                accept="image/*"
                required
                className="block w-full rounded-2xl border border-border/80 bg-muted/20 px-3 py-3 text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:font-medium file:text-primary-foreground"
              />
            </div>
            <Button
              type="submit"
              className="h-11 w-full rounded-2xl shadow-[0_12px_24px_rgba(10,132,255,0.2)]"
              disabled={pending}
            >
              {pending ? "Uploading…" : "Upload proof"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {imeiImageUrl ? (
        <Card className="border-0 bg-white shadow-sm ring-1 ring-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Legacy IMEI screenshot</CardTitle>
          </CardHeader>
          <CardContent>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imeiImageUrl}
              alt="Customer IMEI"
              className="max-h-80 w-full rounded-2xl border border-border/70 bg-muted/20 object-contain"
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function CopyableDetailCard({ label, value, icon: Icon }: DetailItem) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
      toast({
        tone: "error",
        title: "Copy failed",
        description: "Please try again.",
      })
    }
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,250,251,0.98))] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </p>
            <p className="break-all text-sm font-medium text-foreground">{value}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 rounded-full"
          onClick={onCopy}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
    </div>
  )
}
