import { Baby, Scissors, Smile, Sparkles, Stethoscope, type LucideIcon } from 'lucide-react'
import { canonicalTreatmentSlug } from './treatment-slugs'

export const TREATMENT_ICONS: Record<string, LucideIcon> = {
  ivf: Baby,
  dental: Smile,
  hair: Scissors,
  cosmetic: Sparkles,
}

export const TREATMENT_ICON_STYLES: Record<string, { bg: string; color: string }> = {
  ivf: {
    bg: 'bg-[var(--color-primary-50)]',
    color: 'text-[var(--color-primary-700)]',
  },
  dental: {
    bg: 'bg-[var(--color-accent-50)]',
    color: 'text-[var(--color-accent-700)]',
  },
  hair: {
    bg: 'bg-[var(--color-trust-50)]',
    color: 'text-[var(--color-trust-700)]',
  },
  cosmetic: {
    bg: 'bg-[var(--color-neutral-100)]',
    color: 'text-[var(--color-neutral-700)]',
  },
}

export function getTreatmentIcon(slug: string): LucideIcon {
  const key = canonicalTreatmentSlug(slug)
  return TREATMENT_ICONS[key] ?? Stethoscope
}

export function getTreatmentIconStyle(slug: string) {
  const key = canonicalTreatmentSlug(slug)
  return TREATMENT_ICON_STYLES[key] ?? TREATMENT_ICON_STYLES.ivf
}
