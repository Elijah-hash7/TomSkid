import { FaqSection } from "@/components/faq/faq-section"

export default function FaqPage() {
  return (
    <div className="flex flex-col">
      <header className="relative overflow-hidden rounded-b-[3rem] bg-gradient-to-b from-[#1A8FFF] via-[#0A84FF] to-[#0060CC] px-5 pb-10 pt-10 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none" />
        <div className="relative mx-auto max-w-lg space-y-1">
          <h1 className="text-[2rem] font-bold tracking-tight leading-tight uppercase">
            Help & FAQ
          </h1>
          <p className="text-sm text-white/70">
            Straight answers about ordering and eSIM on TOMSKID.
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg flex-1 px-5 py-10">
        <FaqSection />
      </div>

    </div>
  )
}
