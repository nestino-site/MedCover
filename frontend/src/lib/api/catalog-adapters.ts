import 'server-only'
import type { ContentListItem } from './types'
import type { ClinicCard, ClinicDetail, ClinicListResponse, CostsResponse, Taxonomy } from './types'
import { clinicPdpPath, slugToLabel } from '@/lib/routes'
import { loadPublishedPage } from './content'

function flagFromIso2(codeIso2?: string): string | undefined {
  if (!codeIso2 || codeIso2.length !== 2) return undefined
  const upper = codeIso2.toUpperCase()
  const base = 0x1f1e6
  const a = upper.charCodeAt(0) - 65
  const b = upper.charCodeAt(1) - 65
  if (a < 0 || a > 25 || b < 0 || b > 25) return undefined
  return String.fromCodePoint(base + a, base + b)
}

function flagFor(countrySlug: string, codeIso2?: string): string {
  return flagFromIso2(codeIso2) ?? '🌍'
}

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
      flagEmoji: flagFor(c.slug),
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
