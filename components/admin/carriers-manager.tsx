"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { deleteCarrier, upsertCarrier } from "@/app/actions/admin"
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
import { useToast } from "@/components/ui/toast-provider"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CarrierRow } from "@/lib/types/database"

export function CarriersManager({ carriers }: { carriers: CarrierRow[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CarrierRow | null>(null)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        const logo = String(fd.get("logo_url") ?? "").trim()
        await upsertCarrier(editing?.id ?? null, {
          name: String(fd.get("name") ?? ""),
          slug: String(fd.get("slug") ?? "").toLowerCase(),
          description: String(fd.get("description") ?? "") || undefined,
          logo_url: logo || undefined,
          sort_order: Number(fd.get("sort_order") ?? 0),
        })
        setOpen(false)
        setEditing(null)
        toast({
          tone: "success",
          title: editing ? "Carrier updated" : "Carrier created",
          description: "Carrier changes saved successfully.",
        })
        router.refresh()
      } catch (err) {
        toast({
          tone: "error",
          title: editing ? "Could not update carrier" : "Could not create carrier",
          description: err instanceof Error ? err.message : "Save failed",
        })
      }
    })
  }

  function onDelete(id: string) {
    if (!confirm("Delete this carrier? Plans may reference it.")) return
    startTransition(async () => {
      try {
        await deleteCarrier(id)
        toast({
          tone: "success",
          title: "Carrier deleted",
          description: "The carrier has been removed.",
        })
        router.refresh()
      } catch (err) {
        toast({
          tone: "error",
          title: "Could not delete carrier",
          description: err instanceof Error ? err.message : "Delete failed",
        })
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Carriers</h1>
          <p className="text-sm text-muted-foreground">
            Manage network brands shown to customers.
          </p>
        </div>
        <Button
          className="rounded-xl"
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          <Plus className="size-4" />
          Add carrier
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) setEditing(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form key={editing?.id ?? "new"} onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit carrier" : "New carrier"}
              </DialogTitle>
              <DialogDescription>
                {editing ? "Update the carrier details." : "Add a new eSIM carrier."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={editing?.name}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (url)</Label>
                <Input
                  id="slug"
                  name="slug"
                  required
                  pattern="[a-z0-9-]+"
                  defaultValue={editing?.slug}
                  placeholder="t-mobile"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={editing?.description ?? ""}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  name="logo_url"
                  type="url"
                  defaultValue={editing?.logo_url ?? ""}
                  placeholder="https://"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort order</Label>
                <Input
                  id="sort_order"
                  name="sort_order"
                  type="number"
                  defaultValue={editing?.sort_order ?? 0}
                  className="rounded-lg"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={pending} className="rounded-xl">
                {pending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {carriers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
          No carriers yet. Add one to get started.
        </p>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card shadow-sm ring-1 ring-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Sort</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carriers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {c.sort_order}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className="rounded-lg"
                        onClick={() => {
                          setEditing(c)
                          setOpen(true)
                        }}
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className="rounded-lg text-destructive"
                        onClick={() => onDelete(c.id)}
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
