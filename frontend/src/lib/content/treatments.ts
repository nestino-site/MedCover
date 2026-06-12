import type { Taxonomy } from '@/lib/api/types'
import type { HubId } from './site-nav'

export interface TreatmentHubLink {
  hubId: HubId
  labelKey: 'countries' | 'cities' | 'guides'
}

export interface TreatmentCategory {
  id: string
  name: string
  clinicCount: number
  countries: string[]
  hubLinks: TreatmentHubLink[]
}

export function treatmentsFromTaxonomy(taxonomy: Taxonomy): TreatmentCategory[] {
  return taxonomy.treatments.map((t) => ({
    id: t.slug,
    name: t.name,
    clinicCount: t.clinicCount,
    countries: t.countries,
    hubLinks: [
      { hubId: 'countries', labelKey: 'countries' },
      { hubId: 'clinics', labelKey: 'cities' },
      { hubId: 'guides', labelKey: 'guides' },
    ],
  }))
}

export function countryHasTreatment(
  taxonomy: Taxonomy,
  countryKey: string,
  treatmentId: string,
): boolean {
  const treatment = taxonomy.treatments.find((t) => t.slug === treatmentId)
  if (!treatment) return false
  return treatment.countries.includes(countryKey)
}

export function countryMatchesTreatmentFilter(
  taxonomy: Taxonomy,
  countryKey: string,
  treatmentId: string | undefined,
): boolean {
  if (!treatmentId) return true
  return countryHasTreatment(taxonomy, countryKey, treatmentId)
}

export function getTreatmentsForCountryFromTaxonomy(
  taxonomy: Taxonomy,
  countryKey: string,
): TreatmentCategory[] {
  return treatmentsFromTaxonomy(taxonomy).filter((t) =>
    t.countries.includes(countryKey),
  )
}

/** First taxonomy treatment offered in a country — used for default cost strips on geo PLPs. */
export function primaryTreatmentSlugForCountry(
  taxonomy: Taxonomy,
  countryKey: string,
): string | undefined {
  return taxonomy.treatments.find((t) => t.countries.includes(countryKey))?.slug
}

export type TreatmentDisplayStatus = 'active' | 'coming_soon'

export type TreatmentCategoryDisplay = TreatmentCategory & {
  status: TreatmentDisplayStatus
}

const COMING_SOON_TREATMENTS: Omit<TreatmentCategory, 'clinicCount' | 'countries'>[] = [
  {
    id: 'dental',
    name: 'Dental',
    hubLinks: [
      { hubId: 'countries', labelKey: 'countries' },
      { hubId: 'clinics', labelKey: 'cities' },
      { hubId: 'guides', labelKey: 'guides' },
    ],
  },
  {
    id: 'hair',
    name: 'Hair Restoration',
    hubLinks: [
      { hubId: 'countries', labelKey: 'countries' },
      { hubId: 'clinics', labelKey: 'cities' },
      { hubId: 'guides', labelKey: 'guides' },
    ],
  },
  {
    id: 'cosmetic',
    name: 'Cosmetic Surgery',
    hubLinks: [
      { hubId: 'countries', labelKey: 'countries' },
      { hubId: 'clinics', labelKey: 'cities' },
      { hubId: 'guides', labelKey: 'guides' },
    ],
  },
]

export function treatmentsForDisplay(taxonomy: Taxonomy): TreatmentCategoryDisplay[] {
  const active = treatmentsFromTaxonomy(taxonomy).map((t) => ({
    ...t,
    status: 'active' as const,
  }))
  const activeIds = new Set(active.map((t) => t.id))
  const comingSoon = COMING_SOON_TREATMENTS.filter((t) => !activeIds.has(t.id)).map((t) => ({
    ...t,
    clinicCount: 0,
    countries: [] as string[],
    status: 'coming_soon' as const,
  }))
  return [...active, ...comingSoon]
}

export function getTreatmentTagsForCountry(
  taxonomy: Taxonomy,
  countryKey: string,
): { id: string; name: string; status: 'active' | 'coming_soon' }[] {
  return getTreatmentsForCountryFromTaxonomy(taxonomy, countryKey).map((t) => ({
    id: t.id,
    name: t.name,
    status: 'active' as const,
  }))
}
