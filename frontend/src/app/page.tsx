import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, BarChart3, HeartHandshake } from 'lucide-react'
import { getTaxonomy } from '@/lib/api/catalog'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { loadCmsPage } from '@/lib/seo/cms-seo'
import { cmsHubMetadata } from '@/lib/seo/site-metadata'
import { HomeCountriesSection } from '@/components/home/HomeCountriesSection'
import { HomeTopClinicsSection } from '@/components/home/HomeTopClinicsSection'
import { SearchTriggerButton } from '@/components/search/SearchModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import {
  HomeCountriesSectionSkeleton,
  HomeTopClinicsSectionSkeleton,
} from '@/components/ui/skeletons/HubSectionSkeletons'
import {
  clinicsHubPath,
  treatmentsHubPath,
  costHubPath,
  compareHubPath,
  guidesHubPath,
  startPath,
} from '@/lib/routes'

export async function generateMetadata(): Promise<Metadata> {
  return cmsHubMetadata('home')
}

async function HomeHeroEyebrow() {
  const t = getDictionary(activeLocale)
  const taxonomy = await getTaxonomy()
  const totalClinics = taxonomy.countries.reduce((s, c) => s + c.clinicCount, 0)
  return totalClinics > 0 ? `${totalClinics} verified clinics worldwide` : t.home.hero.eyebrow
}

export default async function HomePage() {
  const locale = activeLocale
  const t = getDictionary(locale)
  const cms = await loadCmsPage('/')

  const hubs = {
    clinics: clinicsHubPath(locale),
    treatments: treatmentsHubPath(locale),
    costs: costHubPath(locale),
    compare: compareHubPath(locale),
    guides: guidesHubPath(locale),
    start: startPath(locale),
  }

  const quickLinks = [
    { label: 'Clinics', href: hubs.clinics },
    { label: t.home.quickLinks.treatments, href: hubs.treatments },
    { label: t.home.quickLinks.costs, href: hubs.costs },
    { label: t.home.quickLinks.compare, href: hubs.compare },
    { label: t.home.quickLinks.guides, href: hubs.guides },
  ]

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
              <Suspense fallback={t.home.hero.eyebrow}>
                <HomeHeroEyebrow />
              </Suspense>
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl">
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
            <div className="mt-10 flex flex-col items-stretch gap-2 border-t border-white/10 pt-5 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-3 sm:gap-y-2 lg:justify-start">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-2 py-2 text-center text-[var(--color-primary-200)] transition-colors hover:bg-white/5 hover:text-white sm:px-0 sm:py-0 sm:hover:bg-transparent"
                >
                  {link.label}
                </Link>
              ))}
              <div className="ml-auto hidden lg:block">
                <SearchTriggerButton className="rounded-lg bg-white/10 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/15" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<HomeCountriesSectionSkeleton />}>
        <HomeCountriesSection locale={locale} />
      </Suspense>

      <Suspense fallback={<HomeTopClinicsSectionSkeleton />}>
        <HomeTopClinicsSection locale={locale} />
      </Suspense>

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

      <CtaBlock headline={t.home.cta.headline} description={t.home.cta.description} />
    </div>
  )
}
