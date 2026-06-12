import { localizedPath, type Locale } from '@/lib/i18n'
import { canonicalTreatmentSlug, TREATMENT_SLUG_ALIASES } from '@/lib/content/treatment-slugs'

/** Ensure trailing slash for public paths. */
export function withTrailingSlash(path: string): string {
  if (path === '/') return '/'
  return path.endsWith('/') ? path : `${path}/`
}

export function slugToLabel(segment: string): string {
  return segment
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ─── Path builders ───────────────────────────────────────────────────────────

export function clinicsHubPath(locale: Locale = 'en'): string {
  return localizedPath('/clinics', locale)
}

export function clinicCountryPath(country: string, locale: Locale = 'en'): string {
  return localizedPath(`/clinics/${country}`, locale)
}

export function clinicCityPath(country: string, city: string, locale: Locale = 'en'): string {
  return localizedPath(`/clinics/${country}/${city}`, locale)
}

export function clinicCountryTreatmentPath(
  country: string,
  treatment: string,
  locale: Locale = 'en',
): string {
  return localizedPath(`/clinics/${country}/${canonicalTreatmentSlug(treatment)}`, locale)
}

export function clinicCityTreatmentPath(
  country: string,
  city: string,
  treatment: string,
  locale: Locale = 'en',
): string {
  return localizedPath(
    `/clinics/${country}/${city}/${canonicalTreatmentSlug(treatment)}`,
    locale,
  )
}

export function clinicPdpPath(
  country: string,
  city: string,
  clinic: string,
  locale: Locale = 'en',
): string {
  return localizedPath(`/clinics/${country}/${city}/${clinic}`, locale)
}

export function treatmentsHubPath(locale: Locale = 'en'): string {
  return localizedPath('/treatments', locale)
}

export function treatmentPath(treatment: string, locale: Locale = 'en'): string {
  return localizedPath(`/treatments/${canonicalTreatmentSlug(treatment)}`, locale)
}

export function costHubPath(locale: Locale = 'en'): string {
  return localizedPath('/cost', locale)
}

export function costTreatmentPath(treatment: string, locale: Locale = 'en'): string {
  return localizedPath(`/cost/${canonicalTreatmentSlug(treatment)}`, locale)
}

export function costCountryPath(
  treatment: string,
  country: string,
  locale: Locale = 'en',
): string {
  return localizedPath(`/cost/${canonicalTreatmentSlug(treatment)}/${country}`, locale)
}

export function costCityPath(
  treatment: string,
  country: string,
  city: string,
  locale: Locale = 'en',
): string {
  return localizedPath(
    `/cost/${canonicalTreatmentSlug(treatment)}/${country}/${city}`,
    locale,
  )
}

export function compareHubPath(locale: Locale = 'en'): string {
  return localizedPath('/compare', locale)
}

export function compareClinicPath(clinicA: string, clinicB: string, locale: Locale = 'en'): string {
  const [a, b] = canonicalPair(clinicA, clinicB)
  return localizedPath(`/compare/${a}-vs-${b}`, locale)
}

export function compareCityPath(
  cityA: string,
  cityB: string,
  treatment: string,
  locale: Locale = 'en',
): string {
  const [a, b] = canonicalPair(cityA, cityB)
  return localizedPath(`/compare/${a}-vs-${b}-for-${canonicalTreatmentSlug(treatment)}`, locale)
}

export function compareCountryPath(
  countryA: string,
  countryB: string,
  treatment: string,
  locale: Locale = 'en',
): string {
  const [a, b] = canonicalPair(countryA, countryB)
  return localizedPath(`/compare/${a}-vs-${b}-for-${canonicalTreatmentSlug(treatment)}`, locale)
}

export function guidesHubPath(locale: Locale = 'en'): string {
  return localizedPath('/guides', locale)
}

export function guidePath(slug: string, locale: Locale = 'en'): string {
  const clean = slug.replace(/^\/?guides\//, '').replace(/\/$/, '')
  return localizedPath(`/guides/${clean}`, locale)
}

export function countriesHubPath(locale: Locale = 'en'): string {
  return localizedPath('/countries', locale)
}

export function countryLandingPath(country: string, locale: Locale = 'en'): string {
  return localizedPath(`/countries/${country}`, locale)
}

export function cityLandingPath(
  country: string,
  city: string,
  locale: Locale = 'en',
): string {
  return localizedPath(`/countries/${country}/${city}`, locale)
}

export function startPath(locale: Locale = 'en'): string {
  return localizedPath('/start', locale)
}

// ─── Canonical ordering ──────────────────────────────────────────────────────

export function canonicalPair(a: string, b: string): [string, string] {
  return a.localeCompare(b) <= 0 ? [a, b] : [b, a]
}

// ─── Compare slug parsing ────────────────────────────────────────────────────

export type CompareType = 'clinic' | 'city' | 'country'

export interface ParsedCompareSlug {
  type: CompareType
  entityA: string
  entityB: string
  treatment?: string
  canonicalSlug: string
  isCanonicalOrder: boolean
}

const COMPARE_FOR_RE = /^(.+)-vs-(.+)-for-(.+)$/
const COMPARE_VS_RE = /^(.+)-vs-(.+)$/

export function parseCompareSlug(rawSlug: string): ParsedCompareSlug | null {
  const slug = rawSlug.replace(/^\//, '').replace(/^compare\//, '').replace(/\/$/, '')
  if (!slug) return null

  const forMatch = slug.match(COMPARE_FOR_RE)
  if (forMatch) {
    const [, rawA, rawB, treatment] = forMatch
    const [entityA, entityB] = canonicalPair(rawA, rawB)
    const isCanonicalOrder = rawA === entityA
    return {
      type: 'country',
      entityA,
      entityB,
      treatment,
      canonicalSlug: `${entityA}-vs-${entityB}-for-${treatment}`,
      isCanonicalOrder,
    }
  }

  const vsMatch = slug.match(COMPARE_VS_RE)
  if (vsMatch) {
    const [, rawA, rawB] = vsMatch
    const [entityA, entityB] = canonicalPair(rawA, rawB)
    const isCanonicalOrder = rawA === entityA
    return {
      type: 'clinic',
      entityA,
      entityB,
      canonicalSlug: `${entityA}-vs-${entityB}`,
      isCanonicalOrder,
    }
  }

  return null
}

export function resolveCompareCanonicalSlug(
  rawSlug: string,
  treatmentSlugs: Set<string>,
): ParsedCompareSlug | null {
  const parsed = parseCompareSlug(rawSlug)
  if (!parsed) return null

  if (parsed.treatment) {
    const treatment = canonicalTreatmentSlug(parsed.treatment)
    const treatmentSet = treatmentSlugs
    if (treatmentSet.has(parsed.entityA) || treatmentSet.has(parsed.entityB)) {
      return {
        ...parsed,
        type: 'city',
        treatment,
        canonicalSlug: `${parsed.entityA}-vs-${parsed.entityB}-for-${treatment}`,
      }
    }
    return { ...parsed, treatment, canonicalSlug: `${parsed.entityA}-vs-${parsed.entityB}-for-${treatment}` }
  }

  return parsed
}

// ─── Clinics segment resolution ──────────────────────────────────────────────

export type ClinicsSegment2Kind = 'city_plp' | 'country_treatment_plp'
export type ClinicsSegment3Kind = 'clinic_pdp' | 'city_treatment_plp'

export function resolveClinicsSegment2(
  country: string,
  segment: string,
  treatmentSlugs: Set<string>,
): { kind: ClinicsSegment2Kind; city?: string; treatment?: string } {
  if (treatmentSlugs.has(segment)) {
    return { kind: 'country_treatment_plp', treatment: canonicalTreatmentSlug(segment) }
  }
  return { kind: 'city_plp', city: segment }
}

export function resolveClinicsSegment3(
  country: string,
  citySegment: string,
  leafSegment: string,
  treatmentSlugs: Set<string>,
): { kind: ClinicsSegment3Kind; city: string; clinic?: string; treatment?: string } {
  if (treatmentSlugs.has(leafSegment)) {
    return {
      kind: 'city_treatment_plp',
      city: citySegment,
      treatment: canonicalTreatmentSlug(leafSegment),
    }
  }
  return { kind: 'clinic_pdp', city: citySegment, clinic: leafSegment }
}

/** CMS page slug for `loadPublishedPage` — no locale prefix, no trailing slash. */
export function cmsPageSlug(...segments: string[]): string {
  return `/${segments.filter(Boolean).join('/')}`
}

export function cmsClinicCountrySlug(country: string): string {
  return cmsPageSlug('clinics', country)
}

export function cmsClinicCitySlug(country: string, city: string): string {
  return cmsPageSlug('clinics', country, city)
}

export function cmsClinicCountryTreatmentSlug(country: string, treatment: string): string {
  return cmsPageSlug('clinics', country, canonicalTreatmentSlug(treatment))
}

export function cmsClinicCityTreatmentSlug(
  country: string,
  city: string,
  treatment: string,
): string {
  return cmsPageSlug('clinics', country, city, canonicalTreatmentSlug(treatment))
}

export function cmsClinicPdpSlug(country: string, city: string, clinic: string): string {
  return cmsPageSlug('clinics', country, city, clinic)
}

export function cmsCostSlug(
  treatment: string,
  country?: string,
  city?: string,
): string {
  const segments = ['cost', canonicalTreatmentSlug(treatment), country, city].filter(
    (s): s is string => Boolean(s),
  )
  return cmsPageSlug(...segments)
}

// ─── Legacy redirect helpers ─────────────────────────────────────────────────

export function legacyCostToNew(slug: string): string | null {
  const match = slug.replace(/^\//, '').match(/^costs\/([^/]+)-ivf-cost-\d{4}\/?$/)
  if (!match) return null
  return `/cost/ivf/${match[1]}/`
}

export function legacyCompareToNew(slug: string): string | null {
  const match = slug.replace(/^\//, '').match(/^compare\/(.+)-vs-(.+)-ivf\/?$/)
  if (!match) return null
  const [a, b] = canonicalPair(match[1], match[2])
  return `/compare/${a}-vs-${b}-for-ivf/`
}

export function legacyCityToClinic(slug: string): string | null {
  const match = slug.replace(/^\//, '').match(/^cities\/([^/]+)\/([^/]+)\/?$/)
  if (!match) return null
  return `/clinics/${match[1]}/${match[2]}/`
}

export function legacyGuideFlatten(slug: string): string | null {
  const match = slug.replace(/^\//, '').match(/^guides\/[^/]+\/(.+-ivf-guide)\/?$/)
  if (!match) return null
  return `/guides/${match[1]}/`
}

export function legacyTreatmentSlugRedirect(pathname: string): string | null {
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`
  for (const [alias, canonical] of Object.entries(TREATMENT_SLUG_ALIASES)) {
    const needle = `/${alias}/`
    if (normalized.includes(needle)) {
      return normalized.replaceAll(needle, `/${canonical}/`)
    }
  }
  return null
}
