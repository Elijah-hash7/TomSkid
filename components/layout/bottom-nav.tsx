"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CircleHelp, Home, LayoutList, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/plans", label: "Plans", icon: LayoutList },
  { href: "/faq", label: "FAQ", icon: CircleHelp },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-card/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md md:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1">
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
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[0.7rem] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative flex flex-col items-center gap-0.5">
                <Icon
                  className={cn("size-5", active && "stroke-[2.2px]")}
                  aria-hidden
                />
                {active ? (
                  <span className="h-1 w-1 rounded-full bg-primary" aria-hidden />
                ) : (
                  <span className="h-1 w-1" aria-hidden />
                )}
              </span>
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
