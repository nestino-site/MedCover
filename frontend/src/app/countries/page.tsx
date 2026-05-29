import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CountriesList, CountriesListSkeleton } from '@/components/hubs/CountriesList'
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
import { countryMeta, getCountryKeyFromSlug } from '@/lib/content/hubs'
import { treatmentCategories } from '@/lib/content/treatments'
import { buildCollectionPage } from '@/lib/schema/hub-collection'
import type { FaqItem } from '@/lib/api/types'

const locale = activeLocale
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(locale)
  return {
    title: t.meta.countries.title,
    description: t.meta.countries.description,
    alternates: { canonical: `${SITE_URL}/countries/` },
    openGraph: {
      title: t.meta.countries.title,
      description: t.meta.countries.description,
      url: `${SITE_URL}/countries/`,
      type: 'website',
    },
  }
}

const countryFaqs: FaqItem[] = [
  {
    question: 'Which countries are best for medical treatment abroad?',
    answer:
      'The best country depends on your treatment. For IVF, popular European destinations include Spain, Greece, Czech Republic, Turkey, Portugal, and North Macedonia. Spain and Greece have high clinic density; Czech Republic balances quality and cost; North Macedonia is the most affordable. Each country hub on MedCover shows available treatments, verified clinics, and patient data.',
  },
  {
    question: 'How much does treatment abroad cost compared to the UK or US?',
    answer:
      'Costs vary by treatment and destination. IVF in European countries typically ranges from €1,900–€3,500 per cycle, compared to £5,000–£8,000 in the UK or $15,000–$25,000 in the US. MedCover shows what patients actually paid — including medication and travel — not clinic brochure prices.',
  },
  {
    question: 'Is treatment abroad safe?',
    answer:
      'Quality varies by clinic, not by country. MedCover Truth Scores rank clinics by what patients actually experienced: cost transparency, communication, laboratory quality, and outcomes. Accredited clinics in EU destinations operate under regulatory frameworks and routinely treat international patients.',
  },
  {
    question: 'What treatments are available on MedCover?',
    answer:
      'IVF & Fertility is live across all six destinations. Dental, hair transplant, and cosmetic surgery categories are coming soon. Each country card shows which treatments are available — filter by treatment to find matching destinations.',
  },
  {
    question: 'What should I ask a clinic before committing to treatment abroad?',
    answer:
      'Ask for a written protocol, an itemised cost breakdown, outcome data by age group, quality certifications, and what happens if treatment fails. MedCover country and city hubs include verified patient feedback on exactly these questions.',
  },
]

const treatmentOptions = treatmentCategories.map((c) => ({
  value: c.id,
  label: c.name,
}))

export default function CountriesHubPage() {
  const t = getDictionary(locale)

  const sortOptions = [
    { value: 'cost-asc', label: 'Cost: low → high' },
    { value: 'cost-desc', label: 'Cost: high → low' },
    { value: 'alpha', label: 'A – Z' },
    { value: 'clinics', label: 'Most clinics' },
  ]

  const schemaItems = Object.entries(countryMeta).map(([slug, meta]) => {
    const countryKey = getCountryKeyFromSlug(slug) ?? ''
    return {
      name: `Medical travel in ${meta.name}`,
      url: `${SITE_URL}/countries/${countryKey}/`,
      description: `${meta.name} medical travel hub — ${meta.tagline}, ${meta.cost}, ${meta.clinics}`,
    }
  })

  const schema = buildCollectionPage({
    url: `${SITE_URL}/countries/`,
    name: t.meta.countries.title,
    description: t.meta.countries.description,
    items: schemaItems,
    faqs: countryFaqs,
    breadcrumbs: [
      { name: 'Home', slug: '/', position: 1 },
      { name: 'Countries', slug: '/countries/', position: 2 },
    ],
  })

  return (
    <>
      <JsonLd schema={schema} />
      <HubHero
        variant="compact"
        eyebrow={t.hubs.countries.hero.eyebrow}
        title={t.hubs.countries.hero.title}
        subtitle={t.hubs.countries.hero.subtitle}
      />
      <HubPageLayout
        locale={locale}
        hubId="countries"
        title={t.hubs.countries.title}
        description={t.hubs.countries.description}
        showHeading={false}
      >
        <FilterNavigationProvider>
          <div id="destinations">
            <Suspense fallback={null}>
              <FilterBar>
                <FilterChips
                  options={treatmentOptions}
                  paramKey="treatment"
                  label={t.hubs.countries.treatmentFilterLabel}
                  allLabel={t.hubs.countries.treatmentFilterAll}
                />
                <SortSelect options={sortOptions} defaultValue="cost-asc" label="Sort countries" />
              </FilterBar>
            </Suspense>
            <Suspense fallback={<CountriesListSkeleton />}>
              <CountriesList locale={locale} />
            </Suspense>
          </div>
        </FilterNavigationProvider>

        <div className="mt-14 border-t border-[var(--color-border)] pt-8">
          <FaqAccordion faqs={countryFaqs} title={t.hubs.countries.faqTitle} />
        </div>
      </HubPageLayout>
    </>
  )
}
