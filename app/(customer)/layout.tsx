import { CustomerShell } from "@/components/layout/customer-shell"
import { ExpiryWarningProvider } from "@/components/order/expiry-warning-provider"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CustomerShell>
      {children}
      <ExpiryWarningProvider />
    </CustomerShell>
  )
}
