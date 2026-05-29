import type { Metadata } from 'next'
import { Suspense } from 'react'
import { HubHero } from '@/components/hubs/HubHero'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { TreatmentsList, TreatmentsListSkeleton } from '@/components/hubs/TreatmentsList'
import { FilterBar } from '@/components/filters/FilterBar'
import { FilterChips } from '@/components/filters/FilterChips'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { JsonLd } from '@/components/shared/JsonLd'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { buildCollectionPage } from '@/lib/schema/hub-collection'
import type { FaqItem } from '@/lib/api/types'

const locale = activeLocale
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(locale)
  return {
    title: t.meta.treatments.title,
    description: t.meta.treatments.description,
    alternates: { canonical: `${SITE_URL}/treatments/` },
    openGraph: {
      title: t.meta.treatments.title,
      description: t.meta.treatments.description,
      url: `${SITE_URL}/treatments/`,
      type: 'website',
    },
  }
}

const treatmentFaqs: FaqItem[] = [
  {
    question: 'Which medical treatments are available abroad through MedCover?',
    answer:
      'MedCover currently has fully active guides for IVF (in vitro fertilisation), covering 6 countries, 20+ cities, and 80+ verified clinics. Dental treatment, hair transplant, and oncology guides are in development. All published guides are sourced from direct patient interviews — not clinic submissions.',
  },
  {
    question: 'Why do people travel abroad for IVF?',
    answer:
      'The main reasons are cost, waiting times, and treatment access. IVF in European destination countries costs €1,900–€3,500, compared to £5,000–£8,000 in the UK or $15,000–$25,000 in the US. Some patients also travel to access donor egg treatment, which is restricted or unavailable in their home country.',
  },
  {
    question: 'How does MedCover verify patient data?',
    answer:
      'MedCover collects data through direct patient interviews — not clinic-provided statistics or review platforms that clinics can influence. Patients verify their treatment, clinic, and cost details. Truth Scores reflect aggregated patient feedback on cost transparency, communication quality, clinical outcome, and aftercare.',
  },
  {
    question: 'What treatments are coming to MedCover next?',
    answer:
      'After IVF, MedCover is building verified guides for dental treatment abroad, hair transplant procedures, and oncology second opinions. Each new category will follow the same methodology: direct patient interviews before any clinic information is published.',
  },
  {
    question: 'How do I know if a treatment abroad is right for me?',
    answer:
      'Start by reading country and city guides for your treatment on MedCover to understand real costs, common patient experiences, and what to watch out for. Then compare clinics by Truth Score, not price alone. For complex treatments like IVF, speak to your home consultant about protocol options before committing to a clinic abroad.',
  },
]

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

async function TreatmentsResults({ searchParams }: { searchParams: SearchParams }) {
  const { status } = await searchParams
  const statusFilter = typeof status === 'string' ? status : undefined

  return <TreatmentsList locale={locale} status={statusFilter} />
}

export default function TreatmentsHubPage({ searchParams }: { searchParams: SearchParams }) {
  const t = getDictionary(locale)

  const statusOptions = [
    { value: 'active', label: t.hubs.treatments.activeBadge },
    { value: 'coming_soon', label: t.hubs.treatments.soonBadge },
  ]

  const schema = buildCollectionPage({
    url: `${SITE_URL}/treatments/`,
    name: t.meta.treatments.title,
    description: t.meta.treatments.description,
    items: [
      {
        name: 'IVF abroad',
        url: `${SITE_URL}/treatments/ivf/`,
        description: 'IVF (in vitro fertilisation) abroad — 6 countries, 20+ cities, 80+ verified clinics',
      },
    ],
    faqs: treatmentFaqs,
    breadcrumbs: [
      { name: 'Home', slug: '/', position: 1 },
      { name: 'Treatments', slug: '/treatments/', position: 2 },
    ],
  })

  return (
    <>
      <JsonLd schema={schema} />
      <HubHero
        eyebrow={t.hubs.treatments.hero.eyebrow}
        title={t.hubs.treatments.hero.title}
        subtitle={t.hubs.treatments.hero.subtitle}
        highlights={t.hubs.treatments.hero.highlights}
        ctas={[
          { label: t.hubs.treatments.hero.ctaPrimary, href: '/treatments/ivf/', variant: 'primary' },
          { label: t.hubs.treatments.hero.ctaSecondary, href: '/countries/', variant: 'outline' },
        ]}
        trust={t.hubs.treatments.hero.trust}
      />
      <HubPageLayout
        locale={locale}
        hubId="treatments"
        title={t.hubs.treatments.title}
        description={t.hubs.treatments.description}
        showHeading={false}
      >
        <Suspense fallback={null}>
          <FilterBar>
            <FilterChips
              options={statusOptions}
              paramKey="status"
              label="Status"
              allLabel="All treatments"
            />
          </FilterBar>
        </Suspense>
        <Suspense fallback={<TreatmentsListSkeleton />}>
          <TreatmentsResults searchParams={searchParams} />
        </Suspense>

        <div className="mt-14 border-t border-[var(--color-border)] pt-2">
          <FaqAccordion faqs={treatmentFaqs} title="Medical treatment abroad — common questions" />
        </div>
      </HubPageLayout>
    </>
  )
}
