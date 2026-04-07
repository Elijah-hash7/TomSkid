"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CircleHelp,
  Home,
  LayoutList,
  MessageCircle,
  UserRound,
} from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/plans", label: "Plans", icon: LayoutList },
  { href: "/faq", label: "FAQ", icon: CircleHelp },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const

export function DesktopSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-40 border-r border-border/50 bg-card">
      <div className="flex flex-1 flex-col gap-5 px-3 py-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 px-3 py-1 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#0060CC] text-white shadow-[0_4px_12px_rgba(10,132,255,0.30)] transition-shadow group-hover:shadow-[0_6px_16px_rgba(10,132,255,0.40)]">
            <span className="text-[0.9rem] font-black tracking-[-0.08em] font-heading">
              Te
            </span>
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight font-heading text-foreground leading-none">
              Tomskid
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
              eSIM Portal
            </p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-1">
          <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/50">
            Navigation
          </p>
          {items.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
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
                <Icon
                  className={cn("size-4 shrink-0", active ? "stroke-[2px]" : "stroke-[1.6px]")}
                  aria-hidden
                />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: support */}
        <div className="border-t border-border/50 pt-4 px-1 space-y-0.5">
          <a
            href="https://wa.me/2349132560731"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground/40 transition-all hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
          >
            <MessageCircle className="size-4 shrink-0 stroke-[1.6px]" aria-hidden />
            WhatsApp Support
          </a>
          <p className="px-3 pt-3 text-[11px] text-muted-foreground/35">
            TOMSKID eSIM · v1.0.0
          </p>
        </div>
      </div>
    </aside>
  )
}
