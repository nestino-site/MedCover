import type { ClinicCard, ContentListItem, Taxonomy } from '@/lib/api/types'
import { canonicalTreatmentSlug } from '@/lib/content/treatment-slugs'
import {
  canonicalPair,
  compareCityPath,
  compareClinicPath,
  compareCountryPath,
  type CompareType,
} from '@/lib/routes'
import type { Locale } from '@/lib/i18n'

export interface CompareHubItem {
  slug: string
  href: string
  type: CompareType
  treatmentKey?: string
  entityA: string
  entityB: string
}

export function buildCompareSlugsFromTaxonomy(taxonomy: Taxonomy): string[] {
  const slugs = new Set<string>()

  for (const treatment of taxonomy.treatments) {
    const treatmentSlug = canonicalTreatmentSlug(treatment.slug)
    const activeCountries = treatment.countries
      .map((slug) => taxonomy.countries.find((c) => c.slug === slug))
      .filter((c): c is NonNullable<typeof c> => Boolean(c && c.clinicCount > 0))

    for (let i = 0; i < activeCountries.length; i++) {
      for (let j = i + 1; j < activeCountries.length; j++) {
        const [a, b] = canonicalPair(activeCountries[i].slug, activeCountries[j].slug)
        slugs.add(`${a}-vs-${b}-for-${treatmentSlug}`)
      }
    }

    for (const countrySlug of treatment.countries) {
      const country = taxonomy.countries.find((c) => c.slug === countrySlug)
      if (!country) continue
      const cities = country.cities.filter((c) => c.clinicCount > 0)
      for (let i = 0; i < cities.length; i++) {
        for (let j = i + 1; j < cities.length; j++) {
          const [a, b] = canonicalPair(cities[i].slug, cities[j].slug)
          slugs.add(`${a}-vs-${b}-for-${treatmentSlug}`)
        }
      }
    }
  }

  return [...slugs]
}

function clinicSortScore(clinic: ClinicCard): number {
  const truth = clinic.truthScore?.composite ?? 0
  const rating = clinic.googleRating ?? 0
  return truth * 10 + rating
}

export function buildClinicCompareSlugsFromClinics(clinics: ClinicCard[]): string[] {
  const slugs = new Set<string>()
  const byCity = new Map<string, ClinicCard[]>()

  for (const clinic of clinics) {
    if (!clinic.country?.slug || !clinic.city?.slug) continue
    const key = `${clinic.country.slug}/${clinic.city.slug}`
    if (!byCity.has(key)) byCity.set(key, [])
    byCity.get(key)!.push(clinic)
  }

  for (const cityClinics of byCity.values()) {
    const top = [...cityClinics]
      .sort((a, b) => clinicSortScore(b) - clinicSortScore(a))
      .slice(0, 3)

    for (let i = 0; i < top.length; i++) {
      for (let j = i + 1; j < top.length; j++) {
        const [a, b] = canonicalPair(top[i].slug, top[j].slug)
        slugs.add(`${a}-vs-${b}`)
      }
    }
  }

  return [...slugs]
}

export function buildCompareHubItems(
  taxonomy: Taxonomy,
  locale: Locale,
  clinics: ClinicCard[] = [],
): CompareHubItem[] {
  const items: CompareHubItem[] = []
  const seen = new Set<string>()

  const add = (item: CompareHubItem) => {
    if (seen.has(item.slug)) return
    seen.add(item.slug)
    items.push(item)
  }

  for (const treatment of taxonomy.treatments) {
    const treatmentSlug = canonicalTreatmentSlug(treatment.slug)
    const activeCountries = treatment.countries
      .map((slug) => taxonomy.countries.find((c) => c.slug === slug))
      .filter((c): c is NonNullable<typeof c> => Boolean(c && c.clinicCount > 0))

    for (let i = 0; i < activeCountries.length; i++) {
      for (let j = i + 1; j < activeCountries.length; j++) {
        const [a, b] = canonicalPair(activeCountries[i].slug, activeCountries[j].slug)
        add({
          slug: `${a}-vs-${b}-for-${treatmentSlug}`,
          href: compareCountryPath(a, b, treatmentSlug, locale),
          type: 'country',
          treatmentKey: treatmentSlug,
          entityA: a,
          entityB: b,
        })
      }
    }

    for (const countrySlug of treatment.countries) {
      const country = taxonomy.countries.find((c) => c.slug === countrySlug)
      if (!country) continue
      const cities = country.cities.filter((c) => c.clinicCount > 0)
      for (let i = 0; i < cities.length; i++) {
        for (let j = i + 1; j < cities.length; j++) {
          const [a, b] = canonicalPair(cities[i].slug, cities[j].slug)
          add({
            slug: `${a}-vs-${b}-for-${treatmentSlug}`,
            href: compareCityPath(a, b, treatmentSlug, locale),
            type: 'city',
            treatmentKey: treatmentSlug,
            entityA: a,
            entityB: b,
          })
        }
      }
    }
  }

  for (const slug of buildClinicCompareSlugsFromClinics(clinics)) {
    const vsMatch = slug.match(/^(.+)-vs-(.+)$/)
    if (!vsMatch) continue
    const [, a, b] = vsMatch
    add({
      slug,
      href: compareClinicPath(a, b, locale),
      type: 'clinic',
      entityA: a,
      entityB: b,
    })
  }

  return items
}

export function mergeCompareStaticParams(
  taxonomy: Taxonomy,
  pages: ContentListItem[],
  clinicSlugs: string[],
): { slug: string }[] {
  const seen = new Set<string>()
  const params: { slug: string }[] = []

  const add = (slug: string) => {
    if (!slug || seen.has(slug)) return
    seen.add(slug)
    params.push({ slug })
  }

  for (const slug of buildCompareSlugsFromTaxonomy(taxonomy)) {
    add(slug)
  }
  for (const slug of clinicSlugs) {
    add(slug)
  }
  for (const page of pages) {
    if (!page.slug.includes('/compare/')) continue
    const slug = page.slug.replace(/^\/?compare\//, '').replace(/\/$/, '')
    add(slug)
  }

  return params
}

export function generateCompareStaticParams(
  taxonomy: Taxonomy,
  pages: ContentListItem[],
  clinics: ClinicCard[] = [],
): { slug: string }[] {
  const clinicSlugs = buildClinicCompareSlugsFromClinics(clinics)
  const params = mergeCompareStaticParams(taxonomy, pages, clinicSlugs)
  return params.length > 0 ? params : [{ slug: 'greece-vs-spain-for-ivf' }]
}

export function compareSlugType(slug: string, taxonomy: Taxonomy): CompareType {
  const forMatch = slug.match(/^(.+)-vs-(.+)-for-(.+)$/)
  if (!forMatch) return 'clinic'
  const [, rawA, rawB] = forMatch
  const countries = new Set(taxonomy.countries.map((c) => c.slug))
  if (countries.has(rawA) && countries.has(rawB)) return 'country'
  return 'city'
}
