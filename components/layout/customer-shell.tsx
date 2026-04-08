import Link from "next/link"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ChatDrawer } from "@/components/layout/chat-drawer"

export function CustomerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,rgba(10,132,255,0.08),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#f3f7fc_100%)] lg:px-6 lg:py-6">

      {/* ChatDrawer lives here — outside the overflow-hidden container */}
      <ChatDrawer />

      <div className="relative mx-auto flex min-h-dvh w-full min-w-0 flex-col overflow-hidden bg-background lg:min-h-[calc(100dvh-3rem)] lg:max-w-[460px] lg:rounded-[2rem] lg:border lg:border-border/60 lg:shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
        <main className="flex flex-1 flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomNav />
      </div>

    </div>
  )
}
