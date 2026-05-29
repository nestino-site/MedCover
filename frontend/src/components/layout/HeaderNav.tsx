import { listPublishedPagesSafe } from '@/lib/api/content'
import { loadGuideGroupsForPages, limitGuideGroupsForNav } from '@/lib/content/guide-display'
import { getFeaturedCountries, type GuideCountryGroup } from '@/lib/content/hubs'
import { type Dictionary, type Locale } from '@/lib/i18n'
import { MobileMenu } from './MobileMenu'
import { NavMegaMenu } from './NavMegaMenu'

async function loadGuideGroups(locale: Locale): Promise<GuideCountryGroup[]> {
  const pages = await listPublishedPagesSafe()
  const groups = await loadGuideGroupsForPages(pages, locale)
  return limitGuideGroupsForNav(groups, 12)
}

type HeaderMenuProps = {
  locale: Locale
  t: Dictionary
}

export async function HeaderMegaMenu({ locale, t }: HeaderMenuProps) {
  const featuredCountries = getFeaturedCountries(locale)
  const guideGroups = await loadGuideGroups(locale)

  return (
    <NavMegaMenu
      locale={locale}
      t={t}
      featuredCountries={featuredCountries}
      guideGroups={guideGroups}
    />
  )
}

export function HeaderMegaMenuFallback({ locale, t }: HeaderMenuProps) {
  return (
    <NavMegaMenu
      locale={locale}
      t={t}
      featuredCountries={getFeaturedCountries(locale)}
      guideGroups={[]}
    />
  )
}

export async function HeaderMobileMenu({ locale }: Pick<HeaderMenuProps, 'locale'>) {
  const guideGroups = await loadGuideGroups(locale)
  return <MobileMenu locale={locale} guideGroups={guideGroups} />
}

export function HeaderMobileMenuFallback({ locale }: Pick<HeaderMenuProps, 'locale'>) {
  return <MobileMenu locale={locale} guideGroups={[]} />
}
