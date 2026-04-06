import { FaqSection } from "@/components/faq/faq-section"

export default function FaqPage() {
  return (
    <div className="flex flex-col">
      <header className="rounded-b-[3rem] md:rounded-none bg-gradient-to-b from-[#0A84FF] to-[#0066CC] px-5 md:px-10 lg:px-14 pb-10 pt-10 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
        <div className="mx-auto max-w-lg md:max-w-none space-y-1 relative">
          <h1 className="text-[2rem] font-bold tracking-tight leading-tight uppercase">
            Help & FAQ
          </h1>
          <p className="text-white/70 text-sm font-medium">
            Straight answers about ordering and eSIM on TOMSKID.
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg md:max-w-2xl flex-1 px-5 md:px-10 lg:px-14 py-12">
        <FaqSection />
      </div>

    </div>
  )
}
