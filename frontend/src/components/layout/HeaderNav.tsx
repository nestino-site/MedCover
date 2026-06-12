import { getTaxonomy } from '@/lib/api/catalog'
import { listPublishedPagesSafe } from '@/lib/api/content'
import {
  getFeaturedCountriesFromTaxonomy,
  getFeaturedCitiesForNav,
  publishedCityGuideKeys,
} from '@/lib/content/hubs'
import { treatmentsForDisplay } from '@/lib/content/treatments'
import { type Dictionary, type Locale } from '@/lib/i18n'
import { MobileMenu } from './MobileMenu'
import { NavMegaMenu } from './NavMegaMenu'

type HeaderMenuProps = {
  locale: Locale
  t: Dictionary
}

async function loadNavPlaceData(locale: Locale) {
  const [taxonomy, pages] = await Promise.all([getTaxonomy(), listPublishedPagesSafe()])
  const publishedGuideKeys = publishedCityGuideKeys(pages, locale, taxonomy)

  return {
    featuredCountries: getFeaturedCountriesFromTaxonomy(taxonomy, locale),
    featuredCities: getFeaturedCitiesForNav(taxonomy, locale, 8, publishedGuideKeys),
    treatments: treatmentsForDisplay(taxonomy),
  }
}

export async function HeaderMegaMenu({ locale, t }: HeaderMenuProps) {
  const { featuredCountries, featuredCities, treatments } = await loadNavPlaceData(locale)

  return (
    <NavMegaMenu
      locale={locale}
      t={t}
      featuredCountries={featuredCountries}
      featuredCities={featuredCities}
      treatments={treatments}
    />
  )
}

export function HeaderMegaMenuFallback({ locale, t }: HeaderMenuProps) {
  return (
    <NavMegaMenu
      locale={locale}
      t={t}
      featuredCountries={[]}
      featuredCities={[]}
      treatments={[]}
    />
  )
}

export async function HeaderMobileMenu({ locale }: Pick<HeaderMenuProps, 'locale'>) {
  const { featuredCountries, featuredCities, treatments } = await loadNavPlaceData(locale)

  return (
    <MobileMenu
      locale={locale}
      featuredCountries={featuredCountries}
      featuredCities={featuredCities}
      treatments={treatments}
    />
  )
}

export function HeaderMobileMenuFallback({ locale }: Pick<HeaderMenuProps, 'locale'>) {
  return (
    <MobileMenu
      locale={locale}
      featuredCountries={[]}
      featuredCities={[]}
      treatments={[]}
    />
  )
}
