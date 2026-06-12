import { listPublishedPagesSafe } from '@/lib/api/content'
import { loadGuideGroupsForPages, limitGuideGroupsForNav } from '@/lib/content/guide-display'
import { getFeaturedCountriesFromTaxonomy, type GuideCountryGroup } from '@/lib/content/hubs'
import { getTaxonomy } from '@/lib/api/catalog'
import { treatmentsForDisplay } from '@/lib/content/treatments'
import { type Dictionary, type Locale } from '@/lib/i18n'
import { MobileMenu } from './MobileMenu'
import { NavMegaMenu } from './NavMegaMenu'

async function loadGuideGroups(locale: Locale): Promise<GuideCountryGroup[]> {
  const [pages, taxonomy] = await Promise.all([listPublishedPagesSafe(), getTaxonomy()])
  const groups = await loadGuideGroupsForPages(pages, locale, taxonomy)
  return limitGuideGroupsForNav(groups, 12)
}

type HeaderMenuProps = {
  locale: Locale
  t: Dictionary
}

export async function HeaderMegaMenu({ locale, t }: HeaderMenuProps) {
  const taxonomy = await getTaxonomy()
  const featuredCountries = getFeaturedCountriesFromTaxonomy(taxonomy, locale)
  const guideGroups = await loadGuideGroups(locale)
  const treatments = treatmentsForDisplay(taxonomy)

  return (
    <NavMegaMenu
      locale={locale}
      t={t}
      featuredCountries={featuredCountries}
      guideGroups={guideGroups}
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
      guideGroups={[]}
      treatments={[]}
    />
  )
}

export async function HeaderMobileMenu({ locale }: Pick<HeaderMenuProps, 'locale'>) {
  const taxonomy = await getTaxonomy()
  const featuredCountries = getFeaturedCountriesFromTaxonomy(taxonomy, locale)
  const guideGroups = await loadGuideGroups(locale)
  const treatments = treatmentsForDisplay(taxonomy)

  return (
    <MobileMenu
      locale={locale}
      guideGroups={guideGroups}
      featuredCountries={featuredCountries}
      treatments={treatments}
    />
  )
}

export function HeaderMobileMenuFallback({ locale }: Pick<HeaderMenuProps, 'locale'>) {
  return (
    <MobileMenu
      locale={locale}
      guideGroups={[]}
      featuredCountries={[]}
      treatments={[]}
    />
  )
}
