import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getContentBySlugOptional, getContentListSafe } from '@/lib/api/content'
import {
  countryMeta,
  staticCitiesPerCountry,
  getCountryLandingPath,
  getRelatedGuideSlugsForCity,
  partitionGuides,
  slugToLabel,
} from '@/lib/content/hubs'
import { loadGuideArticlesBySlugs } from '@/lib/content/guide-posts'
import { treatmentCategories } from '@/lib/content/treatments'
import { buildCollectionPage } from '@/lib/schema/hub-collection'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { SpeakableSummary } from '@/components/shared/SpeakableSummary'
import { RelatedArticles } from '@/components/shared/RelatedArticles'
import { PlacePillars } from '@/components/shared/PlacePillars'
import { FilterBar } from '@/components/filters/FilterBar'
import { FilterChips } from '@/components/filters/FilterChips'
import { FilterNavigationProvider } from '@/components/filters/filter-navigation'
import { TreatmentFilterPanel } from '@/components/filters/TreatmentFilterPanel'
import { CityHero } from '@/components/city-landing/CityHero'
import { CityFeaturedGuide } from '@/components/city-landing/CityFeaturedGuide'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { en } from '@/lib/i18n/en'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

type Params = Promise<{ country: string; city: string }>

export function generateStaticParams() {
  const params: { country: string; city: string }[] = []
  for (const [countryKey, cities] of Object.entries(staticCitiesPerCountry)) {
    for (const cityKey of cities) {
      params.push({ country: countryKey, city: cityKey })
    }
  }
  return params
}

function isValidCity(countryKey: string, cityKey: string): boolean {
  const cities = staticCitiesPerCountry[countryKey]
  return cities?.includes(cityKey) ?? false
}

function getCountryMeta(countryKey: string) {
  return countryMeta[`guides/${countryKey}-ivf-guide`] ?? null
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { country, city } = await params
  if (!isValidCity(country, city)) return { title: 'City Guide | MedCover' }

  const meta = getCountryMeta(country)
  const cityName = slugToLabel(city)
  const countryName = meta?.name ?? slugToLabel(country)
  const title = `Medical Travel in ${cityName}, ${countryName} | MedCover`
  const description = `Medical travel in ${cityName}, ${countryName} — local clinics, available treatments, and verified patient guides. IVF is live.`
  const canonicalUrl = `${SITE_URL}/cities/${country}/${city}/`

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

const treatmentOptions = treatmentCategories.map((c) => ({
  value: c.id,
  label: c.name,
}))

const activeTreatmentId = treatmentCategories.find((c) => c.status === 'active')?.id ?? 'ivf'

async function CityHubContent({
  countryKey,
  cityKey,
}: {
  countryKey: string
  cityKey: string
}) {
  const locale = activeLocale
  const t = getDictionary(locale)
  const tl = en.cityLanding

  if (!isValidCity(countryKey, cityKey)) notFound()

  const meta = getCountryMeta(countryKey)
  if (!meta) notFound()

  const cityName = slugToLabel(cityKey)
  const guideSlug = `guides/${countryKey}/${cityKey}-ivf-guide`
  const [guide, allPages] = await Promise.all([
    getContentBySlugOptional(guideSlug),
    getContentListSafe(),
  ])

  const { cities: cityPages } = partitionGuides(allPages, locale)
  const relatedSlugs = getRelatedGuideSlugsForCity(countryKey, cityKey, cityPages, locale)
  const relatedArticles = await loadGuideArticlesBySlugs(relatedSlugs, allPages, locale)
  const canonicalUrl = `${SITE_URL}/cities/${countryKey}/${cityKey}/`
  const countryHubHref = getCountryLandingPath(countryKey, locale)

  const breadcrumbs = [
    { name: t.breadcrumb.home, slug: '/', position: 1 },
    { name: t.nav.countries, slug: '/countries', position: 2 },
    { name: meta.name, slug: `/countries/${countryKey}`, position: 3 },
    { name: cityName, slug: `/cities/${countryKey}/${cityKey}`, position: 4 },
  ]

  const schemas = buildCollectionPage({
    url: canonicalUrl,
    name: `Medical travel in ${cityName}, ${meta.name}`,
    description: `City medical travel hub for ${cityName}, ${meta.name} — treatments, clinics, and patient guides.`,
    items: relatedArticles.map((a) => ({
      name: a.title,
      url: `${SITE_URL}${a.href.startsWith('/') ? a.href : `/${a.href}`}`,
      description: a.description || a.title,
    })),
    breadcrumbs,
  })

  return (
    <>
      <JsonLd schema={schemas} />
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbs.slice(1)} homeHref={localizedPath('/', locale)} />

        <div className="mt-4 space-y-10">
          <CityHero
            cityName={cityName}
            countryName={meta.name}
            countryFlag={meta.flag}
            countryHubHref={countryHubHref}
            cost={meta.cost}
            clinics={meta.clinics}
          />

          <PlacePillars placeName={cityName} />

          <SpeakableSummary label={tl.speakableSummaryLabel}>
            <p>
              {cityName}, {meta.name} is a medical travel destination with local clinics and verified
              patient guides. Treatment data: {meta.cost} nationally across {meta.clinics}. IVF guides
              are live — more treatment categories coming soon.
            </p>
          </SpeakableSummary>

          <FilterNavigationProvider>
            <Suspense fallback={null}>
              <FilterBar>
                <FilterChips
                  options={treatmentOptions}
                  paramKey="treatment"
                  label={tl.treatmentFilterLabel}
                  allLabel={tl.treatmentFilterAll}
                />
              </FilterBar>
            </Suspense>

            <TreatmentFilterPanel
              activeTreatmentId={activeTreatmentId}
              ivfContent={
                <div id="ivf-pillar" className="space-y-8 scroll-mt-8">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-primary-950)]">
                      {tl.ivfPillar.heading}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-neutral-600)]">
                      {tl.ivfPillar.subtitle}
                    </p>
                  </div>

                  <CityFeaturedGuide
                    guide={guide ?? null}
                    countryKey={countryKey}
                    cityKey={cityKey}
                    cityName={cityName}
                  />

                  <RelatedArticles
                    eyebrow={tl.relatedArticles.eyebrow}
                    heading={tl.relatedArticles.heading}
                    articles={relatedArticles}
                    emptyMessage={tl.relatedArticles.empty}
                  />
                </div>
              }
              comingSoonContent={
                <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-neutral-50)] px-6 py-10 text-center">
                  <p className="font-semibold text-[var(--color-primary-950)]">
                    {tl.treatmentComingSoon.title}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-neutral-600)]">
                    {tl.treatmentComingSoon.body}
                  </p>
                </div>
              }
            />
          </FilterNavigationProvider>

          <CtaBlock
            headline={tl.cta.headline.replace('{city}', cityName)}
            description={tl.cta.description}
          />
        </div>
      </div>
    </>
  )
}

function CityHubSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-4 py-16 sm:px-6">
      <div className="h-4 w-48 rounded bg-[var(--color-neutral-100)]" />
      <div className="mt-8 h-32 rounded-2xl bg-[var(--color-neutral-100)]" />
      <div className="mt-6 h-48 rounded-2xl bg-[var(--color-neutral-100)]" />
    </div>
  )
}

export default function CityHubPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<CityHubSkeleton />}>
      <CityHubPageInner params={params} />
    </Suspense>
  )
}

async function CityHubPageInner({ params }: { params: Params }) {
  const { country, city } = await params
  return <CityHubContent countryKey={country} cityKey={city} />
}
