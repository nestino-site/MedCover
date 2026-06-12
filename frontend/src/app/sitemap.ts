import type { MetadataRoute } from 'next'
import { getTaxonomy, listAllClinics, treatmentSlugSet } from '@/lib/api/catalog'
import { listPublishedPages } from '@/lib/api/content'
import { filterSitemapPublishedPages } from '@/lib/content/slug-canonical'
import { filterPagesByLocale } from '@/lib/content/site-graph'
import { getSitemapHubs, hubPath } from '@/lib/content/site-nav'
import { treatmentsFromTaxonomy } from '@/lib/content/treatments'
import {
  clinicPdpSitemapEntries,
  clinicPdpSitemapEntriesFromPages,
  dedupeSitemapEntries,
  filterSitemapClinicPublishedPages,
} from '@/lib/clinics/sitemap'
import { LOCALES } from '@/lib/i18n/locales'
import { absoluteUrl, localizedPath } from '@/lib/i18n/paths'
import {
  clinicCityPath,
  clinicCountryPath,
  clinicCityTreatmentPath,
  clinicCountryTreatmentPath,
  clinicsHubPath,
  compareHubPath,
  costCityPath,
  costCountryPath,
  costHubPath,
  costTreatmentPath,
  countryLandingPath,
  treatmentPath,
} from '@/lib/routes'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let pages: Awaited<ReturnType<typeof listPublishedPages>> = []
  let taxonomy: Awaited<ReturnType<typeof getTaxonomy>> | null = null
  let allClinics: Awaited<ReturnType<typeof listAllClinics>> = []

  try {
    ;[pages, taxonomy, allClinics] = await Promise.all([
      listPublishedPages(),
      getTaxonomy(),
      listAllClinics(),
    ])
  } catch {
    return [{ url: SITE_URL, lastModified: new Date(), priority: 1.0 }]
  }

  const treatmentSlugs = treatmentSlugSet(taxonomy)
  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    entries.push({
      url: absoluteUrl(localizedPath('/', locale), SITE_URL),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    })

    for (const hub of getSitemapHubs()) {
      const hubPriority =
        hub.id === 'countries' ? 0.9
        : hub.id === 'treatments' ? 0.85
        : 0.8
      entries.push({
        url: absoluteUrl(hubPath(hub.id, locale), SITE_URL),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: hubPriority,
      })
    }

    entries.push({
      url: absoluteUrl(localizedPath('/about', locale), SITE_URL),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    })

    entries.push({
      url: absoluteUrl(clinicsHubPath(locale), SITE_URL),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    })

    entries.push({
      url: absoluteUrl(costHubPath(locale), SITE_URL),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    })

    entries.push({
      url: absoluteUrl(compareHubPath(locale), SITE_URL),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })

    for (const country of taxonomy.countries) {
      if (country.clinicCount === 0) continue

      entries.push({
        url: absoluteUrl(countryLandingPath(country.slug, locale), SITE_URL),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.85,
      })
      entries.push({
        url: absoluteUrl(clinicCountryPath(country.slug, locale), SITE_URL),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.85,
      })

      for (const city of country.cities) {
        if (city.clinicCount === 0) continue
        entries.push({
          url: absoluteUrl(clinicCityPath(country.slug, city.slug, locale), SITE_URL),
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.85,
        })
      }
    }

    for (const treatment of treatmentsFromTaxonomy(taxonomy)) {
      if (treatment.clinicCount === 0) continue

      entries.push({
        url: absoluteUrl(treatmentPath(treatment.id, locale), SITE_URL),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      })
      entries.push({
        url: absoluteUrl(costTreatmentPath(treatment.id, locale), SITE_URL),
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.85,
      })

      for (const countrySlug of treatment.countries) {
        entries.push({
          url: absoluteUrl(clinicCountryTreatmentPath(countrySlug, treatment.id, locale), SITE_URL),
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
        entries.push({
          url: absoluteUrl(costCountryPath(treatment.id, countrySlug, locale), SITE_URL),
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.8,
        })

        const country = taxonomy.countries.find((c) => c.slug === countrySlug)
        if (country) {
          for (const city of country.cities) {
            if (city.clinicCount === 0) continue
            entries.push({
              url: absoluteUrl(
                costCityPath(treatment.id, countrySlug, city.slug, locale),
                SITE_URL,
              ),
              lastModified: new Date(),
              changeFrequency: 'monthly',
              priority: 0.75,
            })
            entries.push({
              url: absoluteUrl(
                clinicCityTreatmentPath(countrySlug, city.slug, treatment.id, locale),
                SITE_URL,
              ),
              lastModified: new Date(),
              changeFrequency: 'weekly',
              priority: 0.8,
            })
          }
        }
      }
    }

    const localePagesRaw = filterPagesByLocale(pages, locale)
    const pdpEntries =
      allClinics.length > 0
        ? clinicPdpSitemapEntries(allClinics, locale, SITE_URL)
        : clinicPdpSitemapEntriesFromPages(localePagesRaw, locale, SITE_URL, treatmentSlugs)
    entries.push(...pdpEntries)

    const localePages = filterSitemapPublishedPages(
      filterSitemapClinicPublishedPages(localePagesRaw, treatmentSlugs),
    )
    for (const page of localePages) {
      const slugPath = page.slug.startsWith('/') ? page.slug : `/${page.slug}`
      const isCountryGuide = /^\/guides\/[^/]+-ivf-guide$/.test(slugPath)
      const isCityGuide = /^\/guides\/[^/]+\/.+-ivf-guide$/.test(slugPath)
      const isCostPage = slugPath.startsWith('/cost/')
      const isComparePage = slugPath.startsWith('/compare/')
      entries.push({
        url: absoluteUrl(localizedPath(slugPath, locale), SITE_URL),
        lastModified: new Date(page.updatedAt),
        changeFrequency: isCountryGuide ? 'weekly' : 'monthly',
        priority: isCostPage ? 0.8 : isComparePage ? 0.75 : isCountryGuide ? 0.85 : isCityGuide ? 0.75 : 0.8,
      })
    }
  }

  return dedupeSitemapEntries(entries)
}
