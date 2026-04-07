import Link from "next/link"
import { MessageCircleMore } from "lucide-react"
import { BottomNav } from "@/components/layout/bottom-nav"

export function CustomerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,rgba(10,132,255,0.08),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#f3f7fc_100%)] md:px-6 md:py-6">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-background md:min-h-[calc(100dvh-3rem)] md:rounded-[2rem] md:border md:border-border/60 md:shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
        <Link
          href="https://wa.me/2349132560731"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact customer service on WhatsApp"
          className="absolute right-4 top-4 z-50 flex size-11 items-center justify-center rounded-full border border-emerald-200/80 bg-white/95 text-emerald-600 shadow-[0_12px_28px_rgba(16,185,129,0.18)] backdrop-blur transition-transform hover:scale-[1.03]"
        >
          <MessageCircleMore className="size-5" aria-hidden />
        </Link>
        <main className="flex flex-1 flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
