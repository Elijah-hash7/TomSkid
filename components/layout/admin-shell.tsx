"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Smartphone,
  ShieldCheck,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { isDemoModeEnabled } from "@/lib/demo-mode"
import { Badge } from "@/components/ui/badge"

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/plans", label: "Plans", icon: Smartphone },
  { href: "/admin/users", label: "Users", icon: Users },
] as const

export function AdminShell({
  children,
  pendingOrdersCount,
}: {
  children: React.ReactNode
  pendingOrdersCount: number
}) {
  const pathname = usePathname()
  const demoMode = isDemoModeEnabled()

  return (
    <div className="min-h-dvh bg-muted/30 md:flex">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-40 border-r border-border/50 bg-card">
        <div className="flex flex-1 flex-col gap-5 px-3 py-6">
          {/* Branding */}
          <div className="flex items-center gap-3 px-3 py-1">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#0060CC] text-white shadow-[0_4px_12px_rgba(10,132,255,0.30)]">
              <ShieldCheck className="size-4 stroke-[2px]" />
            </div>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/70 leading-none">
                Tomskid
              </p>
              <p className="mt-0.5 text-sm font-bold text-foreground leading-none">
                Admin
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5 px-1">
            <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/50">
              Workspace
            </p>
            {nav.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/admin/dashboard"
                  ? pathname === href
                  : pathname === href || pathname.startsWith(`${href}/`)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-primary/[0.08] text-primary"
                      : "text-foreground/50 hover:text-foreground/80 hover:bg-accent/70"
                  )}
                >
                  <span className="relative flex shrink-0 items-center">
                    <Icon
                      className={cn("size-4", active ? "stroke-[2px]" : "stroke-[1.6px]")}
                      aria-hidden
                    />
                    {href === "/admin/orders" && pendingOrdersCount > 0 ? (
                      <Badge className="absolute -right-3 -top-2 h-4 min-w-4 rounded-full px-1 text-[0.6rem]">
                        {pendingOrdersCount > 99 ? "99+" : pendingOrdersCount}
                      </Badge>
                    ) : null}
                  </span>
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Bottom */}
          <div className="border-t border-border/50 pt-4 px-1 space-y-1">
            {demoMode ? (
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-800">
                Demo mode on — no changes saved.
              </div>
            ) : null}
            <p className="px-2 pt-2 text-[11px] text-muted-foreground/35">
              Manual fulfillment workspace
            </p>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col md:ml-64">
        {/* Mobile top header */}
        <div className="md:hidden mx-auto w-full max-w-5xl px-4 pt-6 pb-0">
          <header className="flex items-center justify-between gap-4 rounded-[1.75rem] border border-border/70 bg-card/80 px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm">
            <div className="min-w-0">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-primary/80">
                Tomskid Admin
              </p>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="size-4 text-primary" />
                <span className="truncate">Manual fulfillment workspace</span>
              </div>
            </div>
          </header>
        </div>

        {/* Desktop page header */}
        <div className="hidden md:block border-b border-border/40 bg-card/80 px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
            <ShieldCheck className="size-3.5 text-primary/70" />
            <span className="font-medium">Manual fulfillment workspace</span>
            {demoMode && (
              <span className="ml-3 rounded-full border border-amber-200/80 bg-amber-50/80 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                Demo mode
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 px-4 py-6 md:px-8 md:py-8 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-8">
          {!demoMode ? null : (
            <div className="md:hidden mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Demo mode is on. Admin pages use local sample data and no changes are saved.
            </div>
          )}
          <div className="mx-auto max-w-5xl space-y-6">
            {children}
          </div>
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-card/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden"
        aria-label="Admin"
      >
        <div className="mx-auto flex max-w-5xl items-stretch justify-around gap-2">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin/dashboard"
                ? pathname === href
                : pathname === href || pathname.startsWith(`${href}/`)

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-[0.72rem] font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(19,77,150,0.28)]"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <span className="relative flex items-center justify-center">
                  <Icon className={cn("size-5", active && "stroke-[2.25px]")} />
                  {href === "/admin/orders" && pendingOrdersCount > 0 ? (
                    <Badge className="absolute -right-3 -top-2 h-5 min-w-5 rounded-full px-1.5 text-[0.65rem]">
                      {pendingOrdersCount > 99 ? "99+" : pendingOrdersCount}
                    </Badge>
                  ) : null}
                </span>
                <span className="truncate">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
