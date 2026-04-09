"use client"

import type { FormEvent, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { Archive, Eye, Pencil, Plus, Sparkles, Trash2 } from "lucide-react"
import { deletePlan, upsertPlan } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/toast-provider"
import { formatMoney, normalizeCurrencyCode } from "@/lib/format"
import type { CarrierRow, PlanWithCarrier } from "@/lib/types/database"

type PlanFilter = "active" | "archived" | "all"

export function PlansManager({
  plans,
  carriers,
}: {
  plans: PlanWithCarrier[]
  carriers: CarrierRow[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()
  const [editorOpen, setEditorOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [editing, setEditing] = useState<PlanWithCarrier | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanWithCarrier | null>(null)
  const [filter, setFilter] = useState<PlanFilter>("active")
  const defaultCarrier = carriers[0]?.id ?? ""
  const activePlans = useMemo(
    () => plans.filter((plan) => plan.is_active !== false),
    [plans]
  )
  const archivedPlans = useMemo(
    () => plans.filter((plan) => plan.is_active === false),
    [plans]
  )
  const visiblePlans = useMemo(() => {
    if (filter === "active") return activePlans
    if (filter === "archived") return archivedPlans
    return plans
  }, [activePlans, archivedPlans, filter, plans])
  const featuredCount = useMemo(
    () => activePlans.filter((plan) => plan.is_featured).length,
    [activePlans]
  )

  function openCreateModal() {
    setPreviewOpen(false)
    setEditing(null)
    setEditorOpen(true)
  }

  function openEditModal(plan: PlanWithCarrier) {
    setPreviewOpen(false)
    setEditing(plan)
    setEditorOpen(true)
  }

  function openPreview(plan: PlanWithCarrier) {
    setSelectedPlan(plan)
    setPreviewOpen(true)
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const amount = Number(String(fd.get("price_amount") ?? "0"))
    const cents = Math.round(amount * 100)
    const currency = normalizeCurrencyCode(String(fd.get("currency") ?? "NGN"))

    startTransition(async () => {
      try {
        await upsertPlan(editing?.id ?? null, {
          carrier_id: String(fd.get("carrier_id") ?? ""),
          name: String(fd.get("name") ?? ""),
          data_label: String(fd.get("data_label") ?? ""),
          validity_days: Number(fd.get("validity_days") ?? 30),
          price_cents: cents,
          currency,
          features: String(fd.get("features") ?? ""),
          badge: String(fd.get("badge") ?? ""),
          is_featured: fd.get("is_featured") === "on",
        })
        setEditorOpen(false)
        setEditing(null)
        toast({
          tone: "success",
          title: editing ? "Plan updated" : "Plan created",
          description: editing
            ? "Your plan changes have been saved."
            : "The new plan is now available.",
        })
        router.refresh()
      } catch (err) {
        toast({
          tone: "error",
          title: editing ? "Could not update plan" : "Could not create plan",
          description: err instanceof Error ? err.message : "Save failed",
        })
      }
    })
  }

  function onDelete(id: string) {
    if (
      !confirm(
        "Delete this plan? Plans with existing orders will be archived instead of permanently deleted."
      )
    ) {
      return
    }
    startTransition(async () => {
      try {
        const result = await deletePlan(id)
        toast({
          tone: "success",
          title: "Plan deleted",
          description: result.message,
        })
        if (selectedPlan?.id === id) {
          setSelectedPlan(null)
          setPreviewOpen(false)
        }
        router.refresh()
      } catch (err) {
        toast({
          tone: "error",
          title: "Could not delete plan",
          description: err instanceof Error ? err.message : "Delete failed",
        })
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            <Sparkles className="size-3.5" />
            Plan studio
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Plans</h1>
            <p className="mt-2 text-sm text-gray-600">
              Keep the list compact here. Open any plan to inspect, edit, or delete.
            </p>
          </div>
        </div>
        <Button
          className="rounded-2xl bg-blue-600 px-6 py-2.5 font-medium text-white shadow-[0_16px_30px_rgba(10,132,255,0.24)] hover:bg-blue-700"
          disabled={!carriers.length}
          onClick={openCreateModal}
        >
          <Plus className="mr-2 size-4" />
          Add Plan
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Active plans" value={String(activePlans.length)} />
        <StatsCard label="Archived plans" value={String(archivedPlans.length)} />
        <StatsCard label="Featured" value={String(featuredCount)} />
      </div>

      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as PlanFilter)}
        className="gap-4"
      >
        <TabsList className="rounded-2xl bg-muted/60 p-1">
          <TabsTrigger value="active" className="rounded-xl px-4">
            Active
          </TabsTrigger>
          <TabsTrigger value="archived" className="rounded-xl px-4">
            Archived
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-xl px-4">
            All
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Dialog
        open={editorOpen}
        onOpenChange={(value) => {
          setEditorOpen(value)
          if (!value) setEditing(null)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-0 bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:max-w-2xl">
          <form key={editing?.id ?? "new"} onSubmit={onSubmit}>
            <DialogHeader className="border-b border-border/60 bg-[linear-gradient(180deg,rgba(10,132,255,0.08),rgba(255,255,255,0))] px-6 py-6">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {editing ? "Edit Plan" : "Create New Plan"}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {editing
                  ? "Update pricing, features, and validity without leaving this page."
                  : "Add a new eSIM plan with the same premium layout used throughout the dashboard."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 px-6 py-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="carrier_id">Carrier</Label>
                  <select
                    id="carrier_id"
                    name="carrier_id"
                    required
                    className="flex h-12 w-full rounded-2xl border border-gray-300 bg-muted/20 px-4 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                    defaultValue={editing?.carrier_id ?? defaultCarrier}
                  >
                    <option value="" disabled>
                      Select a carrier
                    </option>
                    {carriers.map((carrier) => (
                      <option key={carrier.id} value={carrier.id}>
                        {carrier.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field>
                  <Label htmlFor="name">Plan name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={editing?.name}
                    placeholder="e.g. 5GB Monthly"
                    className="h-12 rounded-2xl border-gray-300 bg-muted/20 px-4"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="data_label">Data allowance</Label>
                  <Input
                    id="data_label"
                    name="data_label"
                    required
                    defaultValue={editing?.data_label}
                    placeholder="e.g. 5 GB"
                    className="h-12 rounded-2xl border-gray-300 bg-muted/20 px-4"
                  />
                </Field>
                <Field>
                  <Label htmlFor="validity_days">Validity period (days)</Label>
                  <Input
                    id="validity_days"
                    name="validity_days"
                    type="number"
                    min={1}
                    required
                    defaultValue={editing?.validity_days ?? 30}
                    className="h-12 rounded-2xl border-gray-300 bg-muted/20 px-4"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="price_amount">Price (NGN)</Label>
                  <Input
                    id="price_amount"
                    name="price_amount"
                    type="number"
                    min={0}
                    step={0.01}
                    required
                    defaultValue={editing ? (editing.price_cents / 100).toFixed(2) : "19000"}
                    className="h-12 rounded-2xl border-gray-300 bg-muted/20 px-4"
                  />
                </Field>
                <Field>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    name="currency"
                    defaultValue={normalizeCurrencyCode(editing?.currency ?? "NGN")}
                    className="h-12 rounded-2xl border-gray-300 bg-muted/20 px-4"
                  />
                </Field>
              </div>

              <Field>
                <Label htmlFor="features">Features</Label>
                <Input
                  id="features"
                  name="features"
                  defaultValue={editing?.features?.join(", ") ?? ""}
                  placeholder="5G/LTE, hotspot, unlimited talk"
                  className="h-12 rounded-2xl border-gray-300 bg-muted/20 px-4"
                />
                <p className="text-xs text-gray-500">
                  Separate multiple features with commas.
                </p>
              </Field>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="badge">Badge</Label>
                  <Input
                    id="badge"
                    name="badge"
                    defaultValue={editing?.badge ?? ""}
                    placeholder="Popular"
                    className="h-12 rounded-2xl border-gray-300 bg-muted/20 px-4"
                  />
                </Field>
                <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-muted/20 px-4 py-4">
                  <input
                    type="checkbox"
                    id="is_featured"
                    name="is_featured"
                    defaultChecked={editing?.is_featured ?? false}
                    className="size-4 rounded border-gray-300 text-blue-600"
                  />
                  <div>
                    <span className="block text-sm font-medium text-gray-900">
                      Featured plan
                    </span>
                    <span className="block text-xs text-gray-500">
                      Highlight this plan across the storefront.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <DialogFooter className="border-t border-border/60 bg-muted/35 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditorOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={pending}
                className="rounded-xl bg-blue-600 px-6 text-white shadow-[0_14px_28px_rgba(10,132,255,0.24)] hover:bg-blue-700"
              >
                {pending ? "Saving..." : editing ? "Update Plan" : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={previewOpen}
        onOpenChange={(value) => {
          setPreviewOpen(value)
          if (!value) setSelectedPlan(null)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-0 bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:max-w-xl">
          {selectedPlan ? (
            <>
              <DialogHeader className="border-b border-border/60 bg-[linear-gradient(180deg,rgba(10,132,255,0.08),rgba(255,255,255,0))] px-6 py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <DialogTitle className="text-xl text-gray-900">
                      {selectedPlan.name}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                      {selectedPlan.carrier.name} · {selectedPlan.data_label} ·{" "}
                      {selectedPlan.validity_days} days
                    </DialogDescription>
                  </div>
                  <div className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                    {formatMoney(selectedPlan.price_cents, selectedPlan.currency)}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 px-6 py-6">
                <PreviewRow label="Carrier" value={selectedPlan.carrier.name} />
                <PreviewRow label="Data allowance" value={selectedPlan.data_label} />
                <PreviewRow
                  label="Validity"
                  value={`${selectedPlan.validity_days} days`}
                />
                <PreviewRow
                  label="Badge"
                  value={selectedPlan.badge?.trim() || "No badge"}
                />
                <PreviewRow
                  label="Featured"
                  value={selectedPlan.is_featured ? "Yes" : "No"}
                />
                <PreviewRow
                  label="Status"
                  value={selectedPlan.is_active === false ? "Archived" : "Active"}
                />
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Features
                  </p>
                  {selectedPlan.features && selectedPlan.features.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedPlan.features.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full border border-border bg-muted/30 px-3 py-1 text-sm text-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No extra features listed.</p>
                  )}
                </div>
              </div>

              <DialogFooter className="border-t border-border/60 bg-muted/35 px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => openEditModal(selectedPlan)}
                >
                  <Pencil className="mr-2 size-4" />
                  Edit Plan
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="rounded-xl"
                  disabled={pending}
                  onClick={() => onDelete(selectedPlan.id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete Plan
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {visiblePlans.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto max-w-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              {filter === "archived" ? (
                <Archive className="h-6 w-6 text-blue-600" />
              ) : (
                <Plus className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {filter === "archived" ? "No archived plans" : "No plans yet"}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {filter === "archived"
                ? "Archived plans are hidden from the default list and will appear here when a plan with orders is removed."
                : "Create your first plan and it will appear here as a clean card instead of a wide table."}
            </p>
            <div className="mt-6">
              <Button
                onClick={openCreateModal}
                className="rounded-xl bg-blue-600 px-6 py-2 text-white"
                disabled={!carriers.length}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Plan
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {visiblePlans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className="w-full rounded-3xl border border-border/70 bg-white p-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(15,23,42,0.10)]"
              onClick={() => openPreview(plan)}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    {plan.badge ? (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {plan.badge}
                      </span>
                    ) : null}
                    {plan.is_featured ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        Featured
                      </span>
                    ) : null}
                    {plan.is_active === false ? (
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                        Archived
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-gray-600">
                    {plan.carrier.name} · {plan.data_label} · {plan.validity_days} days
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Price
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatMoney(plan.price_cents, plan.currency)}
                    </p>
                  </div>
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-muted/35 text-gray-600">
                    <Eye className="size-4" />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(plan.features ?? []).slice(0, 3).map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-border bg-muted/20 px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {feature}
                  </span>
                ))}
                {(plan.features?.length ?? 0) > 3 ? (
                  <span className="rounded-full border border-border bg-muted/20 px-3 py-1 text-xs font-medium text-gray-700">
                    +{(plan.features?.length ?? 0) - 3} more
                  </span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

function StatsCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
