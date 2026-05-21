import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowRight, ShieldCheck, Globe, Users } from 'lucide-react'
import { HubExploreGrid, HubExploreGridSkeleton } from '@/components/hubs/HubExploreGrid'
import { getFeaturedCountries } from '@/lib/content/hubs'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { hubPath } from '@/lib/content/site-nav'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(activeLocale)
  return {
    title: t.meta.home.title,
    description: t.meta.home.description,
    openGraph: {
      title: t.meta.home.title,
      description: t.meta.home.description,
      url: localizedPath('/', activeLocale),
      type: 'website',
    },
  }
}

export default function HomePage() {
  const locale = activeLocale
  const t = getDictionary(locale)
  const featured = getFeaturedCountries(locale)

  const statTiles = [
    { value: String(featured.length), label: t.home.stats.countries },
    { value: '80+', label: t.home.stats.clinics },
    { value: '500+', label: t.home.stats.interviews },
  ]

  const featureIcons = [ShieldCheck, Globe, Users]
  const featureStyles = [
    { iconBg: 'bg-[var(--color-accent-100)]', iconColor: 'text-[var(--color-accent-600)]' },
    { iconBg: 'bg-[var(--color-primary-100)]', iconColor: 'text-[var(--color-primary-600)]' },
    { iconBg: 'bg-[var(--color-trust-100)]', iconColor: 'text-[var(--color-trust-600)]' },
  ]

  return (
    <div className="flex flex-col">
      <section className="on-dark relative overflow-hidden bg-gradient-to-br from-[var(--color-primary-950)] via-[var(--color-primary-900)] to-[var(--color-primary-800)] py-20 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          aria-hidden="true"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px),
              radial-gradient(circle at 85% 15%, var(--color-accent-400) 0%, transparent 45%),
              radial-gradient(circle at 10% 90%, var(--color-trust-500) 0%, transparent 40%)
            `,
            backgroundSize: '48px 48px, 48px 48px, auto, auto',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-400)]">
                {t.home.hero.eyebrow}
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {t.home.hero.title}
              </h1>
              <p className="mx-auto mt-4 max-w-md text-lg text-[var(--color-primary-200)] lg:mx-0">
                {t.home.hero.subtitle}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href={hubPath('treatments', locale)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-trust-500)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[var(--color-trust-400)]"
                >
                  {t.home.hero.ctaPrimary}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link
                  href={hubPath('countries', locale)}
                  className="inline-flex items-center rounded-xl border border-white/20 px-7 py-3.5 text-sm font-medium text-[var(--color-primary-100)] transition-colors hover:border-white/40 hover:text-white"
                >
                  {t.home.hero.ctaSecondary}
                </Link>
              </div>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-3 lg:mt-0">
              {statTiles.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-5 text-center backdrop-blur-sm sm:px-4"
                >
                  <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-[var(--color-primary-300)] sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--color-border)] bg-[var(--color-primary-900)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-4 text-center text-sm sm:px-6 lg:justify-start lg:px-8 lg:text-left">
          <span className="font-semibold text-[var(--color-trust-400)]">
            {t.home.ivfStrip.label}: {t.home.ivfStrip.treatment}
          </span>
          <span className="hidden text-[var(--color-primary-500)] sm:inline">·</span>
          <Link href={hubPath('countries', locale)} className="text-[var(--color-primary-200)] hover:text-white">
            {t.home.ivfStrip.links.countries}
          </Link>
          <span className="text-[var(--color-primary-500)]">·</span>
          <Link href={hubPath('cities', locale)} className="text-[var(--color-primary-200)] hover:text-white">
            {t.home.ivfStrip.links.cities}
          </Link>
          <span className="text-[var(--color-primary-500)]">·</span>
          <Link href={hubPath('guides', locale)} className="text-[var(--color-primary-200)] hover:text-white">
            {t.home.ivfStrip.links.guides}
          </Link>
          <Link
            href={hubPath('treatments', locale)}
            className="ml-0 w-full rounded-lg bg-white/10 px-4 py-2 font-medium text-white hover:bg-white/15 sm:ml-auto sm:w-auto lg:ml-4"
          >
            {t.home.ivfStrip.cta} →
          </Link>
        </div>
      </section>

      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Suspense fallback={<HubExploreGridSkeleton />}>
            <HubExploreGrid locale={locale} />
          </Suspense>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-600)]">
              {t.home.ivfSpotlight.breadcrumb}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-primary-950)]">
              {t.home.ivfSpotlight.title}
            </h2>
            <p className="mt-3 text-[var(--color-neutral-600)]">{t.home.ivfSpotlight.subtitle}</p>
          </div>
          <Link
            href={hubPath('countries', locale)}
            className="text-center text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)] sm:text-right"
          >
            {t.home.ivfSpotlight.viewAllCountries} →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((dest) => (
            <Link
              key={dest.href}
              href={dest.href}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-center bg-[var(--color-primary-50)] py-8">
                <span className="text-6xl" role="img" aria-label={dest.name}>
                  {dest.flag}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                  {t.home.ivfSpotlight.ivfIn} {dest.name}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-neutral-500)]">{dest.tagline}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[var(--color-primary-50)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary-700)]">
                    {dest.cost}
                  </span>
                  <span className="rounded-full bg-[var(--color-primary-50)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary-700)]">
                    {dest.clinics}
                  </span>
                </div>
                <p className="mt-4 text-sm font-medium text-[var(--color-accent-600)]">
                  {t.home.ivfSpotlight.viewGuide} →
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-[var(--color-accent-600)]">
          <Link href={hubPath('countries', locale)} className="hover:text-[var(--color-accent-700)]">
            {t.home.ivfSpotlight.viewAllCountries} →
          </Link>
          <Link href={hubPath('cities', locale)} className="hover:text-[var(--color-accent-700)]">
            {t.home.ivfSpotlight.viewAllCities} →
          </Link>
          <Link href={hubPath('guides', locale)} className="hover:text-[var(--color-accent-700)]">
            {t.home.ivfSpotlight.viewAllGuides} →
          </Link>
          <Link href={hubPath('treatments', locale)} className="hover:text-[var(--color-accent-700)]">
            {t.home.ivfSpotlight.viewTreatments} →
          </Link>
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-[var(--color-primary-950)]">
            {t.home.features.title}
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {t.home.features.items.map((feature, i) => {
              const Icon = featureIcons[i] ?? ShieldCheck
              const style = featureStyles[i] ?? featureStyles[0]
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-[var(--color-border)] bg-white p-6"
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${style.iconBg}`}
                  >
                    <Icon size={22} className={style.iconColor} aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-[var(--color-primary-950)]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-neutral-600)]">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
