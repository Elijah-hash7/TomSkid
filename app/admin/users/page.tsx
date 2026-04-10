import { Mail, UserCircle2 } from "lucide-react"
import { getAdminUsers } from "@/app/actions/users"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/format"

export default async function AdminUsersPage() {
  const users = await getAdminUsers()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground/80">
          {users.length} registered {users.length === 1 ? "user" : "users"}
        </p>
      </div>

      {users.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
          No registered users yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {users.map((user) => (
            <Card
              key={user.id}
              className="overflow-hidden border-0 bg-card shadow-[var(--shadow-card)] ring-1 ring-border/50"
            >
              <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserCircle2 className="size-5 stroke-[1.6px]" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.full_name ?? "—"}
                  </p>
                  <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground/80">
                    <Mail className="size-3 shrink-0" />
                    {user.email}
                  </p>
                </div>
                <p className="shrink-0 text-[11px] text-muted-foreground/50">
                  {formatDate(user.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
