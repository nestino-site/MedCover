import { listPublishedPagesSafe } from '@/lib/api/content'
import { getFeaturedCountries, getGuideArticles, type GuideArticleItem } from '@/lib/content/hubs'
import { type Dictionary, type Locale } from '@/lib/i18n'
import { MobileMenu } from './MobileMenu'
import { NavMegaMenu } from './NavMegaMenu'

async function loadGuideArticles(locale: Locale): Promise<GuideArticleItem[]> {
  const pages = await listPublishedPagesSafe()
  return getGuideArticles(pages, locale).slice(0, 12)
}

type HeaderMenuProps = {
  locale: Locale
  t: Dictionary
}

export async function HeaderMegaMenu({ locale, t }: HeaderMenuProps) {
  const featuredCountries = getFeaturedCountries(locale)
  const guideArticles = await loadGuideArticles(locale)

  return (
    <NavMegaMenu
      locale={locale}
      t={t}
      featuredCountries={featuredCountries}
      guideArticles={guideArticles}
    />
  )
}

export function HeaderMegaMenuFallback({ locale, t }: HeaderMenuProps) {
  return (
    <NavMegaMenu
      locale={locale}
      t={t}
      featuredCountries={getFeaturedCountries(locale)}
      guideArticles={[]}
    />
  )
}

export async function HeaderMobileMenu({ locale }: Pick<HeaderMenuProps, 'locale'>) {
  const guideArticles = await loadGuideArticles(locale)
  return <MobileMenu locale={locale} guideArticles={guideArticles} />
}

export function HeaderMobileMenuFallback({ locale }: Pick<HeaderMenuProps, 'locale'>) {
  return <MobileMenu locale={locale} guideArticles={[]} />
}
