import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CitiesList, CitiesListSkeleton } from '@/components/hubs/CitiesList'
import { HubHero } from '@/components/hubs/HubHero'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { FilterBar } from '@/components/filters/FilterBar'
import { FilterChips } from '@/components/filters/FilterChips'
import { SortSelect } from '@/components/filters/SortSelect'
import { FilterNavigationProvider } from '@/components/filters/filter-navigation'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { JsonLd } from '@/components/shared/JsonLd'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { countryMeta, staticCitiesPerCountry, slugToLabel } from '@/lib/content/hubs'
import { treatmentCategories } from '@/lib/content/treatments'
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
    question: 'Which city is best for treatment abroad?',
    answer:
      'The best city depends on your treatment and priorities. Barcelona and Athens are popular for large, internationally accredited clinics. Prague offers a strong balance of cost and quality. Skopje is the most affordable option for IVF. Each city hub on MedCover breaks down clinic-level scores so you can compare within a city, not just across countries.',
  },
  {
    question: 'How many trips will I need to make for treatment abroad?',
    answer:
      'Trip count varies by treatment. IVF typically requires 2–3 visits: an initial consultation (1–2 days), a main cycle (10–14 days), and a possible frozen embryo transfer (3–5 days). Many clinics coordinate remote monitoring with your local GP to minimise travel.',
  },
  {
    question: 'How do I choose between cities in the same country?',
    answer:
      'Within a country, cities differ by clinic density, cost, and travel convenience. In Spain, Barcelona and Madrid have the largest clinic networks, while Valencia offers lower prices with fewer options. City hubs include clinic counts, verified patient costs, and travel logistics.',
  },
  {
    question: 'Are clinics in smaller cities less experienced than those in capitals?',
    answer:
      'Not necessarily. Some highly-rated clinics operate in secondary cities and specialise entirely in international patients. MedCover Truth Scores are based on patient experience — a smaller clinic in a secondary city can score higher than a large capital clinic.',
  },
  {
    question: 'What travel logistics should I plan for treatment abroad?',
    answer:
      'Plan for accommodation near the clinic, check flight frequency from your home city, and budget for follow-up trips. City hubs on MedCover include notes from patients on transport, accommodation areas, and local logistics.',
  },
]

const treatmentOptions = treatmentCategories.map((c) => ({
  value: c.id,
  label: c.name,
}))

export default function CitiesHubPage() {
  const t = getDictionary(locale)

  const countryOptions = Object.entries(countryMeta).map(([slug, meta]) => ({
    value: slug.replace(/^guides\//, '').replace(/-ivf-guide$/, ''),
    label: meta.name,
    icon: meta.flag,
  }))

  const sortOptions = [
    { value: 'country', label: 'By country' },
    { value: 'alpha', label: 'A – Z (city name)' },
  ]

  const schemaItems = Object.entries(staticCitiesPerCountry).flatMap(([countryKey, cities]) => {
    const meta = countryMeta[`guides/${countryKey}-ivf-guide`]
    if (!meta) return []
    return cities.map((cityKey) => ({
      name: `Medical travel in ${slugToLabel(cityKey)}, ${meta.name}`,
      url: `${SITE_URL}/cities/${countryKey}/${cityKey}/`,
      description: `City medical travel hub for ${slugToLabel(cityKey)}, ${meta.name}`,
    }))
  })

  const schema = buildCollectionPage({
    url: `${SITE_URL}/cities/`,
    name: t.meta.cities.title,
    description: t.meta.cities.description,
    items: schemaItems,
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
        variant="compact"
        eyebrow={t.hubs.cities.hero.eyebrow}
        title={t.hubs.cities.hero.title}
        subtitle={t.hubs.cities.hero.subtitle}
      />
      <HubPageLayout
        locale={locale}
        hubId="cities"
        title={t.hubs.cities.title}
        description={t.hubs.cities.description}
        showHeading={false}
      >
        <FilterNavigationProvider>
          <div id="cities">
            <Suspense fallback={null}>
              <FilterBar>
                <FilterChips
                  options={countryOptions}
                  paramKey="country"
                  label="Country"
                  allLabel="All countries"
                />
                <FilterChips
                  options={treatmentOptions}
                  paramKey="treatment"
                  label={t.hubs.cities.treatmentFilterLabel}
                  allLabel={t.hubs.cities.treatmentFilterAll}
                />
                <SortSelect options={sortOptions} defaultValue="country" label="Sort cities" />
              </FilterBar>
            </Suspense>
            <Suspense fallback={<CitiesListSkeleton />}>
              <CitiesList locale={locale} />
            </Suspense>
          </div>
        </FilterNavigationProvider>

        <div className="mt-14 border-t border-[var(--color-border)] pt-8">
          <FaqAccordion faqs={cityFaqs} title={t.hubs.cities.faqTitle} />
        </div>
      </HubPageLayout>
    </>
  )
}
