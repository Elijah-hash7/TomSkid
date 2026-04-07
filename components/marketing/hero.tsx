import Link from "next/link"

export function Hero({
  stats,
}: {
  stats?: { total: number; pending: number; delivered: number } | null
}) {
  return (
    <section className="relative overflow-hidden rounded-b-[3.5rem] bg-gradient-to-b from-[#1A8FFF] via-[#0A84FF] to-[#0060CC] px-3 pb-6 pt-4 text-white md:px-5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.10),transparent_60%)] pointer-events-none" />

      <div className="relative mx-auto w-full md:max-w-lg">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-12 items-center justify-center rounded-[0.85rem] border border-white/20 bg-gradient-to-b from-white/26 via-white/16 to-white/[0.05] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_18px_rgba(8,102,214,0.22)] backdrop-blur-sm">
            <span className="text-[1.05rem] text-white" style={{
              fontFamily: "'Clash Display', sans-serif",
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}>
              TE
            </span>
          </div>
          <div className="min-w-0">
            <p className="flex items-baseline gap-1.5 text-white leading-none">
              <span className="text-[1.1rem] text-white" style={{
                fontFamily: "'Clash Display', sans-serif",
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase'
              }}>
                TOMSKID
              </span>
              <span className="text-[0.75rem] text-white" style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontWeight: 500,
                letterSpacing: '0.12em',
                opacity: 0.5
              }}>
                eSIM
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/[0.10] px-3 py-1 text-[12px] font-semibold text-white/90">
              <span className="mr-2">🇺🇸</span>
              US eSIM Available
            </div>
            <div>
              <h2 className="max-w-sm text-[1.75rem] font-bold tracking-tight leading-[1.1] font-heading">
                Premium eSIM plans for the US market.
              </h2>
              <p className="mt-3 max-w-[20rem] text-[0.95rem] leading-relaxed text-white/75">
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
