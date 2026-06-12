import type { ClinicDetail } from '@/lib/api/types'

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

/** AEO-friendly summary when CMS hero_answer block is absent. */
export function synthesizeClinicAnswer(
  clinic: Pick<
    ClinicDetail,
    'name' | 'treatments' | 'truthScore' | 'priceRange' | 'googleRating' | 'editorialSummary'
  >,
  cityName: string,
  countryName: string,
): string {
  if (clinic.editorialSummary?.trim()) return clinic.editorialSummary.trim()

  const parts: string[] = [
    `${clinic.name} is a fertility clinic in ${cityName}, ${countryName}.`,
  ]

  if (clinic.treatments.length > 0) {
    const names = clinic.treatments
      .slice(0, 3)
      .map((t) => t.name)
      .join(', ')
    parts.push(
      `They offer ${names}${clinic.treatments.length > 3 ? ', and more' : ''}.`,
    )
  }

  if (clinic.truthScore?.composite != null) {
    parts.push(
      `MedCover Truth Score: ${clinic.truthScore.composite}/100${clinic.truthScore.grade ? ` (${clinic.truthScore.grade})` : ''}.`,
    )
  } else if (clinic.googleRating != null) {
    parts.push(`Google rating: ${clinic.googleRating.toFixed(1)}/5.`)
  }

  if (clinic.priceRange) {
    parts.push(
      `Typical packages from ${formatPriceRange(clinic.priceRange.min, clinic.priceRange.max, clinic.priceRange.currency)}.`,
    )
  }

  return parts.join(' ')
}

export function buildClinicMetadataFallback(
  clinic: ClinicDetail,
  cityName: string,
  countryName: string,
): { title: string; description: string } {
  const treatment = clinic.treatments[0]?.name ?? 'Fertility treatment'
  const title = `${clinic.name} — ${treatment} in ${cityName}, ${countryName} | MedCover`
  const description = synthesizeClinicAnswer(clinic, cityName, countryName).slice(0, 160)
  return { title, description }
}
