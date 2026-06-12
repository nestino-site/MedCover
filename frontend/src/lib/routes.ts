import { localizedPath, type Locale } from '@/lib/i18n'
import {
  canonicalTreatmentSlug,
  TREATMENT_SLUG_ALIASES,
  treatmentSlugVariants,
} from '@/lib/content/treatment-slugs'
import type { Taxonomy } from '@/lib/api/types'

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

/** Default clinic PLP for a treatment — first country that offers it, else clinics hub. */
export function clinicTreatmentBrowsePath(
  treatment: string,
  countries: string[],
  locale: Locale = 'en',
): string {
  const firstCountry = countries[0]
  if (firstCountry) {
    return clinicCountryTreatmentPath(firstCountry, treatment, locale)
  }
  return clinicsHubPath(locale)
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

const COMPARE_VS_RE = /^(.+)-vs-(.+)$/

/** Collapse repeated `-for` segments (legacy middleware bug artifact). */
function dedupeCompareForSegments(tail: string): string {
  const vsIndex = tail.indexOf('-vs-')
  if (vsIndex === -1) return tail

  const head = tail.slice(0, vsIndex + 4)
  const rest = tail.slice(vsIndex + 4)
  const normalizedRest = rest.replace(/^(.+?)(?:-for)+-([^-]+)$/, '$1-for-$2')
  return head + normalizedRest
}

function parseTreatmentCompareTail(
  tail: string,
): { rawA: string; rawB: string; treatment: string } | null {
  const normalized = dedupeCompareForSegments(tail)
  const vsIndex = normalized.indexOf('-vs-')
  if (vsIndex <= 0) return null

  const rawA = normalized.slice(0, vsIndex)
  const rest = normalized.slice(vsIndex + 4)
  const forIndex = rest.lastIndexOf('-for-')
  if (forIndex <= 0) return null

  const rawB = rest.slice(0, forIndex)
  const treatment = rest.slice(forIndex + 5)
  if (!rawA || !rawB || !treatment) return null

  return { rawA, rawB, treatment }
}

/** Legacy CMS/public tails: `greece-vs-spain-ivf` (no `-for-`). Longest suffix first. */
const LEGACY_COMPARE_TREATMENT_SUFFIXES = [
  'hair-transplant',
  'ivf',
  'dental',
  'cosmetic',
  'hair',
] as const

function stripCompareSlug(rawSlug: string): string {
  return rawSlug.replace(/^\//, '').replace(/^compare\//, '').replace(/\/$/, '')
}

function parseLegacyCompareTail(
  tail: string,
): { entityA: string; entityB: string; treatment: string; isCanonicalOrder: boolean } | null {
  for (const treatment of LEGACY_COMPARE_TREATMENT_SUFFIXES) {
    const suffix = `-${treatment}`
    if (!tail.endsWith(suffix)) continue
    const base = tail.slice(0, -suffix.length)
    const vsMatch = base.match(COMPARE_VS_RE)
    if (!vsMatch) continue
    const [, rawA, rawB] = vsMatch
    if (!rawA || !rawB) continue
    const [entityA, entityB] = canonicalPair(rawA, rawB)
    return { entityA, entityB, treatment, isCanonicalOrder: rawA === entityA }
  }
  return null
}

function buildTreatmentCompareParsed(
  rawA: string,
  rawB: string,
  treatment: string,
): ParsedCompareSlug {
  const [entityA, entityB] = canonicalPair(rawA, rawB)
  const canonicalTreatment = canonicalTreatmentSlug(treatment)
  return {
    type: 'country',
    entityA,
    entityB,
    treatment: canonicalTreatment,
    canonicalSlug: `${entityA}-vs-${entityB}-for-${canonicalTreatment}`,
    isCanonicalOrder: rawA === entityA,
  }
}

export function parseCompareSlug(rawSlug: string): ParsedCompareSlug | null {
  const slug = dedupeCompareForSegments(stripCompareSlug(rawSlug))
  if (!slug) return null

  const treatmentParts = parseTreatmentCompareTail(slug)
  if (treatmentParts) {
    return buildTreatmentCompareParsed(
      treatmentParts.rawA,
      treatmentParts.rawB,
      treatmentParts.treatment,
    )
  }

  const legacy = parseLegacyCompareTail(slug)
  if (legacy) {
    return buildTreatmentCompareParsed(legacy.entityA, legacy.entityB, legacy.treatment)
  }

  const vsIndex = slug.indexOf('-vs-')
  if (vsIndex > 0) {
    const rawA = slug.slice(0, vsIndex)
    const rawB = slug.slice(vsIndex + 4)
    if (rawA && rawB && !slug.includes('-for-')) {
      const [entityA, entityB] = canonicalPair(rawA, rawB)
      return {
        type: 'clinic',
        entityA,
        entityB,
        canonicalSlug: `${entityA}-vs-${entityB}`,
        isCanonicalOrder: rawA === entityA,
      }
    }
  }

  return null
}

/** Canonical compare tail (`greece-vs-spain-for-ivf`) from any backend or public slug tail. */
export function canonicalCompareTail(tail: string): string | null {
  return parseCompareSlug(tail)?.canonicalSlug ?? null
}

/** Country/city compares include `-for-{treatment}`; clinic compares do not. */
export function isTreatmentCompareTail(tail: string): boolean {
  const parsed = parseCompareSlug(tail)
  return Boolean(parsed?.treatment)
}

export function compareDetailPath(canonicalSlug: string, locale: Locale = 'en'): string {
  return localizedPath(`/compare/${canonicalSlug}`, locale)
}

export function compareSlugFromParsed(parsed: ParsedCompareSlug): string {
  if (parsed.treatment) {
    return `${parsed.entityA}-vs-${parsed.entityB}-for-${canonicalTreatmentSlug(parsed.treatment)}`
  }
  return `${parsed.entityA}-vs-${parsed.entityB}`
}

export function cmsCompareSlug(a: string, b: string, treatment?: string): string {
  const [entityA, entityB] = canonicalPair(a, b)
  if (treatment) {
    return cmsPageSlug(
      'compare',
      `${entityA}-vs-${entityB}-for-${canonicalTreatmentSlug(treatment)}`,
    )
  }
  return cmsPageSlug('compare', `${entityA}-vs-${entityB}`)
}

/** CMS slugs to probe — canonical first, then backend/taxonomy alias variants, then legacy `-ivf`. */
export function cmsCompareSlugCandidates(
  a: string,
  b: string,
  treatment?: string,
): string[] {
  const ordered: string[] = []
  const seen = new Set<string>()
  const add = (slug: string) => {
    if (seen.has(slug)) return
    seen.add(slug)
    ordered.push(slug)
  }

  if (treatment) {
    const canonical = canonicalTreatmentSlug(treatment)
    const [entityA, entityB] = canonicalPair(a, b)
    add(cmsCompareSlug(a, b, canonical))
    for (const variant of treatmentSlugVariants(canonical)) {
      add(cmsPageSlug('compare', `${entityA}-vs-${entityB}-for-${variant}`))
    }
    if (canonical === 'ivf') {
      add(legacyCompareCmsSlug(a, b))
    }
  } else {
    add(cmsCompareSlug(a, b))
    add(legacyCompareCmsSlug(a, b))
  }

  return ordered
}

/** Legacy CMS slug before `-for-{treatment}` migration. */
export function legacyCompareCmsSlug(a: string, b: string): string {
  const [entityA, entityB] = canonicalPair(a, b)
  return cmsPageSlug('compare', `${entityA}-vs-${entityB}-ivf`)
}

function taxonomyCountrySlugs(taxonomy: Taxonomy): Set<string> {
  return new Set(taxonomy.countries.map((c) => c.slug))
}

function taxonomyCitySlugs(taxonomy: Taxonomy): Set<string> {
  const slugs = new Set<string>()
  for (const country of taxonomy.countries) {
    for (const city of country.cities) {
      slugs.add(city.slug)
    }
  }
  return slugs
}

export function resolveCompareType(
  entityA: string,
  entityB: string,
  hasTreatment: boolean,
  taxonomy: Taxonomy,
): CompareType | null {
  if (!hasTreatment) return 'clinic'

  const countries = taxonomyCountrySlugs(taxonomy)
  const cities = taxonomyCitySlugs(taxonomy)
  const aIsCountry = countries.has(entityA)
  const bIsCountry = countries.has(entityB)
  const aIsCity = cities.has(entityA)
  const bIsCity = cities.has(entityB)

  if (aIsCountry && bIsCountry) return 'country'
  if (aIsCity && bIsCity) return 'city'
  return null
}

export function resolveCompareCanonicalSlug(
  rawSlug: string,
  taxonomy: Taxonomy,
): ParsedCompareSlug | null {
  const parsed = parseCompareSlug(rawSlug)
  if (!parsed) return null

  if (parsed.treatment) {
    const treatment = canonicalTreatmentSlug(parsed.treatment)
    const type = resolveCompareType(parsed.entityA, parsed.entityB, true, taxonomy)
    if (!type) return null
    return {
      ...parsed,
      type,
      treatment,
      canonicalSlug: `${parsed.entityA}-vs-${parsed.entityB}-for-${treatment}`,
    }
  }

  return { ...parsed, type: 'clinic' }
}

export function validateCompareEntities(
  parsed: ParsedCompareSlug,
  taxonomy: Taxonomy,
): boolean {
  if (parsed.type === 'clinic') {
    return false
  }

  if (parsed.type === 'country') {
    const countries = taxonomyCountrySlugs(taxonomy)
    return countries.has(parsed.entityA) && countries.has(parsed.entityB)
  }

  const cities = taxonomyCitySlugs(taxonomy)
  return cities.has(parsed.entityA) && cities.has(parsed.entityB)
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
  const stripped = slug.replace(/^\//, '').replace(/\/$/, '')
  if (stripped.includes('-for-')) return null
  const match = stripped.match(/^compare\/([^/]+)-vs-([^/]+)-ivf$/)
  if (!match) return null
  const [a, b] = canonicalPair(match[1], match[2])
  return `/compare/${a}-vs-${b}-for-ivf/`
}

/** Redirect compare URLs to canonical slug (order, legacy `-ivf`, duplicated `-for-`). */
export function comparePublicRedirect(pathname: string): string | null {
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`
  const match = normalized.match(/^\/compare\/([^/]+)\/$/)
  if (!match) return null

  const parsed = parseCompareSlug(match[1])
  if (!parsed) return null

  if (parsed.canonicalSlug !== match[1]) {
    return `/compare/${parsed.canonicalSlug}/`
  }
  return null
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
