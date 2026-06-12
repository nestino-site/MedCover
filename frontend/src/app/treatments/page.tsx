import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTaxonomy } from '@/lib/api/catalog'
import { loadPublishedPage } from '@/lib/api/content'
import { HubHero } from '@/components/hubs/HubHero'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { GuidePostsList, GuidePostsListSkeleton } from '@/components/hubs/GuidePostsList'
import { TreatmentsList, TreatmentsListSkeleton } from '@/components/hubs/TreatmentsList'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { cmsPageSlug } from '@/lib/routes'
import { cmsMetadataForSlug, hubCopyFromCmsPage } from '@/lib/seo/cms-seo'
import type { FaqItem } from '@/lib/api/types'

const locale = activeLocale

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadataForSlug(cmsPageSlug('treatments'))
}

export default async function TreatmentsHubPage() {
  const t = getDictionary(locale)
  const [taxonomy, cms] = await Promise.all([
    getTaxonomy(),
    loadPublishedPage('/treatments'),
  ])
  const hubFaqs: FaqItem[] = cms.status === 'ok' ? cms.page.faq : []
  const hubCopy = cms.status === 'ok' ? hubCopyFromCmsPage(cms.page) : {}

  return (
    <>
      <CmsPageJsonLd result={cms} />
      <HubHero
        variant="compact"
        eyebrow={t.hubs.treatments.hero.eyebrow}
        title={hubCopy.title ?? t.hubs.treatments.hero.title}
        subtitle={hubCopy.description ?? t.hubs.treatments.hero.subtitle}
      />
      <HubPageLayout
        locale={locale}
        hubId="treatments"
        title={t.hubs.treatments.title}
        description={t.hubs.treatments.description}
        showHeading={false}
      >
        <Suspense fallback={<GuidePostsListSkeleton />}>
          <GuidePostsList locale={locale} scope="all" className="mb-10" />
        </Suspense>

        <Suspense fallback={<TreatmentsListSkeleton />}>
          <TreatmentsList locale={locale} />
        </Suspense>

        {hubFaqs.length > 0 && (
          <div className="mt-14 border-t border-[var(--color-border)] pt-8">
            <FaqAccordion faqs={hubFaqs} title="Medical treatment abroad — common questions" />
          </div>
        )}
      </HubPageLayout>
    </>
  )
}
