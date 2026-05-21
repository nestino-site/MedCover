import Link from 'next/link'
import { getContentListSafe } from '@/lib/api/content'
import { getDictionary, localizedPath, type Locale } from '@/lib/i18n'
import { getCountryDisplay, partitionGuides, parseCitySlug } from '@/lib/content/hubs'
import { hubPath } from '@/lib/content/site-nav'

export async function GuidesList({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const pages = await getContentListSafe()
  const { countries, cities } = partitionGuides(pages, locale)

  if (countries.length === 0 && cities.length === 0) {
    return <p className="text-[var(--color-neutral-500)]">{t.hubs.guides.empty}</p>
  }

  return (
    <div className="space-y-12">
      {countries.length > 0 && (
        <section>
          <h2 className="mb-5 text-lg font-semibold text-[var(--color-primary-950)]">
            {t.hubs.guides.countryTab}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((page) => {
              const display = getCountryDisplay(page.slug, locale)
              return (
                <GuideCard
                  key={page.slug}
                  href={localizedPath(`/${page.slug}`, locale)}
                  title={display.name}
                  subtitle={display.tagline}
                  flag={display.flag}
                  viewLabel={t.hubs.guides.viewGuide}
                  countryHref={hubPath('countries', locale)}
                  countryLabel={t.nav.countries}
                />
              )
            })}
          </div>
        </section>
      )}
      {cities.length > 0 && (
        <section>
          <h2 className="mb-5 text-lg font-semibold text-[var(--color-primary-950)]">
            {t.hubs.guides.cityTab}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((page) => {
              const parsed = parseCitySlug(page.slug)
              const countrySlug = parsed
                ? `guides/${parsed.countryKey}-ivf-guide`
                : page.slug
              const country = getCountryDisplay(countrySlug, locale)
              return (
                <GuideCard
                  key={page.slug}
                  href={localizedPath(`/${page.slug}`, locale)}
                  title={parsed?.cityName ?? page.slug}
                  subtitle={`${country.name} · ${country.tagline}`}
                  flag={country.flag}
                  viewLabel={t.hubs.guides.viewGuide}
                  countryHref={localizedPath(`/${countrySlug}`, locale)}
                  countryLabel={country.name}
                />
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

function GuideCard({
  href,
  title,
  subtitle,
  flag,
  viewLabel,
  countryHref,
  countryLabel,
}: {
  href: string
  title: string
  subtitle: string
  flag: string
  viewLabel: string
  countryHref: string
  countryLabel: string
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-white p-5 transition-all hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className="text-3xl" role="img" aria-hidden="true">
          {flag}
        </span>
        <div>
          <h3 className="font-semibold text-[var(--color-primary-950)]">
            <Link href={href} className="hover:text-[var(--color-primary-700)]">
              {title}
            </Link>
          </h3>
          <p className="text-sm text-[var(--color-neutral-500)]">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <Link href={href} className="font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]">
          {viewLabel} →
        </Link>
        <Link
          href={countryHref}
          className="text-[var(--color-neutral-500)] hover:text-[var(--color-primary-700)]"
        >
          {countryLabel}
        </Link>
      </div>
    </div>
  )
}

export function GuidesListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-2xl bg-[var(--color-neutral-100)]" />
      ))}
    </div>
  )
}
