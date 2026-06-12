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
import type { Locale } from '@/lib/i18n'

export interface PageEntities {
  country?: string
  city?: string
  treatment?: string
}

export type RelationSource = 'entities' | 'slug'

export interface PageRelations extends PageEntities {
  /** Where the relations came from: structured backend tags or slug heuristics. */
  source: RelationSource
}

function entitiesTagIsValid(entities: ApiPageEntities, taxonomy?: Taxonomy): boolean {
  if (!taxonomy) return true
  if (entities.country) {
    const country = taxonomy.countries.find((c) => c.slug === entities.country?.slug)
    if (!country) return false
    if (entities.city && !country.cities.some((c) => c.slug === entities.city?.slug)) {
      return false
    }
  } else if (entities.city) {
    // City without a country is not a valid tag combination.
    return false
  }
  if (
    entities.treatment &&
    !taxonomy.treatments.some((t) => t.slug === entities.treatment?.slug)
  ) {
    return false
  }
  return true
}

/**
 * Resolve a page's entity relations: prefer the structured `entities` tag from
 * the backend (v2.2 — see Docs/GUIDE_LANDING_RELATIONS.md), validated against
 * taxonomy; otherwise fall back to the slug-pattern inference that powered the
 * site before tags existed. Untagged content behaves exactly as before.
 */
export function resolvePageRelations(
  input: { slug: string; entities?: ApiPageEntities | null },
  taxonomy?: Taxonomy,
): PageRelations {
  const tagged = input.entities
  if (tagged && (tagged.country || tagged.city || tagged.treatment)) {
    if (entitiesTagIsValid(tagged, taxonomy)) {
      return {
        source: 'entities',
        country: tagged.country?.slug,
        city: tagged.city?.slug,
        treatment: tagged.treatment?.slug,
      }
    }
    console.warn(
      `[link-graph] invalid entities tag on ${input.slug}; falling back to slug inference`,
    )
  }
  return { source: 'slug', ...parseEntitiesFromSlug(input.slug) }
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

export function buildRelatedLandingsForEntities(
  entities: PageEntities,
  taxonomy: Taxonomy,
  locale: Locale,
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
      items.push({
        title: `${country.name} IVF guide`,
        href: guidePath(`${country.slug}-ivf-guide`, locale),
        badge: 'Guide',
      })
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

function guideTitleForPage(
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
  const last = page.slug.replace(/\/$/, '').split('/').pop() ?? 'guide'
  return slugToLabel(last.replace(/-ivf-guide$/, ''))
}

export function findRelatedGuides(
  entities: PageEntities,
  pages: ContentListItem[],
  locale: Locale,
  options?: { excludeSlug?: string; taxonomy?: Taxonomy },
): RelatedLanding[] {
  const exclude = options?.excludeSlug?.replace(/^\//, '').replace(/\/$/, '')
  return pages
    .filter(isGuidePage)
    .filter((p) => p.slug.replace(/^\//, '').replace(/\/$/, '') !== exclude)
    .map((p) => ({
      page: p,
      relations: resolvePageRelations(p, options?.taxonomy),
    }))
    .filter(({ relations }) => {
      if (entities.city && relations.city === entities.city) return true
      if (entities.country && relations.country === entities.country) return true
      return false
    })
    .slice(0, 6)
    .map(({ page, relations }) => ({
      title: guideTitleForPage(page, relations, options?.taxonomy),
      href: guidePath(page.slug, locale),
      badge: 'Guide',
    }))
}

/**
 * Reverse direction of the link graph: for a guide article, return the landing
 * pages a reader would plan a trip with (clinics, costs, country overview) plus
 * sibling guides. Relations resolve tags-first with slug fallback.
 */
export function getRelatedForGuide(
  input: { slug: string; entities?: ApiPageEntities | null },
  pages: ContentListItem[],
  taxonomy: Taxonomy,
  locale: Locale,
): { landings: RelatedLanding[]; guides: RelatedLanding[] } {
  const relations = resolvePageRelations(input, taxonomy)
  const treatment = relations.treatment ?? 'ivf'
  const landings: RelatedLanding[] = []

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
