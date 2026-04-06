import { CustomerShell } from "@/components/layout/customer-shell"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CustomerShell>{children}</CustomerShell>
}
