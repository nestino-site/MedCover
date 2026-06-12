import { notFound, redirect } from 'next/navigation'
import { getTaxonomy, getCompare } from '@/lib/api/catalog'
import { loadPublishedPage, listPublishedPagesSafe } from '@/lib/api/content'
import { isPublishedCompareSlug } from '@/lib/compare/static-params'
import { EntityHero } from '@/components/shared/EntityHero'
import { ComparisonTable } from '@/components/shared/ComparisonTable'
import { CtaBlock } from '@/components/shared/CtaBlock'
import { RelatedLandingsGrid } from '@/components/shared/RelatedLandingsGrid'
import { ClinicCard } from '@/components/clinics/ClinicCard'
import { PdpEditorialSection } from '@/components/layout/PdpEditorialSection'
import { PdpFaqSection } from '@/components/layout/PdpFaqSection'
import { PdpFooterBlock, PdpPageShell } from '@/components/layout/PdpPageShell'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { dedupeRelated, findRelatedGuides } from '@/lib/content/link-graph'
import { activeLocale } from '@/lib/i18n/locale'
import {
  cmsCompareSlug,
  compareHubPath,
  legacyCompareCmsSlug,
  resolveCompareCanonicalSlug,
  slugToLabel,
  validateCompareEntities,
} from '@/lib/routes'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { heroAnswerFromCmsPage, siteOrigin } from '@/lib/seo/cms-seo'
import { normalizeContentHtml } from '@/lib/content/html-content-images'
import type { PageFetchResult } from '@/lib/api/content'

async function loadCompareCms(
  parsed: {
    type: 'clinic' | 'city' | 'country'
    entityA: string
    entityB: string
    treatment?: string
  },
): Promise<PageFetchResult> {
  const primarySlug = cmsCompareSlug(parsed.entityA, parsed.entityB, parsed.treatment)
  const primary = await loadPublishedPage(primarySlug)
  if (primary.status === 'ok') return primary

  if (parsed.treatment === 'ivf' || parsed.treatment === undefined) {
    const legacy = await loadPublishedPage(legacyCompareCmsSlug(parsed.entityA, parsed.entityB))
    if (legacy.status === 'ok') return legacy
  }

  return primary
}

export async function CompareDetailContent({ slug }: { slug: string }) {
  const locale = activeLocale
  const [taxonomy, pages] = await Promise.all([getTaxonomy(), listPublishedPagesSafe()])
  const parsed = resolveCompareCanonicalSlug(slug, taxonomy)
  if (!parsed || parsed.type === 'clinic') notFound()
  if (!validateCompareEntities(parsed, taxonomy)) notFound()
  if (!isPublishedCompareSlug(slug, pages)) notFound()

  if (!parsed.isCanonicalOrder) {
    redirect(`/compare/${parsed.canonicalSlug}/`)
  }

  const cms = await loadCompareCms(parsed)
  if (cms.status !== 'ok') notFound()

  const compareData = await getCompare(
    parsed.type,
    parsed.entityA,
    parsed.entityB,
    parsed.treatment,
  )

  const slugPath = cmsCompareSlug(parsed.entityA, parsed.entityB, parsed.treatment)

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
  const editorialHtml =
    cms.status === 'ok' && cms.page.htmlContent
      ? normalizeContentHtml(cms.page.htmlContent, siteOrigin())
      : null

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
      <PdpPageShell
        footer={
          <>
            {relatedGuides.length > 0 && (
              <PdpFooterBlock>
                <RelatedLandingsGrid title="Patient guides" items={relatedGuides} />
              </PdpFooterBlock>
            )}
            {cms.status === 'ok' && cms.page.faq.length > 0 && (
              <PdpFooterBlock>
                <PdpFaqSection title="Frequently asked questions" faqs={cms.page.faq} />
              </PdpFooterBlock>
            )}
            <PdpFooterBlock>
              <CtaBlock variant="compact" />
            </PdpFooterBlock>
          </>
        }
      >
        <EntityHero
          breadcrumbs={[
            { name: 'Home', slug: '/', position: 1 },
            { name: 'Compare', slug: compareHubPath(locale), position: 2 },
            { name: pageTitle, slug: slugPath, position: 3 },
          ]}
          title={pageTitle}
          answer={cmsAnswer}
        />

        <div className="mt-10 space-y-12">
          {rows.length > 0 && (
            <ComparisonTable titleA={titleA} titleB={titleB} rows={rows} />
          )}

          {compareData && (
            <div className="grid gap-8 lg:grid-cols-2">
              {[compareData.entityA, compareData.entityB].map((entity) => (
                <section key={entity.slug}>
                  <SectionHeading title={entity.name} className="mb-4" />
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

          {editorialHtml && (
            <PdpEditorialSection
              id="overview"
              eyebrow="Comparison"
              title="Full comparison"
              html={editorialHtml}
              tableOfContents={cms.page.tableOfContents}
            />
          )}
        </div>
      </PdpPageShell>
    </>
  )
}
