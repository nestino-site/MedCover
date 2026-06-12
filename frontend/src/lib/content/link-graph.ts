import type { ContentListItem } from '@/lib/api/types'
import type { PageEntities as ApiPageEntities, Taxonomy } from '@/lib/api/types'
import type { RelatedLanding } from '@/components/shared/RelatedLandingsGrid'
import {
  clinicCountryPath,
  clinicCityPath,
  clinicCountryTreatmentPath,
  compareCountryPath,
  costCountryPath,
  costCityPath,
  costTreatmentPath,
  countryLandingPath,
  guidePath,
  slugToLabel,
  treatmentPath,
} from '@/lib/routes'
import { parseCitySlug, getCountryKeyFromSlug, isCountryGuideSlug } from './hubs'
import { localizedPath, type Locale } from '@/lib/i18n'

export interface PageEntities {
  country?: string
  city?: string
  treatment?: string
}

export interface ClinicEntityRef {
  slug: string
  name: string
  urlPath: string
}

export type RelationSource = 'entities' | 'slug'

export interface PageRelations extends PageEntities {
  /** Where the relations came from: structured backend tags or slug heuristics. */
  source: RelationSource
  pageType?: string
  clinics?: ClinicEntityRef[]
}

type EntityRef = { slug: string; name: string }

function validateEntity(
  ref: EntityRef | undefined,
  allowed: Map<string, EntityRef>,
): EntityRef | undefined {
  if (!ref?.slug) return undefined
  return allowed.get(ref.slug)
}

function countryForCitySlug(citySlug: string, taxonomy?: Taxonomy): string | undefined {
  if (!taxonomy) return undefined
  for (const country of taxonomy.countries) {
    if (country.cities.some((c) => c.slug === citySlug)) {
      return country.slug
    }
  }
  return undefined
}

function buildTaxonomyMaps(taxonomy?: Taxonomy) {
  const countryMap = new Map<string, EntityRef>()
  const cityMap = new Map<string, EntityRef>()
  const treatmentMap = new Map<string, EntityRef>()

  if (taxonomy) {
    for (const c of taxonomy.countries) {
      countryMap.set(c.slug, { slug: c.slug, name: c.name })
      for (const city of c.cities) {
        cityMap.set(city.slug, { slug: city.slug, name: city.name })
      }
    }
    for (const t of taxonomy.treatments) {
      treatmentMap.set(t.slug, { slug: t.slug, name: t.name })
    }
  }

  return { countryMap, cityMap, treatmentMap }
}

/**
 * Resolve a page's entity relations: prefer the structured `entities` tag from
 * the backend (v2.2 — see Docs/GUIDE_LANDING_RELATIONS.md), validated against
 * taxonomy; otherwise fall back to the slug-pattern inference that powered the
 * site before tags existed. Untagged content behaves exactly as before.
 */
export function resolvePageRelations(
  input: { slug: string; pageType?: string; entities?: ApiPageEntities | null },
  taxonomy?: Taxonomy,
): PageRelations {
  const tagged = input.entities
  if (tagged && Object.keys(tagged).length > 0) {
    const { countryMap, cityMap, treatmentMap } = buildTaxonomyMaps(taxonomy)

    let country = validateEntity(tagged.country, countryMap)
    let city = validateEntity(tagged.city, cityMap)
    const treatment = validateEntity(tagged.treatment, treatmentMap)

    if (city && !country) {
      country = countryMap.get(countryForCitySlug(city.slug, taxonomy) ?? '') ?? country
    }

    if (country && city && taxonomy) {
      const countryData = taxonomy.countries.find((c) => c.slug === country!.slug)
      if (!countryData?.cities.some((c) => c.slug === city!.slug)) {
        city = undefined
      }
    }

    const clinics = tagged.clinics?.length ? tagged.clinics : undefined
    const hasValidTag = Boolean(country || city || treatment || (clinics?.length ?? 0) > 0)

    if (hasValidTag) {
      return {
        source: 'entities',
        pageType: input.pageType,
        country: country?.slug,
        city: city?.slug,
        treatment: treatment?.slug,
        clinics,
      }
    }

    if (tagged.country || tagged.city || tagged.treatment) {
      console.warn(
        `[link-graph] invalid entities tag on ${input.slug}; falling back to slug inference`,
      )
    }
  }

  return {
    source: 'slug',
    pageType: input.pageType,
    ...parseEntitiesFromSlug(input.slug),
  }
}

export function parseEntitiesFromSlug(slug: string): PageEntities {
  const s = slug.replace(/^\//, '')
  const entities: PageEntities = {}

  const clinicPdp = s.match(/^clinics\/([^/]+)\/([^/]+)\/([^/]+)$/)
  if (clinicPdp) {
    entities.country = clinicPdp[1]
    entities.city = clinicPdp[2]
    return entities
  }

  const clinicCity = s.match(/^clinics\/([^/]+)\/([^/]+)$/)
  if (clinicCity) {
    entities.country = clinicCity[1]
    entities.city = clinicCity[2]
    return entities
  }

  const clinicCountry = s.match(/^clinics\/([^/]+)$/)
  if (clinicCountry) {
    entities.country = clinicCountry[1]
    return entities
  }

  const costCity = s.match(/^cost\/([^/]+)\/([^/]+)\/([^/]+)$/)
  if (costCity) {
    entities.treatment = costCity[1]
    entities.country = costCity[2]
    entities.city = costCity[3]
    return entities
  }

  const costCountry = s.match(/^cost\/([^/]+)\/([^/]+)$/)
  if (costCountry) {
    entities.treatment = costCountry[1]
    entities.country = costCountry[2]
    return entities
  }

  const costTreatment = s.match(/^cost\/([^/]+)$/)
  if (costTreatment) {
    entities.treatment = costTreatment[1]
    return entities
  }

  if (isCountryGuideSlug(s)) {
    entities.country = getCountryKeyFromSlug(s) ?? undefined
    return entities
  }

  const cityGuide = parseCitySlug(s)
  if (cityGuide) {
    entities.country = cityGuide.countryKey
    entities.city = cityGuide.cityName.toLowerCase().replace(/\s+/g, '-')
  }

  return entities
}

function treatmentDisplayName(slug: string, taxonomy: Taxonomy): string {
  return taxonomy.treatments.find((t) => t.slug === slug)?.name ?? slugToLabel(slug)
}

function guideLinkForCountry(
  entities: PageEntities,
  taxonomy: Taxonomy,
  locale: Locale,
  pages?: ContentListItem[],
): RelatedLanding | null {
  if (!entities.country) return null
  const country = taxonomy.countries.find((c) => c.slug === entities.country)
  if (!country) return null

  const treatment = entities.treatment ?? 'ivf'
  const treatmentName = treatmentDisplayName(treatment, taxonomy)

  if (pages?.length) {
    const guides = findRelatedGuides(entities, pages, locale, { taxonomy })
    const match = guides[0]
    if (match) return match
  }

  return {
    title: `${country.name} ${treatmentName} guide`,
    href: guidePath(`${country.slug}-ivf-guide`, locale),
    badge: 'Guide',
  }
}

export function buildRelatedLandingsForEntities(
  entities: PageEntities,
  taxonomy: Taxonomy,
  locale: Locale,
  pages?: ContentListItem[],
): RelatedLanding[] {
  const items: RelatedLanding[] = []
  const treatment = entities.treatment ?? 'ivf'

  if (entities.country) {
    const country = taxonomy.countries.find((c) => c.slug === entities.country)
    if (country) {
      items.push({
        title: `Clinics in ${country.name}`,
        href: clinicCountryPath(country.slug, locale),
        badge: 'Clinics',
      })
      items.push({
        title: `${country.name} overview`,
        href: countryLandingPath(country.slug, locale),
        badge: 'Country',
      })
      items.push({
        title: `${treatment.toUpperCase()} cost in ${country.name}`,
        href: costCountryPath(treatment, country.slug, locale),
        badge: 'Cost',
      })
      const guideLink = guideLinkForCountry(entities, taxonomy, locale, pages)
      if (guideLink) items.push(guideLink)
    }
  }

  if (entities.country && entities.city) {
    const country = taxonomy.countries.find((c) => c.slug === entities.country)
    const city = country?.cities.find((c) => c.slug === entities.city)
    if (city) {
      items.push({
        title: `Clinics in ${city.name}`,
        href: clinicCityPath(entities.country, city.slug, locale),
        badge: 'City',
      })
    }
    items.push({
      title: `${treatment.toUpperCase()} in ${entities.country}`,
      href: clinicCountryTreatmentPath(entities.country, treatment, locale),
      badge: 'Treatment',
    })
  }

  if (entities.treatment && !entities.country) {
    const t = taxonomy.treatments.find((x) => x.slug === entities.treatment)
    if (t) {
      items.push({
        title: t.name,
        href: treatmentPath(t.slug, locale),
        badge: 'Treatment',
      })
      items.push({
        title: `${t.name} costs abroad`,
        href: costTreatmentPath(t.slug, locale),
        badge: 'Cost',
      })
    }
  }

  return items
}

function isGuidePage(page: ContentListItem): boolean {
  if (page.pageType) return page.pageType === 'guide'
  return /(^|\/)guides\//.test(page.slug)
}

export function guideTitleForPage(
  page: ContentListItem,
  relations: PageRelations,
  taxonomy?: Taxonomy,
): string {
  if (page.title) return page.title
  if (relations.country) {
    const country = taxonomy?.countries.find((c) => c.slug === relations.country)
    const city = relations.city
      ? country?.cities.find((c) => c.slug === relations.city)
      : undefined
    const place =
      city?.name ??
      (relations.city ? slugToLabel(relations.city) : undefined) ??
      country?.name ??
      slugToLabel(relations.country)
    const treatment = relations.treatment?.toUpperCase() ?? 'IVF'
    return `${place} ${treatment} guide`
  }
  if (relations.treatment && taxonomy) {
    const t = taxonomy.treatments.find((x) => x.slug === relations.treatment)
    if (t) return `${t.name} guide`
  }
  const last = page.slug.replace(/\/$/, '').split('/').pop() ?? 'guide'
  return slugToLabel(last.replace(/-ivf-guide$/, ''))
}

export function guideMatchesScope(
  relations: PageRelations,
  entities: PageEntities,
): boolean {
  const wantsTreatment = Boolean(entities.treatment)
  const treatmentMatch =
    !wantsTreatment || relations.treatment === entities.treatment

  if (entities.city) {
    return relations.city === entities.city && treatmentMatch
  }
  if (entities.country) {
    return relations.country === entities.country && treatmentMatch
  }
  if (entities.treatment) {
    return relations.treatment === entities.treatment
  }
  return false
}

export function findRelatedGuidePages(
  entities: PageEntities,
  pages: ContentListItem[],
  options?: { excludeSlug?: string; taxonomy?: Taxonomy; limit?: number },
): ContentListItem[] {
  const exclude = options?.excludeSlug?.replace(/^\//, '').replace(/\/$/, '')
  return pages
    .filter(isGuidePage)
    .filter((p) => p.slug.replace(/^\//, '').replace(/\/$/, '') !== exclude)
    .filter((p) =>
      guideMatchesScope(resolvePageRelations(p, options?.taxonomy), entities),
    )
    .slice(0, options?.limit ?? 6)
}

export function findRelatedGuides(
  entities: PageEntities,
  pages: ContentListItem[],
  locale: Locale,
  options?: { excludeSlug?: string; taxonomy?: Taxonomy },
): RelatedLanding[] {
  return findRelatedGuidePages(entities, pages, options).map((page) => {
    const relations = resolvePageRelations(page, options?.taxonomy)
    return {
      title: guideTitleForPage(page, relations, options?.taxonomy),
      href: guidePath(page.slug, locale),
      badge: 'Guide' as const,
    }
  })
}

/**
 * Reverse direction of the link graph: for a guide article, return the landing
 * pages a reader would plan a trip with (clinics, costs, country overview) plus
 * sibling guides. Relations resolve tags-first with slug fallback.
 */
export function getRelatedForGuide(
  input: { slug: string; pageType?: string; entities?: ApiPageEntities | null },
  pages: ContentListItem[],
  taxonomy: Taxonomy,
  locale: Locale,
): { landings: RelatedLanding[]; guides: RelatedLanding[] } {
  const relations = resolvePageRelations(input, taxonomy)
  const treatment = relations.treatment ?? 'ivf'
  const landings: RelatedLanding[] = []

  if (relations.clinics?.length) {
    for (const clinic of relations.clinics) {
      landings.push({
        title: clinic.name,
        href: localizedPath(clinic.urlPath, locale),
        badge: 'Clinic',
      })
    }
  }

  if (relations.country) {
    const country = taxonomy.countries.find((c) => c.slug === relations.country)
    const countryName = country?.name ?? slugToLabel(relations.country)
    const city = relations.city
      ? country?.cities.find((c) => c.slug === relations.city)
      : undefined

    if (city) {
      landings.push({
        title: `Clinics in ${city.name}`,
        href: clinicCityPath(relations.country, city.slug, locale),
        badge: 'Clinics',
      })
      landings.push({
        title: `${treatment.toUpperCase()} cost in ${city.name}`,
        href: costCityPath(treatment, relations.country, city.slug, locale),
        badge: 'Cost',
      })
    } else {
      landings.push({
        title: `Clinics in ${countryName}`,
        href: clinicCountryPath(relations.country, locale),
        badge: 'Clinics',
      })
      landings.push({
        title: `${treatment.toUpperCase()} cost in ${countryName}`,
        href: costCountryPath(treatment, relations.country, locale),
        badge: 'Cost',
      })
    }

    landings.push({
      title: `${countryName} overview`,
      href: countryLandingPath(relations.country, locale),
      badge: 'Country',
    })
  } else if (relations.treatment) {
    const t = taxonomy.treatments.find((x) => x.slug === relations.treatment)
    if (t) {
      landings.push({
        title: `${t.name} abroad`,
        href: treatmentPath(t.slug, locale),
        badge: 'Treatment',
      })
      landings.push({
        title: `${t.name} costs abroad`,
        href: costTreatmentPath(t.slug, locale),
        badge: 'Cost',
      })
    }
  }

  const guides = findRelatedGuides(relations, pages, locale, {
    excludeSlug: input.slug,
    taxonomy,
  }).slice(0, 3)

  return { landings, guides }
}

/** Dedupe related items by href and drop self-links to the current page. */
export function dedupeRelated(
  items: RelatedLanding[],
  excludeHref?: string,
): RelatedLanding[] {
  const normalize = (href: string) => href.replace(/\/+$/, '') || '/'
  const exclude = excludeHref ? normalize(excludeHref) : null
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = normalize(item.href)
    if (key === exclude || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function suggestCountryComparisons(
  taxonomy: Taxonomy,
  locale: Locale,
  treatment = 'ivf',
): RelatedLanding[] {
  const countries = taxonomy.countries.filter((c) => c.clinicCount > 0).slice(0, 4)
  const items: RelatedLanding[] = []
  for (let i = 0; i < countries.length - 1; i++) {
    const a = countries[i]
    const b = countries[i + 1]
    items.push({
      title: `${a.name} vs ${b.name} for ${treatment.toUpperCase()}`,
      href: compareCountryPath(a.slug, b.slug, treatment, locale),
      badge: 'Compare',
    })
  }
  return items
}

export type GuideScopeFilters = {
  country?: string
  city?: string
  treatment?: string
}

/** Load guide list items for a landing scope — filtered API first, full-list fallback. */
export async function loadGuidesForScope(
  scope: GuideScopeFilters,
  listPages: (filters?: GuideScopeFilters & { pageType?: string }) => Promise<ContentListItem[]>,
  allPages: ContentListItem[],
  locale: Locale,
  taxonomy: Taxonomy,
  options?: { excludeSlug?: string; limit?: number },
): Promise<RelatedLanding[]> {
  const filters = { pageType: 'guide' as const, ...scope }
  let pages = await listPages(filters)
  if (pages.length === 0) {
    pages = allPages
  }
  return findRelatedGuides(scope, pages, locale, {
    taxonomy,
    excludeSlug: options?.excludeSlug,
  }).slice(0, options?.limit ?? 6)
}
