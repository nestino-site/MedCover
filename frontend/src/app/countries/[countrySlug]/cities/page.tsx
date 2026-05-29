import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { countryMeta, staticCitiesPerCountry, getCitiesForCountry, partitionGuides } from '@/lib/content/hubs'
import { getContentListSafe } from '@/lib/api/content'
import { buildCollectionPage } from '@/lib/schema/hub-collection'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { CitiesList, CitiesListSkeleton } from '@/components/hubs/CitiesList'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'
const locale = activeLocale

type Params = Promise<{ countrySlug: string }>

export function generateStaticParams() {
  return Object.keys(staticCitiesPerCountry).map((countryKey) => ({ countrySlug: countryKey }))
}

function getCountryMetaByKey(countryKey: string) {
  return countryMeta[`guides/${countryKey}-ivf-guide`] ?? null
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { countrySlug } = await params
  const meta = getCountryMetaByKey(countrySlug)
  if (!meta) return { title: 'City Guides | MedCover' }

  const cities = staticCitiesPerCountry[countrySlug] ?? []
  const cityList = cities
    .slice(0, 3)
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
    .join(', ')

  const title = `IVF Cities in ${meta.name}: ${cityList} & More | MedCover`
  const description = `Browse all IVF city guides for ${meta.name} — local clinics, real costs, and travel logistics from verified patients. Cities include ${cityList}.`
  const canonicalUrl = `${SITE_URL}/countries/${countrySlug}/cities/`

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
    twitter: { card: 'summary_large_image', title, description },
  }
}

async function CitiesSubPageContent({ countrySlug }: { countrySlug: string }) {
  const t = getDictionary(locale)
  const meta = getCountryMetaByKey(countrySlug)
  if (!meta) notFound()

  const allPages = await getContentListSafe()
  const { cities: cityPages } = partitionGuides(allPages, locale)
  const cities = getCitiesForCountry(countrySlug, cityPages, locale)

  const canonicalUrl = `${SITE_URL}/countries/${countrySlug}/cities/`

  const breadcrumbs = [
    { name: t.breadcrumb.home, slug: '/', position: 1 },
    { name: t.nav.countries, slug: '/countries', position: 2 },
    { name: meta.name, slug: `/countries/${countrySlug}`, position: 3 },
    { name: t.hubs.countries.citiesLabel, slug: `/countries/${countrySlug}/cities`, position: 4 },
  ]

  const schemas = buildCollectionPage({
    url: canonicalUrl,
    name: `IVF Cities in ${meta.name}`,
    description: `City-level IVF guides for ${meta.name} — local clinics, real costs, and travel logistics.`,
    items: cities.map((c) => ({
      name: `IVF in ${c.cityName}`,
      url: `${SITE_URL}${c.href}`,
      description: `IVF guide for ${c.cityName}, ${meta.name}`,
    })),
    faqs: [
      {
        question: `Which cities in ${meta.name} offer IVF treatment?`,
        answer: `${meta.name} has IVF clinics in ${cities.map((c) => c.cityName).join(', ')}. Each city guide includes verified patient data on costs, clinic quality, and travel logistics.`,
      },
      {
        question: `How much does IVF cost in ${meta.name}?`,
        answer: `IVF in ${meta.name} starts ${meta.cost} across ${meta.clinics}. Prices vary by city, clinic tier, and treatment protocol.`,
      },
    ],
    breadcrumbs,
  })

  return (
    <>
      <JsonLd schema={schemas} />
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbs.slice(1)} homeHref={localizedPath('/', locale)} />

        <div className="mt-6">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <span className="text-4xl leading-none" role="img" aria-label={meta.name}>
                {meta.flag}
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--color-accent-600)]">{meta.name}</p>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--color-primary-950)]">
                  IVF Cities in {meta.name}
                </h1>
              </div>
            </div>
            <p
              className="mt-3 text-lg text-[var(--color-neutral-600)]"
              data-speakable="true"
            >
              {cities.length} city {cities.length === 1 ? 'guide' : 'guides'} available —
              local clinics, real costs, and travel logistics from verified patients.
            </p>
          </div>

          <CitiesList locale={locale} country={countrySlug} />
        </div>
      </div>

      <CtaBlock
        headline={`Plan Your IVF in ${meta.name}`}
        description="Matched with verified clinics across all cities — based on patient truth, not marketing."
      />
    </>
  )
}

export default async function CountryCitiesPage({ params }: { params: Params }) {
  const { countrySlug } = await params
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="h-8 w-64 animate-pulse rounded bg-[var(--color-neutral-100)]" />
        <CitiesListSkeleton />
      </div>
    }>
      <CitiesSubPageContent countrySlug={countrySlug} />
    </Suspense>
  )
}
