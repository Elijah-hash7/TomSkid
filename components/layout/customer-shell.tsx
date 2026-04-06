import { BottomNav } from "@/components/layout/bottom-nav"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"

export function CustomerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <DesktopSidebar />
      <main className="flex flex-1 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0 md:ml-64">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
