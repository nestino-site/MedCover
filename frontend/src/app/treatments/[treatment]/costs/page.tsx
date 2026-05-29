import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { treatmentCategories } from '@/lib/content/treatments'
import { countryMeta } from '@/lib/content/hubs'
import { CostComparisonGrid } from '@/components/costs/CostComparisonGrid'
import { CostGuidesList, CostGuidesListSkeleton } from '@/components/costs/CostGuidesList'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { JsonLd } from '@/components/shared/JsonLd'
import { buildTreatmentPageSchemas } from '@/lib/schema/treatment-page'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import type { FaqItem } from '@/lib/api/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'
const locale = activeLocale

type Params = Promise<{ treatment: string }>

export function generateStaticParams() {
  return treatmentCategories
    .filter((c) => c.status === 'active')
    .map((c) => ({ treatment: c.id }))
}

function getTreatmentBySlug(slug: string) {
  return treatmentCategories.find((c) => c.id === slug) ?? null
}

const COST_FAQS: Record<string, FaqItem[]> = {
  ivf: [
    {
      question: 'Which European country has the cheapest IVF?',
      answer:
        'North Macedonia offers the lowest IVF prices in Europe, starting from €1,900. Czech Republic (from €2,400) and Turkey (from €2,600) are also significantly cheaper than the UK or US.',
    },
    {
      question: 'Is IVF with donor eggs more expensive?',
      answer:
        'Yes — donor egg IVF typically costs 40–60% more than using your own eggs due to donor compensation, synchronisation protocols, and additional monitoring.',
    },
    {
      question: 'What hidden costs should I budget for?',
      answer:
        'Medications (€500–€2,000), genetic testing (PGT-A €1,000–€2,500), frozen embryo transfer cycles, and return travel. Always ask for a complete cost breakdown before committing.',
    },
  ],
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { treatment } = await params
  const cat = getTreatmentBySlug(treatment)
  if (!cat) return { title: 'Treatment Costs | MedCover' }

  const year = new Date().getFullYear()
  const title = `${cat.name} Cost Comparison ${year}: 6 Countries Side by Side | MedCover`
  const description = `Compare ${cat.name} costs across 6 European countries — verified patient data. From €1,900 in North Macedonia to €3,200+ in Spain.`
  const canonicalUrl = `${SITE_URL}/treatments/${treatment}/costs/`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description, url: canonicalUrl, type: 'website', siteName: 'MedCover' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function TreatmentCostsPage({ params }: { params: Params }) {
  const { treatment } = await params
  const cat = getTreatmentBySlug(treatment)
  if (!cat) notFound()

  const t = getDictionary(locale)
  const faqs = COST_FAQS[treatment] ?? []
  const canonicalUrl = `${SITE_URL}/treatments/${treatment}/costs/`

  const breadcrumbs = [
    { name: t.breadcrumb.home, slug: '/', position: 1 },
    { name: t.nav.treatments, slug: '/treatments', position: 2 },
    { name: cat.name, slug: `/treatments/${treatment}`, position: 3 },
    { name: 'Costs', slug: `/treatments/${treatment}/costs`, position: 4 },
  ]

  const schemas = buildTreatmentPageSchemas({
    treatmentId: treatment,
    canonicalUrl,
    metaTitle: `${cat.name} Cost Comparison | MedCover`,
    metaDescription: `Real ${cat.name} costs across 6 countries from verified patient data.`,
    countries: Object.entries(countryMeta).map(([slug, meta]) => ({
      name: meta.name,
      href: localizedPath(`/${slug}`, locale),
      countryKey: slug.replace(/^guides\//, '').replace(/-ivf-guide$/, ''),
    })),
    faqs,
  })

  return (
    <>
      <JsonLd schema={schemas} />
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbs.slice(1)} homeHref={localizedPath('/', locale)} />

        <div className="mt-6 space-y-12">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/treatments/${treatment}`}
                className="text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
              >
                ← {cat.name}
              </Link>
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--color-primary-950)]">
              {cat.name} Cost Comparison
            </h1>
            <p className="mt-3 text-lg text-[var(--color-neutral-600)]" data-speakable="true">
              Real cost ranges from verified patient data — not clinic brochures.
              Compare {Object.keys(countryMeta).length} countries side by side.
            </p>
          </div>

          {/* Comparison grid */}
          <section aria-labelledby="comparison-heading">
            <h2
              id="comparison-heading"
              className="mb-6 text-2xl font-bold tracking-tight text-[var(--color-primary-950)]"
            >
              Cost by country
            </h2>
            <CostComparisonGrid locale={locale} />
          </section>

          {/* Cost guides */}
          <Suspense fallback={<CostGuidesListSkeleton />}>
            <CostGuidesList locale={locale} treatment={treatment} />
          </Suspense>

          {/* FAQ */}
          {faqs.length > 0 && (
            <section aria-labelledby="faq-heading">
              <h2
                id="faq-heading"
                className="mb-6 text-2xl font-bold tracking-tight text-[var(--color-primary-950)]"
              >
                Cost FAQs
              </h2>
              <div data-speakable="true">
                <FaqAccordion faqs={faqs} />
              </div>
            </section>
          )}

          {/* Back link */}
          <div className="flex gap-3">
            <Link
              href={`/treatments/${treatment}`}
              className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-primary-800)] transition-colors hover:bg-[var(--color-primary-50)]"
            >
              ← Back to {cat.name}
            </Link>
            <Link
              href="/costs/"
              className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-primary-800)] transition-colors hover:bg-[var(--color-primary-50)]"
            >
              All cost guides →
            </Link>
          </div>
        </div>
      </div>

      <CtaBlock
        headline="Get a Personalised Cost Estimate"
        description="Tell us your situation — we'll match you with verified clinics and realistic cost breakdowns."
      />
    </>
  )
}
