import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getTaxonomy, getCompare, treatmentSlugSet } from '@/lib/api/catalog'
import { loadPublishedPage, listPublishedPagesSafe } from '@/lib/api/content'
import { EntityHero } from '@/components/shared/EntityHero'
import { ComparisonTable } from '@/components/shared/ComparisonTable'
import { ContentHtml } from '@/components/shared/ContentHtml'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { ClinicCard } from '@/components/clinics/ClinicCard'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { RelatedLandingsGrid } from '@/components/shared/RelatedLandingsGrid'
import { dedupeRelated, findRelatedGuides } from '@/lib/content/link-graph'
import { activeLocale } from '@/lib/i18n/locale'
import {
  compareHubPath,
  cmsPageSlug,
  resolveCompareCanonicalSlug,
  slugToLabel,
} from '@/lib/routes'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { cmsMetadataForSlug, heroAnswerFromCmsPage } from '@/lib/seo/cms-seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const pages = await listPublishedPagesSafe()
  const params = pages
    .filter((p) => p.slug.includes('/compare/'))
    .map((p) => {
      const slug = p.slug.replace(/^\/?compare\//, '').replace(/\/$/, '')
      return { slug }
    })
  return params.length > 0 ? params : [{ slug: 'spain-vs-greece-for-ivf' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return cmsMetadataForSlug(cmsPageSlug('compare', slug))
}

export default async function CompareDetailPage({ params }: Props) {
  const { slug } = await params
  const locale = activeLocale
  const taxonomy = await getTaxonomy()
  const treatmentSlugs = treatmentSlugSet(taxonomy)
  const parsed = resolveCompareCanonicalSlug(slug, treatmentSlugs)
  if (!parsed) notFound()

  if (!parsed.isCanonicalOrder) {
    const canonical = parsed.treatment
      ? `/compare/${parsed.canonicalSlug}/`
      : `/compare/${parsed.canonicalSlug}/`
    redirect(canonical)
  }

  const compareData = await getCompare(
    parsed.type === 'clinic' ? 'clinic' : parsed.type,
    parsed.entityA,
    parsed.entityB,
    parsed.treatment,
  )

  const slugPath = `/compare/${slug}`
  const cms = await loadPublishedPage(slugPath)

  const titleA = compareData?.entityA.name ?? slugToLabel(parsed.entityA)
  const titleB = compareData?.entityB.name ?? slugToLabel(parsed.entityB)
  const pageTitle = parsed.treatment
    ? `${titleA} vs ${titleB} for ${slugToLabel(parsed.treatment)}`
    : `${titleA} vs ${titleB}`

  const rows = compareData
    ? [
        compareData.entityA.clinicCount != null && compareData.entityB.clinicCount != null
          ? {
              label: 'Clinics listed',
              valueA: String(compareData.entityA.clinicCount),
              valueB: String(compareData.entityB.clinicCount),
            }
          : null,
        compareData.entityA.avgRating != null && compareData.entityB.avgRating != null
          ? {
              label: 'Average rating',
              valueA: compareData.entityA.avgRating.toFixed(1),
              valueB: compareData.entityB.avgRating.toFixed(1),
              winner:
                compareData.entityA.avgRating > compareData.entityB.avgRating
                  ? ('a' as const)
                  : compareData.entityA.avgRating < compareData.entityB.avgRating
                    ? ('b' as const)
                    : ('tie' as const),
            }
          : null,
        compareData.entityA.priceRange && compareData.entityB.priceRange
          ? {
              label: 'Typical price range',
              valueA: `€${compareData.entityA.priceRange.min.toLocaleString()}–€${compareData.entityA.priceRange.max.toLocaleString()}`,
              valueB: `€${compareData.entityB.priceRange.min.toLocaleString()}–€${compareData.entityB.priceRange.max.toLocaleString()}`,
              winner:
                compareData.entityA.priceRange.min < compareData.entityB.priceRange.min
                  ? ('a' as const)
                  : compareData.entityA.priceRange.min > compareData.entityB.priceRange.min
                    ? ('b' as const)
                    : ('tie' as const),
            }
          : null,
      ].filter((r): r is NonNullable<typeof r> => r != null)
    : []

  const cmsAnswer = cms.status === 'ok' ? heroAnswerFromCmsPage(cms.page) : undefined

  const pages = parsed.type === 'country' ? await listPublishedPagesSafe() : []
  const relatedGuides =
    parsed.type === 'country'
      ? dedupeRelated([
          ...findRelatedGuides({ country: parsed.entityA }, pages, locale, { taxonomy }).slice(0, 3),
          ...findRelatedGuides({ country: parsed.entityB }, pages, locale, { taxonomy }).slice(0, 3),
        ])
      : []

  return (
    <>
    <CmsPageJsonLd result={cms} />
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <EntityHero
        breadcrumbs={[
          { name: 'Home', slug: '/', position: 1 },
          { name: 'Compare', slug: compareHubPath(locale), position: 2 },
          { name: pageTitle, slug: slugPath, position: 3 },
        ]}
        title={pageTitle}
        answer={cmsAnswer}
      />

      {rows.length > 0 && (
        <div className="mb-12">
          <ComparisonTable titleA={titleA} titleB={titleB} rows={rows} />
        </div>
      )}

      {compareData && (
        <div className="mb-12 grid gap-8 lg:grid-cols-2">
          {[compareData.entityA, compareData.entityB].map((entity) => (
            <section key={entity.slug}>
              <h2 className="mb-4 text-xl font-bold text-[var(--color-primary-950)]">{entity.name}</h2>
              {entity.topClinics.length > 0 && (
                <div className="space-y-4">
                  {entity.topClinics.slice(0, 3).map((c) => (
                    <ClinicCard key={c.urlPath} clinic={c} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {cms.status === 'ok' && cms.page.htmlContent && (
        <div className="prose prose-neutral mb-12 max-w-none">
          <ContentHtml html={cms.page.htmlContent} />
        </div>
      )}

      {relatedGuides.length > 0 && (
        <div className="mb-12">
          <RelatedLandingsGrid title="Patient guides" items={relatedGuides} />
        </div>
      )}

      {cms.status === 'ok' && cms.page.faq.length > 0 && (
        <div className="mb-12">
          <FaqAccordion faqs={cms.page.faq} defaultOpen={false} />
        </div>
      )}

      <CtaBlock />
    </div>
    </>
  )
}
