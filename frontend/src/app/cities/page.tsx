import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CitiesList, CitiesListSkeleton } from '@/components/hubs/CitiesList'
import { HubHero } from '@/components/hubs/HubHero'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { FilterBar } from '@/components/filters/FilterBar'
import { FilterChips } from '@/components/filters/FilterChips'
import { SortSelect } from '@/components/filters/SortSelect'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { JsonLd } from '@/components/shared/JsonLd'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { countryMeta } from '@/lib/content/hubs'
import { buildCollectionPage } from '@/lib/schema/hub-collection'
import type { FaqItem } from '@/lib/api/types'

const locale = activeLocale
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(locale)
  return {
    title: t.meta.cities.title,
    description: t.meta.cities.description,
    alternates: { canonical: `${SITE_URL}/cities/` },
    openGraph: {
      title: t.meta.cities.title,
      description: t.meta.cities.description,
      url: `${SITE_URL}/cities/`,
      type: 'website',
    },
  }
}

const cityFaqs: FaqItem[] = [
  {
    question: 'Which city is best for IVF abroad?',
    answer:
      'The best city depends on your priorities. Barcelona and Athens are popular for their large, internationally accredited clinics and established track records with international patients. Prague offers a strong balance of cost and quality. Skopje and Tirana are the most affordable options. Each city guide on MedCover breaks down clinic-level scores so you can compare within a city, not just across countries.',
  },
  {
    question: 'How many trips will I need to make for IVF abroad?',
    answer:
      'Most IVF protocols abroad require 2–3 visits. The first is a consultation and initial tests (1–2 days). The main treatment cycle requires 10–14 days for stimulation monitoring and egg retrieval. A frozen embryo transfer is a shorter trip of 3–5 days. Many clinics coordinate remote monitoring with your local GP to minimise travel.',
  },
  {
    question: 'How do I choose between cities in the same country?',
    answer:
      'Within a country, cities differ by clinic density, cost, and travel convenience. In Spain, for example, Barcelona and Madrid have the largest clinic networks, while Valencia and Seville offer lower prices with fewer options. MedCover city guides include clinic counts, verified patient costs, and airport and accommodation information to help you compare directly.',
  },
  {
    question: 'Are IVF clinics in smaller cities less experienced than those in capitals?',
    answer:
      'Not necessarily. Some highly-rated clinics operate in secondary cities and specialise entirely in international patients. MedCover Truth Scores are based on patient experience — a smaller clinic in a secondary city can score higher than a large clinic in a capital if patients report better communication, cost transparency, and outcomes.',
  },
  {
    question: 'What travel logistics should I plan for IVF abroad?',
    answer:
      'Plan for accommodation near the clinic (most offer recommendations), check flight frequency and cost from your home city, and budget for both the main cycle and a potential frozen embryo transfer trip. City guides on MedCover include notes from patients on transport, accommodation areas, and local logistics.',
  },
]

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

async function CitiesResults({ searchParams }: { searchParams: SearchParams }) {
  const { country, sort, q } = await searchParams
  const countryFilter = typeof country === 'string' ? country : undefined
  const sortFilter = typeof sort === 'string' ? sort : undefined
  const qFilter = typeof q === 'string' ? q : undefined

  return (
    <CitiesList
      locale={locale}
      country={countryFilter}
      sort={sortFilter}
      q={qFilter}
    />
  )
}

export default function CitiesHubPage({ searchParams }: { searchParams: SearchParams }) {
  const t = getDictionary(locale)

  const heroStats = [
    { value: '20+', label: t.hubs.cities.hero.statCities },
    { value: '6', label: t.hubs.cities.hero.statCountries },
    { value: '500+', label: t.hubs.cities.hero.statData },
  ]

  const countryOptions = Object.entries(countryMeta).map(([slug, meta]) => ({
    value: slug.replace(/^guides\//, '').replace(/-ivf-guide$/, ''),
    label: meta.name,
    icon: meta.flag,
  }))

  const sortOptions = [
    { value: 'country', label: 'By country' },
    { value: 'alpha', label: 'A – Z (city name)' },
  ]

  const schema = buildCollectionPage({
    url: `${SITE_URL}/cities/`,
    name: t.meta.cities.title,
    description: t.meta.cities.description,
    items: [
      { name: 'IVF in Barcelona', url: `${SITE_URL}/cities/spain/barcelona/`, description: 'IVF clinics and verified patient guides for Barcelona, Spain' },
      { name: 'IVF in Athens', url: `${SITE_URL}/cities/greece/athens/`, description: 'IVF clinics and verified patient guides for Athens, Greece' },
      { name: 'IVF in Prague', url: `${SITE_URL}/cities/czech-republic/prague/`, description: 'IVF in Prague — affordable EU-regulated treatment with verified data' },
      { name: 'IVF in Skopje', url: `${SITE_URL}/cities/north-macedonia/skopje/`, description: 'IVF in Skopje — lowest-cost city IVF in Europe from €1,900' },
      { name: 'IVF in Tirana', url: `${SITE_URL}/cities/albania/tirana/`, description: 'IVF in Tirana, Albania — emerging affordable destination' },
    ],
    faqs: cityFaqs,
    breadcrumbs: [
      { name: 'Home', slug: '/', position: 1 },
      { name: 'Cities', slug: '/cities/', position: 2 },
    ],
  })

  return (
    <>
      <JsonLd schema={schema} />
      <HubHero
        eyebrow={t.hubs.cities.hero.eyebrow}
        title={t.hubs.cities.hero.title}
        subtitle={t.hubs.cities.hero.subtitle}
        stats={heroStats}
        highlights={t.hubs.cities.hero.highlights}
        ctas={[
          { label: t.hubs.cities.hero.ctaPrimary, href: '#cities', variant: 'primary' },
          { label: t.hubs.cities.hero.ctaSecondary, href: '/countries/', variant: 'outline' },
        ]}
        trust={t.hubs.cities.hero.trust}
      />
      <HubPageLayout
        locale={locale}
        hubId="cities"
        title={t.hubs.cities.title}
        description={t.hubs.cities.description}
        showHeading={false}
      >
        <div id="cities">
          <Suspense fallback={null}>
            <FilterBar>
              <FilterChips
                options={countryOptions}
                paramKey="country"
                label="Country"
                allLabel="All countries"
              />
              <SortSelect options={sortOptions} defaultValue="country" label="Sort cities" />
            </FilterBar>
          </Suspense>
          <Suspense fallback={<CitiesListSkeleton />}>
            <CitiesResults searchParams={searchParams} />
          </Suspense>
        </div>

        <div className="mt-14 border-t border-[var(--color-border)] pt-2">
          <FaqAccordion faqs={cityFaqs} title="IVF city guides — common questions" />
        </div>
      </HubPageLayout>
    </>
  )
}
