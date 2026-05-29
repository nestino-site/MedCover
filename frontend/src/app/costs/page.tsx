import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CircleDollarSign, Pill, MapPin, Stethoscope } from 'lucide-react'
import { HubHero } from '@/components/hubs/HubHero'
import { CostGuidesList, CostGuidesListSkeleton } from '@/components/costs/CostGuidesList'
import {
  CostComparisonGrid,
  CostComparisonGridSkeleton,
} from '@/components/costs/CostComparisonGrid'
import { FilterBar } from '@/components/filters/FilterBar'
import { FilterChips } from '@/components/filters/FilterChips'
import { SortSelect } from '@/components/filters/SortSelect'
import { FilterNavigationProvider } from '@/components/filters/filter-navigation'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { JsonLd } from '@/components/shared/JsonLd'
import { CrossHubNav } from '@/components/hubs/CrossHubNav'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { buildFAQPage } from '@/lib/schema/base'
import { countryMeta } from '@/lib/content/hubs'
import { treatmentCategories } from '@/lib/content/treatments'
import type { FaqItem } from '@/lib/api/types'
import type { LucideIcon } from 'lucide-react'

const locale = activeLocale
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(locale)
  return {
    title: t.meta.costs.title,
    description: t.meta.costs.description,
    alternates: { canonical: `${SITE_URL}/costs/` },
  }
}

const costFaqs: FaqItem[] = [
  {
    question: 'How much does IVF cost in Europe?',
    answer:
      'IVF in Europe ranges from €1,900 in North Macedonia to €3,200+ in Spain and Portugal, depending on the clinic, treatment protocol, and whether donor eggs are used.',
  },
  {
    question: 'Why is IVF cheaper abroad than in the UK or US?',
    answer:
      'Lower labour costs, different regulatory frameworks, and higher procedure volumes in destination countries allow clinics to charge significantly less without compromising outcomes.',
  },
  {
    question: "What's typically included in the quoted IVF price?",
    answer:
      'Most destination clinics quote a base price covering egg retrieval, fertilisation, embryo transfer, and monitoring. Medications, donor eggs, genetic testing (PGT-A), and accommodation are usually additional.',
  },
  {
    question: 'Are there hidden costs to watch for?',
    answer:
      'Yes — ask clinics about medication costs (€500–€2,000 extra), consultation fees, freezing/storage of spare embryos, and return-trip costs if a frozen transfer is needed.',
  },
]

const costFactors: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: CircleDollarSign,
    title: 'Own eggs vs. donor eggs',
    description:
      'Donor egg IVF typically costs 40–60% more than using your own eggs, due to donor compensation, additional monitoring, and synchronisation protocols.',
  },
  {
    icon: Pill,
    title: 'Medications',
    description:
      'Stimulation medications are often quoted separately. Expect €500–€2,000 depending on the protocol — always ask if meds are included in the headline price.',
  },
  {
    icon: MapPin,
    title: 'Clinic tier and city',
    description:
      'Internationally accredited clinics in major capitals charge more than regional clinics. Both can achieve excellent outcomes — Truth Scores help you compare fairly.',
  },
  {
    icon: Stethoscope,
    title: 'Diagnostics and extras',
    description:
      'Pre-cycle tests, semen analysis, embryo freezing, PGT-A genetic screening, and follow-up consultations all add to the total — budget an extra €500–€1,500 for a realistic picture.',
  },
]

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'IVF Treatment Costs Abroad — What Patients Pay',
    description:
      'Verified IVF cost ranges across 6 European countries. Real prices from patient data.',
    url: `${SITE_URL}/costs/`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  },
  { '@context': 'https://schema.org', ...buildFAQPage(costFaqs) },
]

export default function CostsPage() {
  const treatmentOptions = treatmentCategories.map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const countryOptions = Object.entries(countryMeta).map(([slug, meta]) => ({
    value: slug.replace(/^guides\//, '').replace(/-ivf-guide$/, ''),
    label: meta.name,
    icon: meta.flag,
  }))

  const sortOptions = [
    { value: 'cost-asc', label: 'Cost: low → high' },
    { value: 'alpha', label: 'A – Z' },
  ]

  return (
    <>
      <JsonLd schema={schemas} />
      <HubHero
        variant="compact"
        eyebrow="Cost Transparency"
        title="IVF Treatment Costs Abroad"
        subtitle="Real cost ranges from verified patient data — not clinic brochures. Compare 6 countries side by side."
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <FilterNavigationProvider>
          <Suspense fallback={<CostGuidesListSkeleton />}>
            <CostGuidesList locale={locale} />
          </Suspense>

          <section aria-labelledby="cost-comparison-heading" className="mt-12">
            <h2
              id="cost-comparison-heading"
              className="mb-4 text-lg font-bold text-[var(--color-primary-950)]"
            >
              Cost comparison
            </h2>
            <Suspense fallback={null}>
              <FilterBar>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                  <FilterChips
                    options={treatmentOptions}
                    paramKey="treatment"
                    label="Treatment"
                    allLabel="All treatments"
                  />
                  <FilterChips
                    options={countryOptions}
                    paramKey="country"
                    label="Country"
                    allLabel="All countries"
                  />
                </div>
                <SortSelect options={sortOptions} defaultValue="cost-asc" label="Sort costs" />
              </FilterBar>
            </Suspense>
            <CostComparisonGrid locale={locale} />
          </section>
        </FilterNavigationProvider>

        <section aria-labelledby="cost-factors-heading" className="mt-12">
          <h2
            id="cost-factors-heading"
            className="text-lg font-bold text-[var(--color-primary-950)]"
          >
            What affects the price?
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {costFactors.map((factor) => {
              const Icon = factor.icon
              return (
                <div
                  key={factor.title}
                  className="flex gap-3 rounded-lg border border-[var(--color-border)] bg-white p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)]">
                    <Icon size={18} className="text-[var(--color-primary-700)]" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-primary-950)]">
                      {factor.title}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-neutral-600)]">
                      {factor.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section aria-labelledby="faq-heading" className="mt-12 border-t border-[var(--color-border)] pt-8">
          <h2
            id="faq-heading"
            className="mb-4 text-lg font-bold text-[var(--color-primary-950)]"
          >
            Frequently asked questions
          </h2>
          <div data-speakable="true">
            <FaqAccordion faqs={costFaqs} />
          </div>
        </section>

        <CrossHubNav locale={locale} hubId="costs" className="mt-10" />
      </div>

      <CtaBlock
        headline="Get a Personalised Cost Estimate"
        description="Tell us your situation — we'll match you with verified clinics and realistic cost breakdowns."
      />
    </>
  )
}
