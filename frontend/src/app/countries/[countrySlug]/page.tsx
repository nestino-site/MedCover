import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getContentBySlugOptional, getContentListSafe } from '@/lib/api/content'
import {
  countryMeta,
  staticCitiesPerCountry,
  getCitiesForCountry,
  getCountryKeyFromSlug,
  partitionGuides,
} from '@/lib/content/hubs'
import { buildCountryLandingSchemas } from '@/lib/schema/country-landing'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { SpeakableSummary } from '@/components/shared/SpeakableSummary'
import { CountryHero } from '@/components/country-landing/CountryHero'
import { CountryFeaturedGuide } from '@/components/country-landing/CountryFeaturedGuide'
import { CountryCitiesSection } from '@/components/country-landing/CountryCitiesSection'
import { CountryTreatmentsSection } from '@/components/country-landing/CountryTreatmentsSection'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://medcover.com'

type Params = Promise<{ countrySlug: string }>

export function generateStaticParams() {
  return Object.keys(staticCitiesPerCountry).map((countryKey) => ({
    countrySlug: countryKey,
  }))
}

function getCountryMetaByKey(countryKey: string) {
  return countryMeta[`guides/${countryKey}-ivf-guide`] ?? null
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { countrySlug } = await params
  const meta = getCountryMetaByKey(countrySlug)
  if (!meta) return { title: 'Country Guide | MedCover' }

  const cities = staticCitiesPerCountry[countrySlug] ?? []
  const cityList = cities
    .slice(0, 3)
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
    .join(', ')

  const title = `IVF in ${meta.name}: ${meta.clinics}, Costs & City Guides | MedCover`
  const description = `IVF in ${meta.name} ${meta.cost} — ${meta.clinics} across ${cityList || meta.name}. Compare costs, read patient reviews and explore city guides.`
  const canonicalUrl = `${SITE_URL}/countries/${countrySlug}/`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'MedCover',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

async function CountryLandingContent({ countrySlug }: { countrySlug: string }) {
  const locale = activeLocale
  const t = getDictionary(locale)

  const meta = getCountryMetaByKey(countrySlug)
  if (!meta) notFound()

  const [guide, allPages] = await Promise.all([
    getContentBySlugOptional(`guides/${countrySlug}-ivf-guide`),
    getContentListSafe(),
  ])

  const { cities: cityPages } = partitionGuides(allPages, locale)
  const cities = getCitiesForCountry(countrySlug, cityPages, locale)

  const canonicalUrl = `${SITE_URL}/countries/${countrySlug}/`

  const schemas = buildCountryLandingSchemas({
    countryKey: countrySlug,
    countryName: meta.name,
    metaTitle: `IVF in ${meta.name}: ${meta.clinics}, Costs & City Guides | MedCover`,
    metaDescription: `IVF in ${meta.name} ${meta.cost} — ${meta.clinics}. Compare costs, read patient reviews and explore city guides.`,
    canonicalUrl,
    faqs: guide?.faq ?? [],
    cities,
    updatedAt: guide?.updatedAt,
  })

  const breadcrumbs = [
    { name: t.breadcrumb.home, path: '/' },
    { name: t.nav.countries, path: '/countries' },
    { name: meta.name, path: `/countries/${countrySlug}` },
  ]

  return (
    <>
      <JsonLd schemas={schemas} />
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbs} homeHref={localizedPath('/', locale)} />

        <div className="mt-4 space-y-10">
          <CountryHero
            name={meta.name}
            flag={meta.flag}
            tagline={meta.tagline}
            cost={meta.cost}
            clinics={meta.clinics}
            citiesCount={cities.length}
          />

          {/* Speakable summary */}
          <SpeakableSummary label={t.countryLanding.speakableSummaryLabel}>
            <p>
              IVF in {meta.name} is available {meta.cost} across {meta.clinics}.
              {cities.length > 0 && ` City guides are available for ${cities.map((c) => c.cityName).join(', ')}.`}
            </p>
          </SpeakableSummary>

          {/* Featured IVF Guide — integration point for generated guides */}
          <CountryFeaturedGuide
            guide={guide ?? null}
            countryKey={countrySlug}
            countryName={meta.name}
          />

          {/* Cities */}
          <CountryCitiesSection
            cities={cities}
            countryName={meta.name}
            countryFlag={meta.flag}
          />

          {/* Treatments */}
          <CountryTreatmentsSection countryName={meta.name} />

          <CtaBlock
            headline={`Plan Your IVF in ${meta.name}`}
            description="Based on verified patient interviews — not clinic marketing materials."
          />
        </div>
      </div>
    </>
  )
}

function CountryLandingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-4 py-16 sm:px-6">
      <div className="h-4 w-48 rounded bg-[var(--color-neutral-100)]" />
      <div className="mt-8 h-64 rounded-2xl bg-[var(--color-neutral-100)]" />
      <div className="mt-6 h-48 rounded-2xl bg-[var(--color-neutral-100)]" />
      <div className="mt-6 h-32 rounded-2xl bg-[var(--color-neutral-100)]" />
    </div>
  )
}

export default async function CountryLandingPage({ params }: { params: Params }) {
  const { countrySlug } = await params

  return (
    <Suspense fallback={<CountryLandingSkeleton />}>
      <CountryLandingContent countrySlug={countrySlug} />
    </Suspense>
  )
}
