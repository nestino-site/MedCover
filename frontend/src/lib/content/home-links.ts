import {
  countryMeta,
  getCitiesForCountry,
  getCountryLandingPath,
} from '@/lib/content/hubs'
import { localizedPath, type Locale } from '@/lib/i18n'

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
  treatment: { overview: string; costs: string; compare: string }
  countries: HomeCountryLink[]
}

function parseCostNumeric(cost: string): number {
  const n = parseInt(cost.replace(/[^0-9]/g, ''))
  return isNaN(n) ? 99999 : n
}

export function buildHomeLinkGraph(locale: Locale): HomeLinkGraph {
  const countries = Object.entries(countryMeta)
    .map(([slug, meta]) => {
      const key = slug.replace(/^guides\//, '').replace(/-ivf-guide$/, '')
      const cityDisplays = getCitiesForCountry(key, [], locale)

      return {
        key,
        slug,
        name: meta.name,
        flag: meta.flag,
        cost: meta.cost,
        tagline: meta.tagline,
        clinics: meta.clinics,
        landingHref: getCountryLandingPath(key, locale),
        guideHref: localizedPath(`/${slug}`, locale),
        citiesIndexHref: localizedPath(`/countries/${key}/cities`, locale),
        cities: cityDisplays.map((c) => ({ name: c.cityName, href: c.href })),
        costNumeric: parseCostNumeric(meta.cost),
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  return {
    treatment: {
      overview: localizedPath('/treatments/ivf', locale),
      costs: localizedPath('/treatments/ivf/costs', locale),
      compare: localizedPath('/compare', locale),
    },
    countries,
  }
}
