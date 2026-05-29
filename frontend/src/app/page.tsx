import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, BarChart3, HeartHandshake } from 'lucide-react'
import { buildHomeLinkGraph } from '@/lib/content/home-links'
import { treatmentCategories } from '@/lib/content/treatments'
import { localizedPath } from '@/lib/i18n'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { JsonLd } from '@/components/shared/JsonLd'

const locale = activeLocale
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(locale)
  return {
    title: t.meta.home.title,
    description: t.meta.home.description,
    alternates: { canonical: `${SITE_URL}/` },
    openGraph: {
      title: t.meta.home.title,
      description: t.meta.home.description,
      url: `${SITE_URL}/`,
      type: 'website',
      siteName: 'MedCover',
    },
    twitter: { card: 'summary_large_image', title: t.meta.home.title, description: t.meta.home.description },
  }
}

const homeSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'MedCover',
  url: SITE_URL,
  description:
    'Independent patient interviews, real costs, and clinic Truth Scores for medical travel abroad — verified data, not clinic marketing.',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/guides/?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}

export default function HomePage() {
  const t = getDictionary(locale)
  const graph = buildHomeLinkGraph(locale)
  const { countries, hubs } = graph
  const activeTreatments = treatmentCategories.filter((c) => c.status === 'active')

  const howItWorksSteps = [
    {
      step: '01',
      icon: BarChart3,
      ...t.home.howItWorks.steps[0],
      href: hubs.countries,
      iconBg: 'bg-[var(--color-primary-100)]',
      iconColor: 'text-[var(--color-primary-600)]',
    },
    {
      step: '02',
      icon: CheckCircle2,
      ...t.home.howItWorks.steps[1],
      href: hubs.compare,
      iconBg: 'bg-[var(--color-accent-100)]',
      iconColor: 'text-[var(--color-accent-600)]',
    },
    {
      step: '03',
      icon: HeartHandshake,
      ...t.home.howItWorks.steps[2],
      href: hubs.start,
      iconBg: 'bg-[var(--color-trust-100)]',
      iconColor: 'text-[var(--color-trust-600)]',
    },
  ]

  return (
    <div className="flex flex-col">
      <JsonLd schema={[homeSchema]} />

      {/* ── SECTION 1: HERO ─────────────────────────────────── */}
      <section className="on-dark relative overflow-hidden bg-gradient-to-br from-[var(--color-primary-950)] via-[var(--color-primary-900)] to-[var(--color-primary-800)] py-20 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
          aria-hidden="true"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px),
              radial-gradient(circle at 80% 20%, var(--color-accent-400) 0%, transparent 50%),
              radial-gradient(circle at 15% 80%, var(--color-trust-500) 0%, transparent 40%)
            `,
            backgroundSize: '48px 48px, 48px 48px, auto, auto',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-400)]">
              {t.home.hero.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t.home.hero.title}
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg text-[var(--color-primary-200)] lg:mx-0">
              {t.home.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href={hubs.countries}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-trust-500)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[var(--color-trust-400)]"
              >
                {t.home.hero.ctaPrimary}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href={hubs.treatments}
                className="inline-flex items-center rounded-xl border border-white/20 px-7 py-3.5 text-sm font-medium text-[var(--color-primary-100)] transition-colors hover:border-white/40 hover:text-white"
              >
                {t.home.hero.ctaSecondary}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[var(--color-primary-400)] lg:justify-start">
              {t.home.hero.trustItems.map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[var(--color-accent-400)]" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: QUICK LINKS ───────────────────────────── */}
      <section className="border-b border-[var(--color-border)] bg-[var(--color-primary-900)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 py-3 text-sm sm:px-6 lg:justify-start lg:px-8">
          <Link href={hubs.treatments} className="font-medium text-[var(--color-primary-200)] hover:text-white">
            {t.home.quickLinks.treatments}
          </Link>
          <span className="text-[var(--color-primary-600)]">·</span>
          <Link href={hubs.countries} className="text-[var(--color-primary-200)] hover:text-white">
            {t.home.quickLinks.countries}
          </Link>
          <span className="text-[var(--color-primary-600)]">·</span>
          <Link href={hubs.costs} className="text-[var(--color-primary-200)] hover:text-white">
            {t.home.quickLinks.costs}
          </Link>
          <span className="text-[var(--color-primary-600)]">·</span>
          <Link href={hubs.compare} className="text-[var(--color-primary-200)] hover:text-white">
            {t.home.quickLinks.compare}
          </Link>
          <span className="text-[var(--color-primary-600)]">·</span>
          <Link href={hubs.guides} className="text-[var(--color-primary-200)] hover:text-white">
            {t.home.quickLinks.guides}
          </Link>
          <Link
            href={hubs.start}
            className="ml-auto hidden rounded-lg bg-white/10 px-4 py-1.5 font-medium text-white hover:bg-white/15 lg:inline-flex"
          >
            {t.home.quickLinks.cta} →
          </Link>
        </div>
      </section>

      {/* ── SECTION 3: COUNTRY CARDS ─────────────────────────── */}
      <section id="countries" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-600)]">
              {t.home.countries.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-primary-950)]">
              {t.home.countries.title}
            </h2>
            <p className="mt-2 text-[var(--color-neutral-600)]">
              {t.home.countries.subtitle}
            </p>
          </div>
          <Link
            href={hubs.countries}
            className="shrink-0 text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
          >
            {t.home.countries.viewAll} →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((dest) => (
            <article
              key={dest.key}
              className="group flex flex-col rounded-xl border border-[var(--color-border)] bg-white p-5 transition-colors hover:border-[var(--color-primary-200)]"
            >
              <div className="flex items-start justify-between gap-3">
                <Link href={dest.landingHref} className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="text-2xl leading-none shrink-0" role="img" aria-label={dest.name}>
                    {dest.flag}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                      {dest.name}
                    </h3>
                    <p className="truncate text-xs text-[var(--color-neutral-500)]">{dest.tagline}</p>
                  </div>
                </Link>
                {dest.clinics && (
                  <p className="shrink-0 text-xs text-[var(--color-neutral-500)]">{dest.clinics}</p>
                )}
              </div>

              {activeTreatments.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
                    {t.home.countries.treatmentsLabel}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {activeTreatments.map((category) => (
                      <Link
                        key={category.id}
                        href={localizedPath(`/treatments/${category.id}`, locale)}
                        className="rounded-full bg-[var(--color-accent-50)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent-700)] transition-colors hover:bg-[var(--color-accent-100)]"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {dest.cities.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {dest.cities.map((city) => (
                    <Link
                      key={city.href}
                      href={city.href}
                      className="rounded-md bg-[var(--color-surface-subtle)] px-2 py-0.5 text-xs text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center gap-3 border-t border-[var(--color-border)] pt-3 text-xs">
                <Link
                  href={dest.landingHref}
                  className="font-medium text-[var(--color-primary-700)] hover:text-[var(--color-accent-600)]"
                >
                  {t.home.countries.countryOverview}
                </Link>
                <span className="text-[var(--color-neutral-300)]" aria-hidden="true">·</span>
                <Link
                  href={dest.guideHref}
                  className="text-[var(--color-neutral-500)] hover:text-[var(--color-primary-800)]"
                >
                  {t.home.countries.patientGuide}
                </Link>
                {dest.cities.length > 0 && (
                  <>
                    <span className="text-[var(--color-neutral-300)]" aria-hidden="true">·</span>
                    <Link
                      href={dest.citiesIndexHref}
                      className="text-[var(--color-neutral-500)] hover:text-[var(--color-primary-800)]"
                    >
                      {t.home.countries.citiesLink}
                    </Link>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── SECTION 4: HOW IT WORKS ──────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-primary-950)]">
            {t.home.howItWorks.title}
          </h2>
          <p className="mt-3 text-[var(--color-neutral-600)]">
            {t.home.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {howItWorksSteps.map(({ step, icon: Icon, title, body, cta, href, iconBg, iconColor }) => (
            <div
              key={step}
              className="relative flex flex-col rounded-2xl border border-[var(--color-border)] bg-white p-6"
            >
              <span className="mb-4 text-xs font-bold tracking-widest text-[var(--color-neutral-300)]">{step}</span>
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${iconBg}`}>
                <Icon size={20} className={iconColor} aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-[var(--color-primary-950)]">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-neutral-600)]">{body}</p>
              {href !== '#' ? (
                <Link
                  href={href}
                  className="mt-5 text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
                >
                  {cta} →
                </Link>
              ) : (
                <p className="mt-5 text-sm font-medium text-[var(--color-neutral-400)]">{cta}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 5: CTA ───────────────────────────────────── */}
      <CtaBlock headline={t.home.cta.headline} description={t.home.cta.description} />
    </div>
  )
}
