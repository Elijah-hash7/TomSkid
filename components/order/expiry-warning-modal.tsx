"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const SESSION_KEY = "esim_expiry_modal_dismissed"

export type ExpiringOrder = {
  orderId: string
  planId: string
  planName: string
  expiresAt: string
  isExpired: boolean
}

export function ExpiryWarningModal({ order }: { order: ExpiringOrder }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Only show once per browser session
    if (!sessionStorage.getItem(SESSION_KEY)) {
      setOpen(true)
    }
  }, [])

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, "1")
    setOpen(false)
  }

  const refillUrl = `/order?planId=${order.planId}&refillOrderId=${order.orderId}`
  const expiryDate = new Date(order.expiresAt).toLocaleDateString("en-US", { dateStyle: "medium" })

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss() }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-[2rem] border-0 bg-white p-0 shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
        <div className={[
          "flex flex-col items-center rounded-t-[2rem] px-6 py-6 text-center",
          order.isExpired ? "bg-red-50" : "bg-amber-50",
        ].join(" ")}>
          <span className={[
            "flex size-12 items-center justify-center rounded-full",
            order.isExpired ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600",
          ].join(" ")}>
            <AlertTriangle className="size-6" />
          </span>
          <DialogHeader className="mt-4 space-y-1">
            <DialogTitle className={order.isExpired ? "text-red-700" : "text-amber-700"}>
              {order.isExpired ? "Your plan has expired" : "Your plan expires soon"}
            </DialogTitle>
            <DialogDescription className="text-foreground/70">
              {order.isExpired
                ? `Your ${order.planName} plan expired on ${expiryDate}. Refill to stay connected.`
                : `Your ${order.planName} plan expires on ${expiryDate}. Refill now to avoid interruption.`}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex flex-col gap-3 px-6 pb-6 pt-4">
          <Button asChild className="h-11 rounded-2xl text-sm font-semibold shadow-[0_8px_20px_rgba(10,132,255,0.20)]">
            <a href={refillUrl}>Refill now</a>
          </Button>
          <Button
            variant="ghost"
            className="h-10 rounded-2xl text-sm text-muted-foreground"
            onClick={dismiss}
          >
            Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
