import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { getContentBySlugOptional, getContentListSafe } from '@/lib/api/content'
import { buildCityGuideSchemas } from '@/lib/schema/city-guide'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { CityHeroAnswer } from '@/components/city-guide/CityHeroAnswer'
import { CityQuickStats } from '@/components/city-guide/CityQuickStats'
import { TruthScoreCard } from '@/components/country-guide/TruthScoreCard'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { ContentHtml } from '@/components/shared/ContentHtml'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { SpeakableSummary } from '@/components/shared/SpeakableSummary'
import { RelatedPages } from '@/components/shared/RelatedPages'
import { CrossHubNav } from '@/components/hubs/CrossHubNav'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import {
  partitionGuides,
  parseCitySlug,
  staticCitiesPerCountry,
  slugToLabel,
  countryMeta,
} from '@/lib/content/hubs'

type Params = Promise<{ countrySlug: string; citySlug: string }>

/** Placeholder for build-time validation when API is offline; runtime uses Suspense + API. */
export function generateStaticParams() {
  return [{ countrySlug: 'spain', citySlug: 'barcelona-ivf-guide' }]
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { countrySlug, citySlug } = await params
  const slug = `guides/${countrySlug}/${citySlug}`

  try {
    const page = await getContentBySlugOptional(slug)
    if (!page) throw new Error('unavailable')
    const canonicalUrl =
      page.seo.canonicalUrl ||
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://medcover.com'}/${slug}/`

    const og = page.seo.openGraph
    const tw = page.seo.twitterCard
    const ogStr = (k: string) => (typeof og[k] === 'string' ? (og[k] as string) : undefined)
    const twStr = (k: string) => (typeof tw[k] === 'string' ? (tw[k] as string) : undefined)

    return {
      title: page.metaTitle,
      description: page.metaDescription,
      robots: page.seo.robots,
      alternates: {
        canonical: canonicalUrl,
        languages: Object.fromEntries(
          page.seo.hreflang.map((h) => [h.language.toLowerCase(), h.url]),
        ),
      },
      openGraph: {
        title: ogStr('title') || page.metaTitle,
        description: ogStr('description') || page.metaDescription,
        url: canonicalUrl,
        type: 'website',
        siteName: 'MedCover',
        images: page.heroImage ? [{ url: page.heroImage }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: twStr('title') || page.metaTitle,
        description: twStr('description') || page.metaDescription,
        images: page.heroImage ? [page.heroImage] : [],
      },
    }
  } catch {
    return { title: 'IVF City Guide | MedCover' }
  }
}

async function RelatedCities({
  countryKey,
  currentSlug,
  locale,
}: {
  countryKey: string
  currentSlug: string
  locale: string
}) {
  const t = getDictionary(locale as Parameters<typeof getDictionary>[0])
  const pages = await getContentListSafe()
  const { cities } = partitionGuides(pages, locale as Parameters<typeof getDictionary>[0])

  type CityInfo = { cityKey: string; cityName: string; href: string }
  let related: CityInfo[] = []

  const apiCities = cities.filter(
    (p) => p.slug.startsWith(`guides/${countryKey}/`) && p.slug !== currentSlug,
  )

  if (apiCities.length > 0) {
    related = apiCities
      .map((p) => {
        const parsed = parseCitySlug(p.slug)
        if (!parsed) return null
        const cityKey = p.slug.match(/^guides\/[^/]+\/(.+)-ivf-guide$/)?.[1] ?? ''
        return {
          cityKey,
          cityName: parsed.cityName,
          href: localizedPath(`/${p.slug}`, locale as Parameters<typeof getDictionary>[0]),
        }
      })
      .filter((c): c is CityInfo => c !== null)
      .slice(0, 5)
  } else {
    // Static fallback
    related = (staticCitiesPerCountry[countryKey] ?? [])
      .filter((c) => `guides/${countryKey}/${c}-ivf-guide` !== currentSlug)
      .slice(0, 5)
      .map((cityKey) => ({
        cityKey,
        cityName: slugToLabel(cityKey),
        href: localizedPath(
          `/guides/${countryKey}/${cityKey}-ivf-guide`,
          locale as Parameters<typeof getDictionary>[0],
        ),
      }))
  }

  if (related.length === 0) return null

  const countryName = countryMeta[`guides/${countryKey}-ivf-guide`]?.name ?? slugToLabel(countryKey)

  return (
    <nav aria-label="Related cities" className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
        {t.cityGuide.relatedCities} {countryName}
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {related.map((city) => (
          <li key={city.cityKey}>
            <Link
              href={city.href}
              className="inline-flex rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-primary-800)] transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)]"
            >
              {city.cityName}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

async function CityGuideContent({
  countrySlug,
  citySlug,
}: {
  countrySlug: string
  citySlug: string
}) {
  const locale = activeLocale
  const t = getDictionary(locale)
  const slug = `guides/${countrySlug}/${citySlug}`

  const page = await getContentBySlugOptional(slug)
  if (!page) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <CrossHubNav locale={locale} guideSlug={slug} />
        <p className="mt-8 text-[var(--color-neutral-600)]">{t.page.noDataYet}</p>
      </div>
    )
  }

  const schemas = buildCityGuideSchemas(page)

  return (
    <>
      <JsonLd schemas={schemas} />
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        {page.breadcrumbs.length > 0 && (
          <Breadcrumb items={page.breadcrumbs} homeHref={localizedPath('/', locale)} />
        )}
        <CrossHubNav locale={locale} guideSlug={slug} className="mt-2" />
        <div className="mt-4">
          <CityHeroAnswer page={page} />
        </div>
        {page.scores.seo != null && <TruthScoreCard scores={page.scores} />}
        <CityQuickStats page={page} />
        {page.metaDescription && (
          <SpeakableSummary label={t.cityGuide.speakableSummaryLabel}>
            <p>{page.metaDescription}</p>
          </SpeakableSummary>
        )}
        {page.content.html && <ContentHtml html={page.content.html} className="mt-8" />}
        {page.toc.length > 0 && <RelatedPages toc={page.toc} />}
        {page.faq.length > 0 && <FaqAccordion faqs={page.faq} />}
        <Suspense>
          <RelatedCities countryKey={countrySlug} currentSlug={slug} locale={locale} />
        </Suspense>
        <CtaBlock
          headline={t.cityGuide.cta.headline}
          description={t.cityGuide.cta.description}
          primaryLabel={t.cityGuide.cta.primaryLabel}
          secondaryLabel={t.cta.shareStory}
        />
        {page.updatedAt && (
          <p className="mt-8 text-center text-xs text-[var(--color-neutral-400)]">
            {t.page.lastUpdated}:{' '}
            <time dateTime={page.updatedAt}>
              {new Date(page.updatedAt).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </p>
        )}
      </div>
    </>
  )
}

function GuideSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-4 py-16 sm:px-6">
      <div className="h-4 w-48 rounded bg-[var(--color-neutral-100)]" />
      <div className="mt-8 h-12 w-full rounded bg-[var(--color-neutral-100)]" />
      <div className="mt-4 h-64 rounded bg-[var(--color-neutral-100)]" />
    </div>
  )
}

export default async function CityGuidePage({ params }: { params: Params }) {
  const { countrySlug, citySlug } = await params

  return (
    <Suspense fallback={<GuideSkeleton />}>
      <CityGuideContent countrySlug={countrySlug} citySlug={citySlug} />
    </Suspense>
  )
}
