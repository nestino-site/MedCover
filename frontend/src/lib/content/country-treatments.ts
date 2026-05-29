import { treatmentCategories, type TreatmentCategory } from './treatments'
import { staticCitiesPerCountry } from './hubs'

export type TreatmentId = 'ivf' | 'dental' | 'hair' | 'cosmetic'

/** Active treatments per country. Extend as new specialties go live. */
export const countryTreatments: Record<string, TreatmentId[]> = Object.fromEntries(
  Object.keys(staticCitiesPerCountry).map((countryKey) => [countryKey, ['ivf'] as TreatmentId[]]),
)

export function getActiveTreatmentIdsForCountry(countryKey: string): TreatmentId[] {
  return countryTreatments[countryKey] ?? []
}

export function countryHasTreatment(countryKey: string, treatmentId: string): boolean {
  return getActiveTreatmentIdsForCountry(countryKey).includes(treatmentId as TreatmentId)
}

/** Returns treatment categories available for a country (active ones from per-country data). */
export function getTreatmentsForCountry(countryKey: string): TreatmentCategory[] {
  const activeIds = getActiveTreatmentIdsForCountry(countryKey)
  return treatmentCategories.filter((c) => activeIds.includes(c.id as TreatmentId))
}

/** All treatment categories with status for display tags on cards. */
export function getTreatmentTagsForCountry(countryKey: string): Array<{
  id: string
  name: string
  status: 'active' | 'coming_soon'
}> {
  const activeIds = getActiveTreatmentIdsForCountry(countryKey)
  return treatmentCategories.map((c) => ({
    id: c.id,
    name: c.name,
    status: activeIds.includes(c.id as TreatmentId) ? 'active' : 'coming_soon',
  }))
}

export function countryMatchesTreatmentFilter(
  countryKey: string,
  treatmentId: string | undefined,
): boolean {
  if (!treatmentId) return true
  const category = treatmentCategories.find((c) => c.id === treatmentId)
  if (!category) return true
  if (category.status === 'coming_soon') return false
  return countryHasTreatment(countryKey, treatmentId)
}
