import Link from 'next/link'
import { getContentListSafe } from '@/lib/api/content'
import { getDictionary, type Locale } from '@/lib/i18n'
import { getFeaturedCountries, getCountryDisplay, partitionGuides } from '@/lib/content/hubs'

export async function CountriesList({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  let items = getFeaturedCountries(locale).map((c) => ({
    slug: c.slug,
    href: c.href,
    name: c.name,
    flag: c.flag,
    tagline: c.tagline,
    cost: c.cost,
    clinics: c.clinics,
  }))

  const pages = await getContentListSafe()
  const { countries } = partitionGuides(pages, locale)
  if (countries.length > 0) {
    items = countries.map((page) => {
      const display = getCountryDisplay(page.slug, locale)
      return {
        slug: page.slug,
        href: display.href,
        name: display.name,
        flag: display.flag,
        tagline: display.tagline,
        cost: display.cost,
        clinics: display.clinics,
      }
    })
  }

  if (items.length === 0) {
    return <p className="text-[var(--color-neutral-500)]">{t.hubs.countries.empty}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((dest) => (
        <Link
          key={dest.slug}
          href={dest.href}
          className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center justify-center bg-[var(--color-primary-50)] py-8">
            <span className="text-6xl" role="img" aria-label={dest.name}>
              {dest.flag}
            </span>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h2 className="font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
              {t.home.ivfSpotlight.ivfIn} {dest.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-neutral-500)]">{dest.tagline}</p>
            {(dest.cost || dest.clinics) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {dest.cost && (
                  <span className="rounded-full bg-[var(--color-primary-50)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary-700)]">
                    {dest.cost}
                  </span>
                )}
                {dest.clinics && (
                  <span className="rounded-full bg-[var(--color-primary-50)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary-700)]">
                    {dest.clinics}
                  </span>
                )}
              </div>
            )}
            <p className="mt-4 text-sm font-medium text-[var(--color-accent-600)]">
              {t.hubs.guides.viewGuide} →
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function CountriesListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-2xl bg-[var(--color-neutral-100)]" />
      ))}
    </div>
  )
}
