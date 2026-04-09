export function normalizeCurrencyCode(currency?: string | null) {
  const normalized = currency?.trim().toUpperCase()

  if (!normalized || normalized === "USD" || normalized === "NG") {
    return "NGN"
  }

  return normalized
}

export function formatMoney(cents: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: normalizeCurrencyCode(currency),
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso))
}
