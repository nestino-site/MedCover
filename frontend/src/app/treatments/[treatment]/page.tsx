import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { getContentListSafe, getPageBySlug, listPublishedPagesSafe } from '@/lib/api/content'
import {
  getPublishedPageMetadata,
  PublishedArticleView,
} from '@/lib/content/published-page-route'
import { buildTreatmentPageSchemas } from '@/lib/schema/treatment-page'
import { treatmentCategories } from '@/lib/content/treatments'
import {
  countryMeta,
  getFeaturedCountries,
  getCitiesForCountry,
  getCountryLandingPath,
  getRelatedGuideSlugsForTreatment,
  partitionGuides,
} from '@/lib/content/hubs'
import { loadGuideArticlesBySlugs } from '@/lib/content/guide-posts'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { SpeakableSummary } from '@/components/shared/SpeakableSummary'
import { RelatedArticles } from '@/components/shared/RelatedArticles'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { en } from '@/lib/i18n/en'
import type { FaqItem } from '@/lib/api/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'
const locale = activeLocale

type Params = Promise<{ treatment: string }>

export async function generateStaticParams() {
  const pages = await listPublishedPagesSafe()
  const fromApi = pages
    .map((page) => page.slug.replace(/^\//, ''))
    .filter((slug) => /^treatments\/[^/]+$/.test(slug))
    .map((slug) => ({ treatment: slug.replace(/^treatments\//, '') }))

  const fromCategories = treatmentCategories
    .filter((category) => category.status === 'active')
    .map((category) => ({ treatment: category.id }))

  const seen = new Set<string>()
  return [...fromApi, ...fromCategories].filter(({ treatment }) => {
    if (seen.has(treatment)) return false
    seen.add(treatment)
    return true
  })
}

function getTreatmentBySlug(slug: string) {
  return treatmentCategories.find((c) => c.id === slug) ?? null
}

const TREATMENT_FAQS: Record<string, FaqItem[]> = {
  ivf: [
    {
      question: 'Which country is cheapest for IVF in Europe?',
      answer:
        'North Macedonia has the lowest IVF costs in Europe, starting from €1,900. Czech Republic and Turkey also offer competitive pricing from €2,400–€2,600.',
    },
    {
      question: 'Is IVF abroad safe?',
      answer:
        'Yes — when choosing internationally accredited clinics with verified patient reviews. MedCover Truth Scores help you compare clinic quality across countries.',
    },
    {
      question: 'How long do I need to stay for IVF abroad?',
      answer:
        'Most IVF cycles require 2–3 visits: initial consultations (often remote), stimulation monitoring (7–10 days), and embryo transfer. Many patients combine monitoring with their home clinic.',
    },
    {
      question: 'What is included in the IVF price abroad?',
      answer:
        'Base prices usually cover egg retrieval, fertilisation, and one embryo transfer. Medications (€500–€2,000), genetic testing (PGT-A), and donor eggs are typically additional.',
    },
    {
      question: 'Can I use donor eggs abroad?',
      answer:
        'Yes — Spain, Greece, and Czech Republic are especially popular for donor egg IVF due to strong regulatory frameworks, experienced donors, and transparent consent processes.',
    },
  ],
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { treatment } = await params
  const slugPath = `/treatments/${treatment}`
  const backendPage = await getPageBySlug(slugPath)

  if (backendPage) {
    return getPublishedPageMetadata({ status: 'ok', page: backendPage }, slugPath)
  }

  const cat = getTreatmentBySlug(treatment)
  if (!cat) return { title: 'Treatment | MedCover' }

  const title = `${cat.name} Abroad: Countries, Costs & Clinics | MedCover`
  const description = `Compare ${cat.name} destinations abroad — verified patient data, real costs, and clinic Truth Scores across ${Object.keys(countryMeta).length} countries.`
  const canonicalUrl = `${SITE_URL}/treatments/${treatment}/`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description, url: canonicalUrl, type: 'website', siteName: 'MedCover' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

async function TreatmentPageContent({ treatmentSlug }: { treatmentSlug: string }) {
  const t = getDictionary(locale)
  const cat = getTreatmentBySlug(treatmentSlug)
  if (!cat) notFound()

  const allPages = await getContentListSafe()
  const { countries: countryPages, cities: cityPages } = partitionGuides(allPages, locale)
  const relatedSlugs = getRelatedGuideSlugsForTreatment(countryPages, cityPages, locale)
  const relatedArticles = await loadGuideArticlesBySlugs(relatedSlugs, allPages, locale)
  const th = en.treatmentHub

  const countryDisplays =
    countryPages.length > 0
      ? countryPages.map((p) => {
          const slug = p.slug.replace(/^\//, '')
          const meta = countryMeta[slug]
          if (!meta) return null
          const key = slug.replace(/^guides\//, '').replace(/-ivf-guide$/, '')
          return { key, meta, href: getCountryLandingPath(key, locale) }
        }).filter((c): c is NonNullable<typeof c> => c !== null)
      : getFeaturedCountries(locale).map((d) => {
          const key = d.slug.replace(/^guides\//, '').replace(/-ivf-guide$/, '')
          return { key, meta: d, href: getCountryLandingPath(key, locale) }
        })

  const faqs = TREATMENT_FAQS[treatmentSlug] ?? []
  const canonicalUrl = `${SITE_URL}/treatments/${treatmentSlug}/`

  const breadcrumbs = [
    { name: t.breadcrumb.home, slug: '/', position: 1 },
    { name: t.nav.treatments, slug: '/treatments', position: 2 },
    { name: cat.name, slug: `/treatments/${treatmentSlug}`, position: 3 },
  ]

  const schemas = buildTreatmentPageSchemas({
    treatmentId: treatmentSlug,
    canonicalUrl,
    metaTitle: `${cat.name} Abroad: Countries, Costs & Clinics | MedCover`,
    metaDescription: `Compare ${cat.name} destinations — verified patient data and real costs.`,
    countries: countryDisplays.map((c) => ({
      name: c.meta.name,
      href: c.href,
      countryKey: c.key,
    })),
    faqs,
  })

  return (
    <>
      <JsonLd schema={schemas} />
      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbs.slice(1)} homeHref={localizedPath('/', locale)} />

        <div className="mt-6 space-y-12">
          {/* Hero */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent-600)]">
              Treatment Guide
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[var(--color-primary-950)]">
              {cat.name} Abroad
            </h1>
            <SpeakableSummary label="Quick Summary">
              <p className="text-lg text-[var(--color-neutral-600)]">
                {cat.name} abroad starts from €1,900 across {countryDisplays.length} verified destinations.
                Compare clinics, real costs, and patient experiences before you decide.
              </p>
            </SpeakableSummary>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/treatments/${treatmentSlug}/costs`}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
              >
                Compare costs →
              </Link>
              <Link
                href={`/countries/?treatment=${treatmentSlug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] px-5 py-2.5 text-sm font-semibold text-[var(--color-primary-800)] transition-colors hover:bg-[var(--color-primary-100)]"
              >
                Browse countries
              </Link>
            </div>
          </div>

          <RelatedArticles
            eyebrow={th.relatedArticles.eyebrow}
            heading={th.relatedArticles.heading}
            articles={relatedArticles}
            emptyMessage={th.relatedArticles.empty}
          />

          <section aria-labelledby="countries-heading">
            <h2
              id="countries-heading"
              className="mb-4 text-xl font-bold tracking-tight text-[var(--color-primary-950)]"
            >
              Destinations offering {cat.name}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {countryDisplays.map((c) => {
                const cities = getCitiesForCountry(c.key, cityPages, locale)
                const guideHref = `/guides/${c.key}-ivf-guide`
                return (
                  <article
                    key={c.key}
                    className="flex flex-col rounded-xl border border-[var(--color-border)] bg-white"
                  >
                    <div className="flex items-center gap-3 px-4 py-4">
                      <span className="text-2xl leading-none" role="img" aria-label={c.meta.name}>
                        {c.meta.flag}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[var(--color-primary-950)]">{c.meta.name}</p>
                        <p className="text-xs text-[var(--color-neutral-500)]">
                          {c.meta.cost} · {c.meta.clinics}
                        </p>
                      </div>
                    </div>
                    {cities.length > 0 && (
                      <ul className="flex flex-wrap gap-x-2 gap-y-1 px-4 pb-3 text-xs">
                        {cities.map((city) => (
                          <li key={city.cityKey}>
                            <Link
                              href={city.guideHref}
                              className="text-[var(--color-primary-700)] hover:text-[var(--color-accent-600)] hover:underline"
                            >
                              {city.cityName}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex items-center gap-3 border-t border-[var(--color-border)] px-4 py-2.5 text-xs">
                      <Link
                        href={guideHref}
                        className="font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
                      >
                        Read guide →
                      </Link>
                      <span className="text-[var(--color-neutral-300)]" aria-hidden="true">
                        ·
                      </span>
                      <Link
                        href={c.href}
                        className="text-[var(--color-neutral-500)] hover:text-[var(--color-primary-800)]"
                      >
                        {th.viewCountryHub}
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href={`/treatments/${treatmentSlug}/costs`}
              className="font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
            >
              Cost comparison →
            </Link>
            <Link
              href="/guides/"
              className="text-[var(--color-neutral-500)] hover:text-[var(--color-primary-800)]"
            >
              All guides →
            </Link>
          </div>

          {/* FAQ */}
          {faqs.length > 0 && (
            <section aria-labelledby="faq-heading">
              <h2
                id="faq-heading"
                className="mb-6 text-2xl font-bold tracking-tight text-[var(--color-primary-950)]"
              >
                Frequently asked questions
              </h2>
              <div data-speakable="true">
                <FaqAccordion faqs={faqs} />
              </div>
            </section>
          )}
        </div>
      </div>

      <CtaBlock
        headline={`Find the Right Clinic for ${cat.name} Abroad`}
        description="Matched based on verified patient data — not clinic marketing materials."
      />
    </>
  )
}

export default async function TreatmentPage({ params }: { params: Params }) {
  const { treatment } = await params
  const slugPath = `/treatments/${treatment}`
  const backendPage = await getPageBySlug(slugPath)

  if (backendPage) {
    return (
      <Suspense
        fallback={
          <div className="mx-auto max-w-5xl animate-pulse px-4 py-16 sm:px-6">
            <div className="h-4 w-48 rounded bg-[var(--color-neutral-100)]" />
            <div className="mt-8 h-12 w-96 rounded bg-[var(--color-neutral-100)]" />
          </div>
        }
      >
        <PublishedArticleView slugPath={slugPath} locale={locale} />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={
      <div className="mx-auto max-w-5xl animate-pulse px-4 py-16 sm:px-6">
        <div className="h-4 w-48 rounded bg-[var(--color-neutral-100)]" />
        <div className="mt-8 h-12 w-96 rounded bg-[var(--color-neutral-100)]" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-2xl bg-[var(--color-neutral-100)]" />)}
        </div>
      </div>
    }>
      <TreatmentPageContent treatmentSlug={treatment} />
    </Suspense>
  )
}
