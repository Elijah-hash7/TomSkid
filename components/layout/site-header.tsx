"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CircleHelp, Home, LayoutList, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/plans", label: "Plans", icon: LayoutList },
  { href: "/faq", label: "FAQ", icon: CircleHelp },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const

export function SiteHeader() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 hidden border-b border-border/60 bg-background/85 backdrop-blur-md md:block">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-8 px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          TOMSKID
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4 opacity-80" aria-hidden />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
