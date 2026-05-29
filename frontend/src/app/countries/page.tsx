import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CountriesList, CountriesListSkeleton } from '@/components/hubs/CountriesList'
import { HubHero } from '@/components/hubs/HubHero'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { FilterBar } from '@/components/filters/FilterBar'
import { FilterChips } from '@/components/filters/FilterChips'
import { SortSelect } from '@/components/filters/SortSelect'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { JsonLd } from '@/components/shared/JsonLd'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
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
    question: 'Which European countries are best for IVF treatment abroad?',
    answer:
      'The most popular European IVF destinations are Spain, Greece, Czech Republic, North Macedonia, Albania, and Georgia. Spain and Greece have high clinic density and strong EU regulatory oversight; Czech Republic offers a balance of quality and cost; North Macedonia and Albania are the most affordable, starting from €1,900 per cycle.',
  },
  {
    question: 'How much does IVF cost abroad compared to the UK or US?',
    answer:
      'IVF in European destination countries typically costs €1,900–€3,500 per cycle, compared to £5,000–£8,000 in the UK or $15,000–$25,000 in the US. Savings are driven by lower labour costs and clinic volume — not lower clinical standards. Verified patient data on MedCover shows what patients actually paid, including medication and travel.',
  },
  {
    question: 'Is IVF treatment abroad safe?',
    answer:
      'Quality varies by clinic, not by country. MedCover Truth Scores rank clinics by what patients actually experienced: cost transparency, communication, laboratory quality, and outcomes. Accredited clinics in Spain, Greece, and Czech Republic operate under EU regulatory frameworks and routinely treat international patients.',
  },
  {
    question: 'Do I need a visa to travel for IVF in Europe?',
    answer:
      'EU/EEA and UK passport holders can travel freely within the Schengen Area without a visa. Non-EU patients should check entry requirements for each destination country. Most IVF cycles require 2–3 trips of 5–10 days each.',
  },
  {
    question: 'What should I ask a clinic before committing to IVF abroad?',
    answer:
      'Ask for a written protocol, an itemised cost breakdown including medication, live birth rates by age group, laboratory quality certifications, and what happens if the cycle fails. MedCover country guides include verified patient feedback on exactly these questions.',
  },
]

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function CountriesHubPage({ searchParams }: { searchParams: SearchParams }) {
  const { treatment, sort } = await searchParams
  const t = getDictionary(locale)

  const treatmentFilter = typeof treatment === 'string' ? treatment : undefined
  const sortFilter = typeof sort === 'string' ? sort : undefined

  const heroStats = [
    { value: '6', label: t.hubs.countries.hero.statCountries },
    { value: '5+', label: t.hubs.countries.hero.statTreatments },
    { value: '80+', label: t.hubs.countries.hero.statClinics },
    { value: '500+', label: t.hubs.countries.hero.statInterviews },
  ]

  const treatmentOptions = treatmentCategories.map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const sortOptions = [
    { value: 'cost-asc', label: 'Cost: low → high' },
    { value: 'cost-desc', label: 'Cost: high → low' },
    { value: 'alpha', label: 'A – Z' },
    { value: 'clinics', label: 'Most clinics' },
  ]

  const schema = buildCollectionPage({
    url: `${SITE_URL}/countries/`,
    name: t.meta.countries.title,
    description: t.meta.countries.description,
    items: [
      { name: 'IVF in Spain', url: `${SITE_URL}/countries/spain/`, description: 'IVF treatment in Spain — verified costs, clinics, and patient guides' },
      { name: 'IVF in Greece', url: `${SITE_URL}/countries/greece/`, description: 'IVF treatment in Greece — costs, clinics, and patient guides' },
      { name: 'IVF in Czech Republic', url: `${SITE_URL}/countries/czech-republic/`, description: 'IVF in Czech Republic — EU-regulated treatment with verified patient data' },
      { name: 'IVF in North Macedonia', url: `${SITE_URL}/countries/north-macedonia/`, description: 'IVF in North Macedonia — lowest-cost IVF in Europe from €1,900' },
      { name: 'IVF in Albania', url: `${SITE_URL}/countries/albania/`, description: 'IVF in Albania — emerging affordable destination with verified clinics' },
      { name: 'IVF in Georgia', url: `${SITE_URL}/countries/georgia/`, description: 'IVF in Georgia — destination guide and verified clinic scores' },
    ],
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
        eyebrow={t.hubs.countries.hero.eyebrow}
        title={t.hubs.countries.hero.title}
        subtitle={t.hubs.countries.hero.subtitle}
        stats={heroStats}
        highlights={t.hubs.countries.hero.highlights}
        ctas={[
          { label: t.hubs.countries.hero.ctaPrimary, href: '/costs/', variant: 'primary' },
          { label: t.hubs.countries.hero.ctaSecondary, href: '#destinations', variant: 'outline' },
        ]}
        trust={t.hubs.countries.hero.trust}
      />
      <HubPageLayout
        locale={locale}
        hubId="countries"
        title={t.hubs.countries.title}
        description={t.hubs.countries.description}
        showHeading={false}
        fromFilters={{ treatment: treatmentFilter }}
      >
        <div id="destinations">
          <FilterBar>
            <FilterChips
              options={treatmentOptions}
              paramKey="treatment"
              label="Treatment"
              allLabel="All treatments"
            />
            <SortSelect options={sortOptions} defaultValue="cost-asc" label="Sort countries" />
          </FilterBar>
          <Suspense fallback={<CountriesListSkeleton />}>
            <CountriesList locale={locale} treatment={treatmentFilter} sort={sortFilter ?? 'cost-asc'} />
          </Suspense>
        </div>

        <div className="mt-14 border-t border-[var(--color-border)] pt-2">
          <FaqAccordion faqs={countryFaqs} title="IVF abroad — common questions" />
        </div>
      </HubPageLayout>
    </>
  )
}
