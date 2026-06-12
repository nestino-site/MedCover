import 'server-only'
import type { ContentListItem } from './types'
import type {
  ClinicCard,
  ClinicDetail,
  ClinicListResponse,
  CompareResponse,
  CostsResponse,
  Taxonomy,
} from './types'
import { clinicPdpPath, slugToLabel } from '@/lib/routes'
import { flagEmojiForCountry } from '@/lib/content/country-flags'
import { loadPublishedPage } from './content'

/** Derive taxonomy from published page slugs (real backend data). */
export function buildTaxonomyFromPages(pages: ContentListItem[]): Taxonomy {
  const countryMap = new Map<string, {
    slug: string
    name: string
    clinicCount: number
    cities: Map<string, { slug: string; name: string; clinicCount: number }>
  }>()
  const treatmentSet = new Map<string, { slug: string; code: string; name: string; clinicCount: number; countries: Set<string> }>()

  for (const page of pages) {
    const slug = page.slug.replace(/^\//, '')

    const pdpMatch = slug.match(/^clinics\/([^/]+)\/([^/]+)\/([^/]+)$/)
    if (pdpMatch) {
      const [, country, city, clinicSlug] = pdpMatch
      if (!countryMap.has(country)) {
        countryMap.set(country, {
          slug: country,
          name: slugToLabel(country),
          clinicCount: 0,
          cities: new Map(),
        })
      }
      const c = countryMap.get(country)!
      c.clinicCount++
      if (!c.cities.has(city)) {
        c.cities.set(city, { slug: city, name: slugToLabel(city), clinicCount: 0 })
      }
      c.cities.get(city)!.clinicCount++
      continue
    }

    const guideCountry = slug.match(/^guides\/([^/]+)-ivf-guide$/)
    if (guideCountry) {
      const country = guideCountry[1]
      if (!countryMap.has(country)) {
        countryMap.set(country, {
          slug: country,
          name: slugToLabel(country),
          clinicCount: 0,
          cities: new Map(),
        })
      }
    }

    const guideCity = slug.match(/^guides\/([^/]+)\/(.+)-ivf-guide$/)
    if (guideCity) {
      const [, country, citySegment] = guideCity
      const city = citySegment.replace(/-ivf-guide$/, '')
      if (!countryMap.has(country)) {
        countryMap.set(country, {
          slug: country,
          name: slugToLabel(country),
          clinicCount: 0,
          cities: new Map(),
        })
      }
      const c = countryMap.get(country)!
      if (!c.cities.has(city)) {
        c.cities.set(city, { slug: city, name: slugToLabel(city), clinicCount: 0 })
      }
    }
  }

  if (treatmentSet.size === 0 && countryMap.size > 0) {
    treatmentSet.set('ivf', {
      slug: 'ivf',
      code: 'IVF',
      name: 'IVF & Fertility',
      clinicCount: [...countryMap.values()].reduce((s, c) => s + c.clinicCount, 0),
      countries: new Set(countryMap.keys()),
    })
  }

  const countries = [...countryMap.values()]
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      flagEmoji: flagEmojiForCountry({ slug: c.slug }),
      clinicCount: c.clinicCount,
      cities: [...c.cities.values()].sort((a, b) => b.clinicCount - a.clinicCount || a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => b.clinicCount - a.clinicCount || a.name.localeCompare(b.name))

  const treatments = [...treatmentSet.values()].map((t) => ({
    slug: t.slug,
    code: t.code,
    name: t.name,
    clinicCount: t.clinicCount,
    countries: [...t.countries],
  }))

  return { countries, treatments, updatedAt: new Date().toISOString() }
}

export function listClinicPdpsFromPages(
  pages: ContentListItem[],
  filters: { country?: string; city?: string; treatment?: string },
): ClinicCard[] {
  const items: ClinicCard[] = []

  for (const page of pages) {
    const slug = page.slug.replace(/^\//, '')
    const match = slug.match(/^clinics\/([^/]+)\/([^/]+)\/([^/]+)$/)
    if (!match) continue

    const [, country, city, clinicSlug] = match
    if (filters.country && country !== filters.country) continue
    if (filters.city && city !== filters.city) continue

    items.push({
      slug: clinicSlug,
      name: slugToLabel(clinicSlug),
      urlPath: clinicPdpPath(country, city, clinicSlug),
      city: { slug: city, name: slugToLabel(city) },
      country: { slug: country, name: slugToLabel(country) },
      treatments: filters.treatment
        ? [{ code: filters.treatment.toUpperCase(), name: slugToLabel(filters.treatment), slug: filters.treatment }]
        : [{ code: 'IVF', name: 'IVF', slug: 'ivf' }],
    })
  }

  return items.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
}

export async function enrichClinicFromPage(card: ClinicCard): Promise<ClinicCard> {
  const result = await loadPublishedPage(card.urlPath.replace(/\/$/, ''))
  if (result.status !== 'ok') return card

  const page = result.page
  const title = page.seo.title ?? page.seo.metaTitle ?? card.name

  let googleRating: number | null = null
  let googleReviewCount: number | null = null
  const ratingMatch = page.htmlContent?.match(/(\d+\.?\d*)\s*\/\s*5.*?(\d+)\s*Google reviews/i)
  if (ratingMatch) {
    googleRating = parseFloat(ratingMatch[1])
    googleReviewCount = parseInt(ratingMatch[2], 10)
  }

  const photoMatch = page.htmlContent?.match(/<img[^>]+src="([^"]+)"[^>]*alt="[^"]*clinic/i)
    ?? page.heroImage?.url

  return {
    ...card,
    name: title.replace(/\s*—.*$/, '').trim() || card.name,
    photoUrl: typeof photoMatch === 'string' ? photoMatch : page.heroImage?.url ?? null,
    googleRating,
    googleReviewCount,
    editorialSummary: page.seo.metaDescription ?? card.editorialSummary,
  }
}

export async function buildClinicListFromPages(
  pages: ContentListItem[],
  filters: { country?: string; city?: string; treatment?: string; page?: number; limit?: number },
): Promise<ClinicListResponse> {
  const pageNum = filters.page ?? 1
  const limit = filters.limit ?? 24
  let items = listClinicPdpsFromPages(pages, filters)

  const enriched = await Promise.all(
    items.slice((pageNum - 1) * limit, pageNum * limit).map((c) => enrichClinicFromPage(c)),
  )

  return {
    items: enriched,
    total: items.length,
    page: pageNum,
    limit,
  }
}

export async function getClinicDetailFromPage(
  country: string,
  city: string,
  slug: string,
): Promise<ClinicDetail | null> {
  const urlPath = clinicPdpPath(country, city, slug)
  const result = await loadPublishedPage(urlPath.replace(/\/$/, ''))
  if (result.status !== 'ok') return null

  const page = result.page
  const base = await enrichClinicFromPage({
    slug,
    name: page.seo.title ?? slugToLabel(slug),
    urlPath,
    country: { slug: country, name: slugToLabel(country) },
    city: { slug: city, name: slugToLabel(city) },
    treatments: [],
  })

  return {
    ...base,
    longDescription: page.seo.metaDescription ?? null,
    media: page.heroImage?.url
      ? [{ url: page.heroImage.url, kind: 'PHOTO' as const, isPrimary: true }]
      : [],
    pricingPackages: [],
    doctors: [],
    googleReviews: [],
    accreditations: [],
    interviews: [],
    publishedAt: page.publishedAt,
    updatedAt: page.updatedAt,
  }
}

export function buildEmptyCosts(treatmentSlug: string): CostsResponse {
  return {
    treatment: { slug: treatmentSlug, name: slugToLabel(treatmentSlug) },
    overall: null,
    byCountry: [],
    byCity: [],
    topClinics: [],
  }
}

function avgRatingFromClinics(clinics: ClinicCard[]): number | null {
  const rated = clinics.filter((c) => c.googleRating != null)
  if (rated.length === 0) return null
  const sum = rated.reduce((s, c) => s + (c.googleRating ?? 0), 0)
  return sum / rated.length
}

function truthScoreAvgFromClinics(clinics: ClinicCard[]): number | null {
  const scored = clinics.filter((c) => c.truthScore?.composite != null)
  if (scored.length === 0) return null
  const sum = scored.reduce((s, c) => s + (c.truthScore?.composite ?? 0), 0)
  return sum / scored.length
}

function topClinicsFromList(clinics: ClinicCard[], limit = 3): ClinicCard[] {
  return [...clinics]
    .sort((a, b) => {
      const scoreA = (a.truthScore?.composite ?? 0) * 10 + (a.googleRating ?? 0)
      const scoreB = (b.truthScore?.composite ?? 0) * 10 + (b.googleRating ?? 0)
      return scoreB - scoreA
    })
    .slice(0, limit)
}

function clinicToCompareEntity(clinic: ClinicDetail | ClinicCard): CompareResponse['entityA'] {
  return {
    name: clinic.name,
    slug: clinic.slug,
    clinicCount: 1,
    avgRating: clinic.googleRating ?? null,
    priceRange: clinic.priceRange ?? undefined,
    truthScoreAvg: clinic.truthScore?.composite ?? null,
    topClinics: [clinic],
  }
}

function listToCompareEntity(
  slug: string,
  name: string,
  clinics: ClinicCard[],
  priceRange?: { min: number; max: number; currency: string } | null,
): CompareResponse['entityA'] {
  return {
    name,
    slug,
    clinicCount: clinics.length,
    avgRating: avgRatingFromClinics(clinics),
    priceRange: priceRange ?? undefined,
    truthScoreAvg: truthScoreAvgFromClinics(clinics),
    topClinics: topClinicsFromList(clinics),
  }
}

function findCountryForCity(taxonomy: Taxonomy, citySlug: string): string | undefined {
  for (const country of taxonomy.countries) {
    if (country.cities.some((c) => c.slug === citySlug)) {
      return country.slug
    }
  }
  return undefined
}

export function buildCompareFromTaxonomy(
  type: 'clinic' | 'city' | 'country',
  a: string,
  b: string,
  treatment: string | undefined,
  taxonomy: Taxonomy,
  options: {
    clinicsA: ClinicCard[]
    clinicsB: ClinicCard[]
    costsA?: CostsResponse | null
    costsB?: CostsResponse | null
    clinicA?: ClinicDetail | ClinicCard | null
    clinicB?: ClinicDetail | ClinicCard | null
  },
): CompareResponse | null {
  if (type === 'clinic') {
    if (!options.clinicA || !options.clinicB) return null
    return {
      type: 'clinic',
      entityA: clinicToCompareEntity(options.clinicA),
      entityB: clinicToCompareEntity(options.clinicB),
    }
  }

  if (!treatment) return null

  const treatmentData = taxonomy.treatments.find(
    (t) => t.slug === treatment || t.slug.replace(/_/g, '-') === treatment,
  )
  const treatmentRef = {
    slug: treatment,
    name: treatmentData?.name ?? slugToLabel(treatment),
  }

  if (type === 'country') {
    const countryA = taxonomy.countries.find((c) => c.slug === a)
    const countryB = taxonomy.countries.find((c) => c.slug === b)
    if (!countryA || !countryB) return null

    const priceA = options.costsA?.byCountry.find((r) => r.country.slug === a)
    const priceB = options.costsB?.byCountry.find((r) => r.country.slug === b)

    return {
      type: 'country',
      treatment: treatmentRef,
      entityA: listToCompareEntity(
        a,
        countryA.name,
        options.clinicsA,
        priceA ? { min: priceA.min, max: priceA.max, currency: priceA.currency } : null,
      ),
      entityB: listToCompareEntity(
        b,
        countryB.name,
        options.clinicsB,
        priceB ? { min: priceB.min, max: priceB.max, currency: priceB.currency } : null,
      ),
    }
  }

  const cityA = taxonomy.countries
    .flatMap((c) => c.cities.map((city) => ({ ...city, countrySlug: c.slug })))
    .find((c) => c.slug === a)
  const cityB = taxonomy.countries
    .flatMap((c) => c.cities.map((city) => ({ ...city, countrySlug: c.slug })))
    .find((c) => c.slug === b)
  if (!cityA || !cityB) return null

  const priceA = options.costsA?.byCity.find((r) => r.city.slug === a)
  const priceB = options.costsB?.byCity.find((r) => r.city.slug === b)

  return {
    type: 'city',
    treatment: treatmentRef,
    entityA: listToCompareEntity(
      a,
      cityA.name,
      options.clinicsA,
      priceA ? { min: priceA.min, max: priceA.max, currency: priceA.currency } : null,
    ),
    entityB: listToCompareEntity(
      b,
      cityB.name,
      options.clinicsB,
      priceB ? { min: priceB.min, max: priceB.max, currency: priceB.currency } : null,
    ),
  }
}

export function countrySlugForCity(taxonomy: Taxonomy, citySlug: string): string | undefined {
  return findCountryForCity(taxonomy, citySlug)
}
