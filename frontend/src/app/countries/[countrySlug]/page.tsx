import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getContentBySlugOptional, getContentListSafe } from '@/lib/api/content'
import {
  countryMeta,
  staticCitiesPerCountry,
  getCitiesForCountry,
  getRelatedGuideSlugsForCountry,
  partitionGuides,
} from '@/lib/content/hubs'
import { loadGuideArticlesBySlugs } from '@/lib/content/guide-posts'
import { treatmentCategories } from '@/lib/content/treatments'
import { buildCountryLandingSchemas } from '@/lib/schema/country-landing'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { SpeakableSummary } from '@/components/shared/SpeakableSummary'
import { RelatedArticles } from '@/components/shared/RelatedArticles'
import { PlacePillars } from '@/components/shared/PlacePillars'
import { FilterBar } from '@/components/filters/FilterBar'
import { FilterChips } from '@/components/filters/FilterChips'
import { CountryHero } from '@/components/country-landing/CountryHero'
import { CountryFeaturedGuide } from '@/components/country-landing/CountryFeaturedGuide'
import { CountryCitiesSection } from '@/components/country-landing/CountryCitiesSection'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { en } from '@/lib/i18n/en'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

type Params = Promise<{ countrySlug: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

const treatmentOptions = treatmentCategories.map((c) => ({
  value: c.id,
  label: c.name,
}))

const activeTreatmentId = treatmentCategories.find((c) => c.status === 'active')?.id ?? 'ivf'

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

  const title = `Medical Travel in ${meta.name}: IVF, Costs & Clinics | MedCover`
  const description = `Medical travel in ${meta.name} — IVF ${meta.cost}, ${meta.clinics}${cityList ? ` across ${cityList}` : ''}. Compare treatments, read patient guides, and explore city hubs.`
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

async function CountryLandingContent({
  countrySlug,
  treatmentFilter,
}: {
  countrySlug: string
  treatmentFilter?: string
}) {
  const locale = activeLocale
  const t = getDictionary(locale)
  const cl = en.countryLanding

  const meta = getCountryMetaByKey(countrySlug)
  if (!meta) notFound()

  const isIvfActive = !treatmentFilter || treatmentFilter === activeTreatmentId

  const [guide, allPages] = await Promise.all([
    getContentBySlugOptional(`guides/${countrySlug}-ivf-guide`),
    getContentListSafe(),
  ])

  const { cities: cityPages } = partitionGuides(allPages, locale)
  const cities = getCitiesForCountry(countrySlug, cityPages, locale)
  const relatedSlugs = getRelatedGuideSlugsForCountry(countrySlug, cityPages, locale)
  const relatedArticles = await loadGuideArticlesBySlugs(relatedSlugs, allPages, locale)

  const canonicalUrl = `${SITE_URL}/countries/${countrySlug}/`
  const metaTitle = `Medical Travel in ${meta.name}: IVF, Costs & Clinics | MedCover`
  const metaDescription = `Medical travel in ${meta.name} — IVF ${meta.cost}, ${meta.clinics}. Compare treatments and explore verified patient guides.`

  const schemas = buildCountryLandingSchemas({
    countryKey: countrySlug,
    countryName: meta.name,
    metaTitle,
    metaDescription,
    canonicalUrl,
    faqs: guide?.faq ?? [],
    cities,
    updatedAt: guide?.updatedAt,
  })

  const breadcrumbs = [
    { name: t.breadcrumb.home, slug: '/', position: 1 },
    { name: t.nav.countries, slug: '/countries', position: 2 },
    { name: meta.name, slug: `/countries/${countrySlug}`, position: 3 },
  ]

  return (
    <>
      <JsonLd schema={schemas} />
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbs.slice(1)} homeHref={localizedPath('/', locale)} />

        <div className="mt-4 space-y-10">
          <CountryHero
            name={meta.name}
            flag={meta.flag}
            tagline={meta.tagline}
            cost={meta.cost}
            clinics={meta.clinics}
            citiesCount={cities.length}
          />

          <PlacePillars placeName={meta.name} />

          <SpeakableSummary label={cl.speakableSummaryLabel}>
            <p>
              {meta.name} is a medical travel destination with verified patient data across{' '}
              {meta.clinics}. IVF is available {meta.cost}.
              {cities.length > 0 &&
                ` City guides are available for ${cities.map((c) => c.cityName).join(', ')}.`}
            </p>
          </SpeakableSummary>

          <Suspense fallback={null}>
            <FilterBar>
              <FilterChips
                options={treatmentOptions}
                paramKey="treatment"
                label={cl.treatmentFilterLabel}
                allLabel={cl.treatmentFilterAll}
              />
            </FilterBar>
          </Suspense>

          {isIvfActive ? (
            <div id="ivf-pillar" className="space-y-8 scroll-mt-8">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-primary-950)]">
                  {cl.ivfPillar.heading}
                </h2>
                <p className="mt-1 text-sm text-[var(--color-neutral-600)]">{cl.ivfPillar.subtitle}</p>
              </div>

              <CountryFeaturedGuide
                guide={guide ?? null}
                countryKey={countrySlug}
                countryName={meta.name}
              />

              <CountryCitiesSection
                cities={cities}
                countryName={meta.name}
                countryFlag={meta.flag}
              />

              <RelatedArticles
                eyebrow={cl.relatedArticles.eyebrow}
                heading={cl.relatedArticles.heading}
                articles={relatedArticles}
                emptyMessage={cl.relatedArticles.empty}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-neutral-50)] px-6 py-10 text-center">
              <p className="font-semibold text-[var(--color-primary-950)]">
                {cl.treatmentComingSoon.title}
              </p>
              <p className="mt-2 text-sm text-[var(--color-neutral-600)]">
                {cl.treatmentComingSoon.body}
              </p>
            </div>
          )}

          <CtaBlock
            headline={cl.cta.headline.replace('{country}', meta.name)}
            description={cl.cta.description}
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

async function CountryLandingPageInner({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { countrySlug } = await params
  const { treatment } = await searchParams
  const treatmentFilter = typeof treatment === 'string' ? treatment : undefined

  return (
    <CountryLandingContent
      countrySlug={countrySlug}
      treatmentFilter={treatmentFilter}
    />
  )
}

export default function CountryLandingPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  return (
    <Suspense fallback={<CountryLandingSkeleton />}>
      <CountryLandingPageInner params={params} searchParams={searchParams} />
    </Suspense>
  )
}
