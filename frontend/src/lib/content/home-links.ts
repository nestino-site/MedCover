import {
  getCitiesForCountry,
  getCountryDisplayFromTaxonomy,
  getCountryLandingPath,
} from '@/lib/content/hubs'
import type { Taxonomy } from '@/lib/api/types'
import { localizedPath, type Locale } from '@/lib/i18n'
import {
  clinicCountryPath,
  costHubPath,
  compareHubPath,
  guidesHubPath,
  startPath,
  treatmentsHubPath,
  countriesHubPath,
} from '@/lib/routes'

export interface HomeCityLink {
  name: string
  href: string
}

export interface HomeCountryLink {
  key: string
  slug: string
  name: string
  flag: string
  cost: string
  tagline: string
  clinics: string
  landingHref: string
  guideHref: string
  citiesIndexHref: string
  cities: HomeCityLink[]
  costNumeric: number
}

export interface HomeLinkGraph {
  hubs: {
    treatments: string
    countries: string
    costs: string
    compare: string
    guides: string
    start: string
  }
  countries: HomeCountryLink[]
}

function parseCostNumeric(cost: string): number {
  const n = parseInt(cost.replace(/[^0-9]/g, ''))
  return isNaN(n) ? 99999 : n
}

export function buildHomeLinkGraph(taxonomy: Taxonomy, locale: Locale): HomeLinkGraph {
  const countries = taxonomy.countries
    .map((country) => {
      const display = getCountryDisplayFromTaxonomy(country.slug, taxonomy, locale)
      const cityDisplays = getCitiesForCountry(country.slug, [], locale, taxonomy)

      return {
        key: country.slug,
        slug: display.slug,
        name: display.name,
        flag: display.flag,
        cost: display.cost,
        tagline: display.tagline,
        clinics: display.clinics,
        landingHref: getCountryLandingPath(country.slug, locale),
        guideHref: display.guideHref,
        citiesIndexHref: clinicCountryPath(country.slug, locale),
        cities: cityDisplays.map((c) => ({ name: c.cityName, href: c.href })),
        costNumeric: parseCostNumeric(display.cost),
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  return {
    hubs: {
      treatments: treatmentsHubPath(locale),
      countries: countriesHubPath(locale),
      costs: costHubPath(locale),
      compare: compareHubPath(locale),
      guides: guidesHubPath(locale),
      start: startPath(locale),
    },
    countries,
  }
}
