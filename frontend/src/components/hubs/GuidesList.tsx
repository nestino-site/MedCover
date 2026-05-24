import Link from 'next/link'
import { getContentListSafe } from '@/lib/api/content'
import { getDictionary, localizedPath, type Locale } from '@/lib/i18n'
import { getCountryDisplay, partitionGuides, parseCitySlug, getStaticGuidePages } from '@/lib/content/hubs'

interface GuideItem {
  slug: string
  href: string
  flag: string
  title: string
  subtitle: string
  type: 'country' | 'city'
}

export async function GuidesList({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const pages = await getContentListSafe()
  const apiSlugs = new Set(pages.map((p) => p.slug))
  const merged = [
    ...pages,
    ...getStaticGuidePages(locale).filter((p) => !apiSlugs.has(p.slug)),
  ]
  const { countries, cities } = partitionGuides(merged, locale)

  const guides: GuideItem[] = []

  for (const page of countries) {
    const display = getCountryDisplay(page.slug, locale)
    guides.push({
      slug: page.slug,
      href: localizedPath(`/${page.slug}`, locale),
      flag: display.flag,
      title: display.name,
      subtitle: display.tagline,
      type: 'country',
    })
  }

  for (const page of cities) {
    const parsed = parseCitySlug(page.slug)
    const countrySlug = parsed ? `guides/${parsed.countryKey}-ivf-guide` : page.slug
    const country = getCountryDisplay(countrySlug, locale)
    guides.push({
      slug: page.slug,
      href: localizedPath(`/${page.slug}`, locale),
      flag: country.flag,
      title: parsed?.cityName ?? page.slug,
      subtitle: country.name,
      type: 'city',
    })
  }

  if (guides.length === 0) {
    return <p className="text-[var(--color-neutral-500)]">{t.hubs.guides.empty}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => (
        <Link
          key={guide.slug}
          href={guide.href}
          className="group flex items-start gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-5 transition-all hover:border-[var(--color-primary-200)] hover:shadow-md"
        >
          <span className="mt-0.5 shrink-0 text-3xl leading-none" role="img" aria-hidden="true">
            {guide.flag}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
              {guide.title}
            </p>
            <p className="mt-0.5 text-sm text-[var(--color-neutral-500)]">{guide.subtitle}</p>
            <p className="mt-3 text-sm font-medium text-[var(--color-accent-600)]">
              {t.hubs.guides.viewGuide} →
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function GuidesListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-[var(--color-neutral-100)]" />
      ))}
    </div>
  )
}
