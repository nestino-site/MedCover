import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { isTrafficEngineUnreachable, trafficEngineFetch } from './client'
import { listPublishedPages, listPublishedPagesSafe } from './content'
import {
  TaxonomySchema,
  ClinicListResponseSchema,
  ClinicDetailSchema,
  CostsResponseSchema,
  CompareResponseSchema,
  SearchResponseSchema,
  type Taxonomy,
  type ClinicListResponse,
  type ClinicDetail,
  type ClinicCard,
  type CostsResponse,
  type CompareResponse,
  type SearchResponse,
} from './types'
import { cacheTags } from '../cache/tags'
import {
  buildTaxonomyFromPages,
  buildClinicListFromPages,
  getClinicDetailFromPage,
  buildEmptyCosts,
} from './catalog-adapters'

const SITE_ID = process.env.SITE_ID ?? ''

async function fetchJson<T>(
  path: string,
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T } },
): Promise<T | null> {
  try {
    const res = await trafficEngineFetch(path)
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) return null
    const json = await res.json()
    const parsed = schema.safeParse(json)
    return parsed.success ? parsed.data! : null
  } catch (error) {
    if (isTrafficEngineUnreachable(error)) return null
    return null
  }
}

export async function getTaxonomy(): Promise<Taxonomy> {
  'use cache'
  cacheLife('max')
  cacheTag(cacheTags.taxonomy, cacheTags.site(SITE_ID))

  const api = await fetchJson('/content/taxonomy', TaxonomySchema)
  if (api) return api

  const pages = await listPublishedPagesSafe()
  return buildTaxonomyFromPages(pages)
}

export interface ListClinicsParams {
  country?: string
  city?: string
  treatment?: string
  sort?: 'rating' | 'name' | 'truth_score' | 'price_asc' | 'price_desc'
  minRating?: number
  minTruthScore?: number
  page?: number
  limit?: number
}

export async function listClinics(params: ListClinicsParams = {}): Promise<ClinicListResponse> {
  'use cache'
  const scope = [params.country, params.city, params.treatment].filter(Boolean).join('-') || 'all'
  cacheLife('max')
  cacheTag(cacheTags.clinics(scope), cacheTags.site(SITE_ID))

  const qs = new URLSearchParams()
  if (params.country) qs.set('country', params.country)
  if (params.city) qs.set('city', params.city)
  if (params.treatment) qs.set('treatment', params.treatment)
  if (params.sort) qs.set('sort', params.sort)
  if (params.minRating != null) qs.set('minRating', String(params.minRating))
  if (params.minTruthScore != null) qs.set('minTruthScore', String(params.minTruthScore))
  if (params.page) qs.set('page', String(params.page))
  if (params.limit) qs.set('limit', String(params.limit))

  const query = qs.toString()
  const api = await fetchJson(
    `/content/clinics${query ? `?${query}` : ''}`,
    ClinicListResponseSchema,
  )
  if (api) return api

  const pages = await listPublishedPagesSafe()
  return buildClinicListFromPages(pages, params)
}

export async function getClinic(
  country: string,
  city: string,
  slug: string,
): Promise<ClinicDetail | null> {
  'use cache'
  cacheLife('max')
  cacheTag(cacheTags.clinics(`${country}-${city}-${slug}`), cacheTags.site(SITE_ID))

  const api = await fetchJson(
    `/content/clinics/${country}/${city}/${slug}`,
    ClinicDetailSchema,
  )
  if (api) return api

  return getClinicDetailFromPage(country, city, slug)
}

export async function getCosts(
  treatment: string,
  scope?: { country?: string; city?: string },
): Promise<CostsResponse> {
  'use cache'
  cacheLife('max')
  cacheTag(cacheTags.costs(treatment), cacheTags.site(SITE_ID))

  const qs = new URLSearchParams()
  if (scope?.country) qs.set('country', scope.country)
  if (scope?.city) qs.set('city', scope.city)
  const query = qs.toString()

  const api = await fetchJson(
    `/content/costs/${treatment}${query ? `?${query}` : ''}`,
    CostsResponseSchema,
  )
  if (api) return api

  return buildEmptyCosts(treatment)
}

export async function getCompare(
  type: 'clinic' | 'city' | 'country',
  a: string,
  b: string,
  treatment?: string,
): Promise<CompareResponse | null> {
  'use cache'
  const key = `${type}-${a}-${b}-${treatment ?? ''}`
  cacheLife('max')
  cacheTag(cacheTags.compare(key), cacheTags.site(SITE_ID))

  const qs = new URLSearchParams({ type, a, b })
  if (treatment) qs.set('treatment', treatment)

  return fetchJson(`/content/compare?${qs}`, CompareResponseSchema)
}

export async function searchContent(q: string, limit = 10): Promise<SearchResponse> {
  'use cache'
  cacheLife({ stale: 60 })
  cacheTag(cacheTags.search, cacheTags.site(SITE_ID))

  const api = await fetchJson(
    `/content/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    SearchResponseSchema,
  )
  if (api) return api

  const pages = await listPublishedPagesSafe()
  const taxonomy = buildTaxonomyFromPages(pages)
  const lower = q.toLowerCase()

  const countries = taxonomy.countries
    .filter((c) => c.name.toLowerCase().includes(lower) || c.slug.includes(lower))
    .slice(0, limit)
    .map((c) => ({ slug: c.slug, name: c.name, clinicCount: c.clinicCount }))

  const cities = taxonomy.countries
    .flatMap((c) => c.cities.map((city) => ({ ...city, country: c.slug })))
    .filter((c) => c.name.toLowerCase().includes(lower) || c.slug.includes(lower))
    .slice(0, limit)

  const treatments = taxonomy.treatments
    .filter((t) => t.name.toLowerCase().includes(lower) || t.slug.includes(lower))
    .slice(0, limit)
    .map((t) => ({ slug: t.slug, name: t.name, clinicCount: t.clinicCount }))

  const guides = pages
    .filter((p) => p.slug.includes('/guides/') && p.slug.toLowerCase().includes(lower))
    .slice(0, limit)
    .map((p) => ({
      slug: p.slug.startsWith('/') ? p.slug : `/${p.slug}`,
      title: p.slug.split('/').pop()?.replace(/-ivf-guide$/, '').split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') ?? p.slug,
      description: '',
    }))

  const clinicList = await buildClinicListFromPages(pages, { limit: 50 })
  const clinics = clinicList.items
    .filter((c) => c.name.toLowerCase().includes(lower))
    .slice(0, limit)

  return { clinics, treatments, countries, cities, guides }
}

export async function getSearchSuggestions(): Promise<{
  countries: { slug: string; name: string; clinicCount: number }[]
  treatments: { slug: string; name: string; clinicCount: number }[]
}> {
  const taxonomy = await getTaxonomy()
  return {
    countries: taxonomy.countries
      .filter((c) => c.clinicCount > 0)
      .sort((a, b) => b.clinicCount - a.clinicCount)
      .slice(0, 6)
      .map((c) => ({ slug: c.slug, name: c.name, clinicCount: c.clinicCount })),
    treatments: taxonomy.treatments
      .sort((a, b) => b.clinicCount - a.clinicCount)
      .slice(0, 6)
      .map((t) => ({ slug: t.slug, name: t.name, clinicCount: t.clinicCount })),
  }
}

export function treatmentSlugSet(taxonomy: Taxonomy): Set<string> {
  return new Set(taxonomy.treatments.map((t) => t.slug))
}

/** Paginate through all published clinics (for sitemap, link graphs). */
export async function listAllClinics(): Promise<ClinicCard[]> {
  const all: ClinicCard[] = []
  const limit = 48
  let page = 1
  let total = Infinity

  while (all.length < total) {
    const res = await listClinics({ page, limit, sort: 'name' })
    total = res.total
    if (res.items.length === 0) break
    all.push(...res.items)
    page++
    if (page > 100) break
  }

  return all
}
