import Link from "next/link"

export function Hero({
  stats,
}: {
  stats?: { total: number; pending: number; delivered: number } | null
}) {
  return (
    <section className="relative overflow-hidden rounded-b-[3.5rem] md:rounded-none bg-gradient-to-b from-[#0A84FF] to-[#0066CC] px-5 md:px-10 lg:px-14 pb-6 md:pb-10 pt-4 md:pt-8 text-white shadow-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
      <div className="absolute inset-0 border-b border-white/10 rounded-b-[3.5rem] pointer-events-none" />

      <div
        className="pointer-events-none absolute -right-20 top-4 size-[200px] rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 top-1/2 size-[150px] rounded-full bg-white/20 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-lg md:max-w-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-[3.35rem] items-center justify-center rounded-[1.1rem] border border-white/25 bg-white/12 text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)] backdrop-blur-md">
              <span className="text-[1.05rem] font-black tracking-[-0.08em] text-white font-heading">
                Te
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-heading flex items-baseline gap-1 text-white leading-none">
                <span className="text-[1.12rem] font-black tracking-[-0.04em] uppercase">Tomskid</span>
                <span className="text-[1.05rem] font-black tracking-tighter text-white/50">eSIM</span>
              </p>
            </div>




          </div>
          <a 
            href="https://wa.me/2349132560731" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
            title="Chat with Support"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </a>


        </div>

        <div className="mt-8 md:flex md:items-end md:justify-between md:gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
              <span className="mr-1.5 text-sm">🇺🇸</span>
              US eSIM Available
            </div>
            <div className="hidden md:block">
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                Premium eSIM plans<br />for the US market.
              </h2>
              <p className="mt-2 text-white/70 text-sm font-medium max-w-sm">
                Pick your carrier, choose a plan, and get activated with personal support.
              </p>
            </div>
          </div>

          {stats ? (
            <div className="mt-4 md:mt-0 md:w-72 shrink-0 rounded-[1.5rem] border border-white/15 bg-white/10 p-3.5 backdrop-blur-md shadow-lg">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-white/70">
                Order activity
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 px-2 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/40">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black tracking-tight text-white">{value}</p>
    </div>


  )
}
