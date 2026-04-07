import Link from "next/link"

export function Hero({
  stats,
}: {
  stats?: { total: number; pending: number; delivered: number } | null
}) {
  return (
    <section className="relative overflow-hidden rounded-b-[3.5rem] bg-gradient-to-b from-[#1A8FFF] via-[#0A84FF] to-[#0060CC] px-5 pb-6 pt-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.10),transparent_60%)] pointer-events-none" />

      <div className="relative mx-auto max-w-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/[0.12] text-white backdrop-blur-sm">
            <span className="text-[0.9rem] font-black tracking-[-0.08em] text-white font-heading">
              Te
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-heading flex items-baseline gap-1 text-white leading-none">
              <span className="text-base font-bold tracking-tight uppercase">Tomskid</span>
              <span className="text-sm font-semibold text-white/50">eSIM</span>
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/[0.10] px-2.5 py-1 text-[11px] font-medium text-white/85">
              <span className="mr-1.5">🇺🇸</span>
              US eSIM Available
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight leading-snug">
                Premium eSIM plans for the US market.
              </h2>
              <p className="mt-1.5 max-w-xs text-sm text-white/65">
                Pick your carrier, choose a plan, and get activated with personal support.
              </p>
            </div>
          </div>

          {stats ? (
            <div className="shrink-0 rounded-2xl border border-white/15 bg-white/[0.10] p-3 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
                Order activity
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <MetricCard label="All" value={String(stats.total)} />
                <MetricCard label="Pending" value={String(stats.pending)} />
                <MetricCard label="Delivered" value={String(stats.delivered)} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] px-2 py-2.5">
      <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-white/45">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold tracking-tight text-white">{value}</p>
    </div>
  )
}
