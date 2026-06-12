export function formatCurrency(amount: number, currency = 'EUR'): string {
  const sym = currency === 'EUR' ? '€' : currency
  return `${sym}${amount.toLocaleString()}`
}

export function formatPriceRange(
  min: number,
  max: number,
  currency = 'EUR',
): string {
  return `${formatCurrency(min, currency)}–${formatCurrency(max, currency)}`
}

export function formatRelativeTime(timestamp?: number): string | null {
  if (!timestamp) return null
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return null
  const now = Date.now()
  const diffDays = Math.floor((now - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 1) return 'Today'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}

export function dimensionLabel(code: string): string {
  return code
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')
}
