"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import { Bell, CheckCircle2, Mail, UserRound } from "lucide-react"
import {
  updateProfileSettings,
  type UpdateProfileSettingsResult,
} from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  defaultName: string
  defaultOrderUpdates: boolean
  defaultSupportEmails: boolean
}

export function ProfileSettingsForm({
  defaultName,
  defaultOrderUpdates,
  defaultSupportEmails,
}: Props) {
  const [values, setValues] = useState({
    full_name: defaultName,
    order_updates: defaultOrderUpdates,
    support_emails: defaultSupportEmails,
  })
  const [state, formAction, pending] = useActionState<
    UpdateProfileSettingsResult | null,
    FormData
  >(async (_prev, formData) => updateProfileSettings(formData), null)

  useEffect(() => {
    setValues({
      full_name: defaultName,
      order_updates: defaultOrderUpdates,
      support_emails: defaultSupportEmails,
    })
  }, [defaultName, defaultOrderUpdates, defaultSupportEmails])

  const isDirty = useMemo(
    () =>
      values.full_name !== defaultName ||
      values.order_updates !== defaultOrderUpdates ||
      values.support_emails !== defaultSupportEmails,
    [defaultName, defaultOrderUpdates, defaultSupportEmails, values]
  )

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined

  return (
    <Card className="border-0 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_rgba(15,23,42,0.06)] ring-1 ring-border/70">
      <CardHeader>
        <CardTitle className="text-lg">Account settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Display name</Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="full_name"
                name="full_name"
                value={values.full_name}
                onChange={(e) =>
                  setValues((current) => ({ ...current, full_name: e.target.value }))
                }
                aria-invalid={fieldErrors?.full_name ? true : undefined}
                className="h-12 rounded-2xl border-border/80 bg-muted/20 pl-11"
              />
            </div>
            {fieldErrors?.full_name ? (
              <p className="text-sm text-destructive">{fieldErrors.full_name}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                This name appears on your account screen.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <ToggleRow
              name="order_updates"
              checked={values.order_updates}
              onCheckedChange={(checked) =>
                setValues((current) => ({ ...current, order_updates: checked }))
              }
              icon={<Bell className="size-4 text-primary" />}
              title="Order status updates"
              subtitle="Keep this enabled to receive progress-related account updates."
            />
            <ToggleRow
              name="support_emails"
              checked={values.support_emails}
              onCheckedChange={(checked) =>
                setValues((current) => ({ ...current, support_emails: checked }))
              }
              icon={<Mail className="size-4 text-emerald-600" />}
              title="Support follow-ups"
              subtitle="Allow the team to reach out after support conversations."
            />
          </div>

          {state?.ok && !isDirty ? (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="size-4" />
              Settings updated.
            </div>
          ) : null}

          {state && !state.ok && state.error ? (
            <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}

          {isDirty ? (
            <Button
              type="submit"
              disabled={pending}
              className="h-12 w-full rounded-2xl shadow-[0_16px_30px_rgba(10,132,255,0.22)]"
            >
              {pending ? "Saving..." : "Save settings"}
            </Button>
          ) : null}
        </form>
      </CardContent>
    </Card>
  )
}

function ToggleRow({
  name,
  checked,
  onCheckedChange,
  icon,
  title,
  subtitle,
}: {
  name: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <label className="flex items-start gap-4 rounded-2xl border border-border/80 bg-muted/20 p-4">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="mt-1 size-4 rounded border-border"
      />
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-tight">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </label>
  )
}
