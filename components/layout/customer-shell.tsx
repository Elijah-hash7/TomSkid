import Link from "next/link"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ChatDrawer } from "@/components/layout/chat-drawer"

export function CustomerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,rgba(10,132,255,0.08),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#f3f7fc_100%)] md:px-6 md:py-6">
      <div className="relative mx-auto flex min-h-dvh w-full flex-col overflow-hidden bg-background md:min-h-[calc(100dvh-3rem)] md:max-w-[430px] md:rounded-[2rem] md:border md:border-border/60 md:shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
        <ChatDrawer />
        <main className="flex flex-1 flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
