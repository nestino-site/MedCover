import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, BarChart3, HeartHandshake } from 'lucide-react'
import { getTaxonomy, listClinics } from '@/lib/api/catalog'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { cmsMetadataForSlug, loadCmsPage } from '@/lib/seo/cms-seo'
import { ClinicCard } from '@/components/clinics/ClinicCard'
import { CountryCard, type CountryCardData } from '@/components/hubs/CountryCard'
import { SearchTriggerButton } from '@/components/search/SearchModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import {
  getCitiesForCountry,
  getCountryDisplayFromTaxonomy,
  partitionGuides,
} from '@/lib/content/hubs'
import { getTreatmentTagsForCountry } from '@/lib/content/treatments'
import {
  clinicsHubPath,
  treatmentsHubPath,
  costHubPath,
  compareHubPath,
  guidesHubPath,
  countriesHubPath,
  startPath,
} from '@/lib/routes'

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadataForSlug('/')
}

export default async function HomePage() {
  const locale = activeLocale
  const t = getDictionary(locale)

  const [taxonomy, topClinics, cms, allPages] = await Promise.all([
    getTaxonomy(),
    listClinics({ sort: 'rating', limit: 6 }),
    loadCmsPage('/'),
    listPublishedPagesSafe(),
  ])

  const totalClinics = taxonomy.countries.reduce((s, c) => s + c.clinicCount, 0)
  const { cities: cityPages } = partitionGuides(allPages, locale, taxonomy)

  const hubs = {
    clinics: clinicsHubPath(locale),
    treatments: treatmentsHubPath(locale),
    costs: costHubPath(locale),
    compare: compareHubPath(locale),
    guides: guidesHubPath(locale),
    countries: countriesHubPath(locale),
    start: startPath(locale),
  }

  const quickLinks = [
    { label: 'Clinics', href: hubs.clinics },
    { label: t.home.quickLinks.treatments, href: hubs.treatments },
    { label: t.home.quickLinks.costs, href: hubs.costs },
    { label: t.home.quickLinks.compare, href: hubs.compare },
    { label: t.home.quickLinks.guides, href: hubs.guides },
  ]

  const countryCards: CountryCardData[] = taxonomy.countries.slice(0, 6).map((country) => {
    const display = getCountryDisplayFromTaxonomy(country.slug, taxonomy, locale)
    return {
      slug: display.slug,
      countryKey: country.slug,
      href: display.href,
      guideHref: display.guideHref,
      name: display.name,
      flag: display.flag,
      tagline: display.tagline,
      cost: display.cost,
      clinics: display.clinics,
      cities: getCitiesForCountry(country.slug, cityPages, locale, taxonomy),
      treatments: getTreatmentTagsForCountry(taxonomy, country.slug),
      costNumeric: 0,
      clinicsNumeric: country.clinicCount,
    }
  })

  const howItWorksSteps = [
    {
      step: '01',
      icon: BarChart3,
      ...t.home.howItWorks.steps[0],
      href: hubs.clinics,
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
      <CmsPageJsonLd result={cms} />

      {/* ── SECTION 1: HERO (with quick links merged in) ─────── */}
      <section className="on-dark relative overflow-hidden bg-gradient-to-br from-[var(--color-primary-950)] via-[var(--color-primary-900)] to-[var(--color-primary-800)] py-16 sm:py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
          aria-hidden="true"
          style={{
            backgroundImage: `
              radial-gradient(circle at 80% 20%, var(--color-accent-400) 0%, transparent 50%),
              radial-gradient(circle at 15% 80%, var(--color-trust-500) 0%, transparent 40%)
            `,
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-400)]">
              {totalClinics > 0 ? `${totalClinics} verified clinics worldwide` : t.home.hero.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
              {t.home.hero.title}
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg text-[var(--color-primary-200)] lg:mx-0">
              {t.home.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Button href={hubs.clinics} variant="accent" size="lg">
                Browse Clinics
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
              <Button href={hubs.guides} variant="ghostOnDark" size="lg">
                {t.home.hero.ctaSecondary}
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-white/10 pt-5 text-sm lg:justify-start">
              {quickLinks.map((link, i) => (
                <span key={link.href} className="flex items-center gap-3">
                  {i > 0 && (
                    <span className="text-[var(--color-primary-600)]" aria-hidden="true">·</span>
                  )}
                  <Link href={link.href} className="text-[var(--color-primary-200)] transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </span>
              ))}
              <div className="ml-auto hidden lg:block">
                <SearchTriggerButton className="rounded-lg bg-white/10 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/15" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: DESTINATIONS ──────────────────────────── */}
      {countryCards.length > 0 && (
        <Section id="countries">
          <SectionHeading
            eyebrow={t.home.countries.eyebrow}
            title={t.home.countries.title}
            description={t.home.countries.subtitle}
            action={
              <Link
                href={hubs.countries}
                className="text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
              >
                {t.home.countries.viewAll} →
              </Link>
            }
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {countryCards.map((card) => (
              <CountryCard key={card.countryKey} data={card} t={t} />
            ))}
          </div>
        </Section>
      )}

      {/* ── SECTION 3: TOP-RATED CLINICS ─────────────────────── */}
      {topClinics.items.length > 0 && (
        <Section tone="subtle">
          <SectionHeading
            eyebrow="Patient-verified"
            title="Top-rated clinics"
            description="Ranked by Google rating and independently verified patient data."
            action={
              <Link
                href={hubs.clinics}
                className="text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
              >
                View all clinics →
              </Link>
            }
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topClinics.items.map((clinic, i) => (
              <ClinicCard key={clinic.urlPath} clinic={clinic} priority={i < 3} />
            ))}
          </div>
        </Section>
      )}

      {/* ── SECTION 4: HOW IT WORKS ──────────────────────────── */}
      <Section width="narrow" containerClassName="max-w-5xl">
        <SectionHeading
          align="center"
          title={t.home.howItWorks.title}
          description={t.home.howItWorks.subtitle}
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {howItWorksSteps.map(({ step, icon: Icon, title, body, cta, href, iconBg, iconColor }) => (
            <Card key={step} className="relative flex flex-col p-6">
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
            </Card>
          ))}
        </div>
      </Section>

      {/* ── SECTION 5: CTA ───────────────────────────────────── */}
      <CtaBlock headline={t.home.cta.headline} description={t.home.cta.description} />
    </div>
  )
}
