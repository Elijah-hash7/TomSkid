import { requireAdminRole } from "@/lib/supabase/auth"
import { createClient } from "@/lib/supabase/server"

export default async function AdminDebugPage() {
  const { user, profile } = await requireAdminRole("/login")
  const supabase = await createClient()

  // Check auth.users existence (indirectly via profiles)
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: false })
    .limit(20)

  // Current session user
  const { data: { user: sessionUser } } = await supabase.auth.getUser()

  return (
    <div className="space-y-8 p-8 font-mono text-sm">
      <h1 className="text-2xl font-bold font-sans">Auth Debug</h1>

      <section className="rounded-lg border bg-muted/30 p-4 space-y-2">
        <h2 className="font-semibold font-sans text-base">Current Session</h2>
        <Row label="User ID" value={sessionUser?.id ?? "—"} />
        <Row label="Email" value={sessionUser?.email ?? "—"} />
        <Row label="Email confirmed" value={sessionUser?.email_confirmed_at ? "Yes ✓" : "No — confirmation pending"} />
        <Row label="Profile role" value={profile?.role ?? "—"} />
        <Row label="Is admin" value={profile?.role === "admin" ? "Yes ✓" : "No"} />
      </section>

      <section className="rounded-lg border bg-muted/30 p-4 space-y-2">
        <h2 className="font-semibold font-sans text-base">All Profiles ({allProfiles?.length ?? 0})</h2>
        {allProfiles && allProfiles.length > 0 ? (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="py-1 text-left pr-4">Email</th>
                <th className="py-1 text-left pr-4">Role</th>
                <th className="py-1 text-left">ID</th>
              </tr>
            </thead>
            <tbody>
              {allProfiles.map((p) => (
                <tr key={p.id} className="border-b border-border/30">
                  <td className="py-1 pr-4">{p.email}</td>
                  <td className="py-1 pr-4">
                    <span className={p.role === "admin" ? "text-green-600 font-semibold" : ""}>
                      {p.role}
                    </span>
                  </td>
                  <td className="py-1 text-muted-foreground">{p.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-muted-foreground">No profiles found.</p>
        )}
      </section>

      <section className="rounded-lg border bg-yellow-50 border-yellow-200 p-4 text-xs space-y-1 text-yellow-900">
        <p className="font-semibold">To create the admin account:</p>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Sign up at <code>/signup</code> with <code>admin@gmail.com</code> / <code>admin123</code></li>
          <li>Run <code>supabase/admin-setup.sql</code> in Supabase Dashboard → SQL Editor</li>
          <li>Sign out and back in — you will land on this dashboard as admin</li>
        </ol>
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="w-40 shrink-0 text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}
