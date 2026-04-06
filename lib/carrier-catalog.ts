import type { CarrierRow } from "@/lib/types/database"

const now = "2026-04-05T00:00:00.000Z"

export const carrierCatalog = [
  {
    name: "T MOBILE PREPAID (1month)",
    slug: "t-mobile-prepaid-1month",
    description: "T-Mobile prepaid offering for one month.",
    logo_url: "/carriers/t-mobile-prepaid.svg",
    sort_order: 1,
  },
  {
    name: "AT&T PREPAID (1 month)",
    slug: "att-prepaid-1month",
    description: "AT&T prepaid offering for one month.",
    logo_url: "/carriers/att-prepaid.svg",
    sort_order: 2,
  },
  {
    name: "VERIZON PREPAID (1month)",
    slug: "verizon-prepaid-1month",
    description: "Verizon prepaid offering for one month.",
    logo_url: "/carriers/verizon-prepaid.svg",
    sort_order: 3,
  },
  {
    name: "CARRIER UNLIMITED (using mobile data) (1yr eSIM)",
    slug: "carrier-unlimited-mobile-data-1yr-esim",
    description: "One-year eSIM with mobile data usage focus.",
    logo_url: "/carriers/carrier-unlimited.svg",
    sort_order: 4,
  },
  {
    name: "AT&T iMessage only 1yr plan",
    slug: "att-imessage-only-1yr-plan",
    description: "AT&T one-year iMessage-only plan.",
    logo_url: "/carriers/att-imessage.svg",
    sort_order: 5,
  },
  {
    name: "RED-POCKET PREPAID (1 month)",
    slug: "red-pocket-prepaid-1month",
    description: "Red Pocket prepaid offering for one month.",
    logo_url: "/carriers/red-pocket-prepaid.svg",
    sort_order: 6,
  },
  {
    name: "LYCA PREPAID (1 month)",
    slug: "lyca-prepaid-1month",
    description: "Lyca prepaid offering for one month.",
    logo_url: "/carriers/lyca-prepaid.svg",
    sort_order: 7,
  },
  {
    name: "USMOBILE PREPAID (1month)",
    slug: "usmobile-prepaid-1month",
    description: "US Mobile prepaid offering for one month.",
    logo_url: "/carriers/usmobile-prepaid.svg",
    sort_order: 8,
  },
  {
    name: "CRICKET PREPAID (1 month)",
    slug: "cricket-prepaid-1month",
    description: "Cricket prepaid offering for one month.",
    logo_url: "/carriers/cricket-prepaid.svg",
    sort_order: 9,
  },
  {
    name: "BOOST PREPAID (1 month)",
    slug: "boost-prepaid-1month",
    description: "Boost prepaid offering for one month.",
    logo_url: "/carriers/boost-prepaid.svg",
    sort_order: 10,
  },
  {
    name: "MINT MOBILE PREPAID (1 month)",
    slug: "mint-mobile-prepaid-1month",
    description: "Mint Mobile prepaid offering for one month.",
    logo_url: "/carriers/mint-mobile-prepaid.svg",
    sort_order: 11,
  },
  {
    name: "ULTRA MOBILE PREPAID (1 month)",
    slug: "ultra-mobile-prepaid-1month",
    description: "Ultra Mobile prepaid offering for one month.",
    logo_url: "/carriers/ultra-mobile-prepaid.svg",
    sort_order: 12,
  },
] as const

export function getCatalogRows(): CarrierRow[] {
  return carrierCatalog.map((carrier, index) => ({
    id: `catalog-${index + 1}`,
    created_at: now,
    ...carrier,
  }))
}

