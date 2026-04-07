import Link from "next/link"
import { redirect } from "next/navigation"
import { BadgeHelp, ChevronRight, LifeBuoy, Package, Sparkles } from "lucide-react"
import { ProfileSettingsForm } from "@/components/profile/settings-form"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { Card, CardContent } from "@/components/ui/card"
import { getOrdersForUser } from "@/lib/data/queries"
import { getServerUser } from "@/lib/supabase/auth"

export default async function ProfilePage() {
  const { user } = await getServerUser()
  if (!user) {
    redirect("/login?next=/profile")
  }

  const email = user.email ?? ""
  const preferences = (user.user_metadata?.preferences ?? {}) as {
    order_updates?: boolean
    support_emails?: boolean
  }
  const displayName =
    (user.user_metadata?.full_name as string | undefined) || deriveNameFromEmail(email)
  const orders = await getOrdersForUser(user.id)
  const latestOrder = orders[0]

  return (
    <div className="flex flex-col">
      <header className="overflow-hidden rounded-b-[2.25rem] bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_50%),linear-gradient(160deg,#1A8FFF,#0a84ff,#0060CC)] px-5 pb-12 pt-10 text-primary-foreground">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={createPortraitDataUri(email)}
              alt={displayName}
              className="size-20 rounded-[1.75rem] border border-white/20 bg-white/10 object-cover shadow-[0_12px_28px_rgba(15,23,42,0.18)]"
            />
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.12] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
                <Sparkles className="size-3" />
                Account
              </div>
              <h1 className="mt-2 truncate text-2xl font-semibold leading-tight">{displayName}</h1>
              <p className="mt-0.5 truncate text-sm text-primary-foreground/75">{email}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg flex-1 px-5 py-10">
        <div className="space-y-8">

          {/* Left column */}
          <section className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              Quick Links
            </p>
            <ProfileLink
              href="/orders"
              icon={<Package className="size-5 text-amber-800/80" />}
              title="Order history"
              subtitle={
                latestOrder
                  ? `Latest: ${latestOrder.plan.name} · ${latestOrder.status}`
                  : "Track status and delivery"
              }
            />
            <ProfileLink
              href="/faq"
              icon={<BadgeHelp className="size-5 text-orange-700/80" />}
              title="Help & FAQ"
              subtitle="Quick answers before you contact support"
            />
            <ProfileLink
              href="https://wa.me/2349132560731"
              icon={<LifeBuoy className="size-5 text-emerald-700/80" />}
              title="WhatsApp support"
              subtitle="Chat with the team on WhatsApp"
              external
            />
          </section>

          {/* Right column */}
          <div className="space-y-6">
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                Settings
              </p>
              <ProfileSettingsForm
                defaultName={displayName}
                defaultOrderUpdates={preferences.order_updates ?? true}
                defaultSupportEmails={preferences.support_emails ?? false}
              />
            </div>
            <div className="pt-2">
              <SignOutButton label="Sign out" />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              TOMSKID eSIM · v1.0.0
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

function ProfileLink({
  href,
  icon,
  title,
  subtitle,
  external,
}: {
  href: string
  icon: React.ReactNode
  title: string
  subtitle: string
  external?: boolean
}) {
  const className =
    "flex items-center gap-3.5 rounded-2xl border-0 bg-card p-4 shadow-[var(--shadow-card)] ring-1 ring-border/50 transition-all duration-150 hover:shadow-[var(--shadow-premium)] hover:-translate-y-0.5"
  const content = (
    <>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{title}</p>
        <p className="truncate text-xs text-muted-foreground/75 mt-0.5">{subtitle}</p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/40" aria-hidden />
    </>
  )

  if (external) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  )
}

function deriveNameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "Account"
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function createPortraitDataUri(seed: string) {
  const index = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const skin = ["#F6D0B1", "#E8B58D", "#C98B6B", "#8E5D49"][index % 4]
  const hair = ["#1F2937", "#5B3A29", "#A16207", "#0F172A"][(index + 1) % 4]
  const shirt = ["#2563EB", "#0EA5E9", "#14B8A6", "#7C3AED"][(index + 2) % 4]
  const bg = ["#DBEAFE", "#E0F2FE", "#DCFCE7", "#F3E8FF"][(index + 3) % 4]
  const eye = index % 2 === 0 ? "#0F172A" : "#1E293B"
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none">
      <rect width="160" height="160" rx="36" fill="${bg}"/>
      <circle cx="120" cy="38" r="18" fill="white" fill-opacity="0.42"/>
      <path d="M28 132C28 106.595 48.5949 86 74 86H86C111.405 86 132 106.595 132 132V160H28V132Z" fill="${shirt}"/>
      <ellipse cx="80" cy="73" rx="34" ry="39" fill="${skin}"/>
      <path d="M48 64C48 42.4609 62.7746 26 80 26C97.2254 26 112 42.4609 112 64V66H48V64Z" fill="${hair}"/>
      <path d="M54 61C57 46 67 38 80 38C93 38 103 46 106 61" stroke="${hair}" stroke-width="12" stroke-linecap="round"/>
      <circle cx="68" cy="74" r="3.5" fill="${eye}"/>
      <circle cx="92" cy="74" r="3.5" fill="${eye}"/>
      <path d="M71 91C76 95 84 95 89 91" stroke="#7C2D12" stroke-width="4" stroke-linecap="round"/>
      <path d="M58 112C64 117 72 120 80 120C88 120 96 117 102 112" stroke="white" stroke-opacity="0.35" stroke-width="6" stroke-linecap="round"/>
    </svg>
  `

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
