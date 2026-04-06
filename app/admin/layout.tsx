import { AdminShell } from "@/components/layout/admin-shell"
import { getDashboardCounts } from "@/lib/data/queries"
import { isDemoModeEnabled } from "@/lib/demo-mode"
import { requireAdminRole } from "@/lib/supabase/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (isDemoModeEnabled()) {
    const { pending } = await getDashboardCounts()
    return <AdminShell pendingOrdersCount={pending}>{children}</AdminShell>
  }

  // This will redirect to /login or / if the user is not an admin
  await requireAdminRole("/")

  const { pending } = await getDashboardCounts()
  return <AdminShell pendingOrdersCount={pending}>{children}</AdminShell>
}
