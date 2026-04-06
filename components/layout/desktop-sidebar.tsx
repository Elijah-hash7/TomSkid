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
    <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-40 border-r border-border/60 bg-card/98 backdrop-blur-xl">
      <div className="flex flex-1 flex-col gap-6 px-4 py-7">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 px-2 group">
          <div className="flex h-10 w-12 items-center justify-center rounded-[1.1rem] bg-gradient-to-br from-[#0A84FF] to-[#0060CC] text-white shadow-[0_8px_20px_rgba(10,132,255,0.35)] transition-shadow group-hover:shadow-[0_10px_28px_rgba(10,132,255,0.45)]">
            <span className="text-[1rem] font-black tracking-[-0.08em] font-heading">
              Te
            </span>
          </div>
          <div>
            <p className="text-sm font-black tracking-tight font-heading uppercase text-foreground leading-none">
              Tomskid
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground tracking-wide">
              eSIM Portal
            </p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
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
                  "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(10,132,255,0.25)]"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn("size-4", active && "stroke-[2.2px]")}
                  aria-hidden
                />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: support */}
        <div className="border-t border-border/60 pt-4 space-y-0.5">
          <a
            href="https://wa.me/2349132560731"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
          >
            <MessageCircle className="size-4" aria-hidden />
            WhatsApp Support
          </a>
          <p className="px-4 pt-3 text-[11px] text-muted-foreground/40">
            TOMSKID eSIM · v1.0.0
          </p>
        </div>
      </div>
    </aside>
  )
}
