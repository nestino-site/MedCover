import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CrossHubNav } from '@/components/hubs/CrossHubNav'
import { HubHero } from '@/components/hubs/HubHero'
import { CompareHubContent, CompareHubContentSkeleton } from '@/components/compare/CompareHubContent'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { cmsPageSlug } from '@/lib/routes'
import { cmsMetadataForSlug, hubCopyFromCmsPage, loadCmsPage } from '@/lib/seo/cms-seo'

const locale = activeLocale

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadataForSlug(cmsPageSlug('compare'))
}

export default async function CompareHubPage() {
  const cms = await loadCmsPage(cmsPageSlug('compare'))
  const hubCopy = cms.status === 'ok' ? hubCopyFromCmsPage(cms.page) : {}
  const t = getDictionary(locale)

  return (
    <>
      <CmsPageJsonLd result={cms} />

      <HubHero
        variant="compact"
        eyebrow={t.hubs.compareHub.eyebrow}
        title={hubCopy.title ?? t.hubs.compareHub.title}
        subtitle={hubCopy.description ?? t.hubs.compareHub.description}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense fallback={<CompareHubContentSkeleton />}>
          <CompareHubContent locale={locale} />
        </Suspense>
        <CrossHubNav locale={locale} hubId="compare" className="mt-12" />
      </div>
    </>
  )
}
