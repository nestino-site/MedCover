import type { Metadata } from 'next'
import { Suspense } from 'react'
import { HubHero } from '@/components/hubs/HubHero'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import {
  ClinicsHubDestinationsSection,
  ClinicsHubTopRatedSection,
} from '@/components/clinics/ClinicsHubSections'
import { SearchTriggerButton } from '@/components/search/SearchModal'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { activeLocale } from '@/lib/i18n/locale'
import { cmsPageSlug } from '@/lib/routes'
import { hubCopyFromCmsPage, loadCmsPage } from '@/lib/seo/cms-seo'
import { cmsHubMetadata } from '@/lib/seo/site-metadata'
import {
  ClinicsHubDestinationsSkeleton,
  ClinicsHubTopRatedSkeleton,
} from '@/components/ui/skeletons/HubSectionSkeletons'

export async function generateMetadata(): Promise<Metadata> {
  return cmsHubMetadata('clinics')
}

export default async function ClinicsHubPage() {
  const locale = activeLocale
  const cms = await loadCmsPage(cmsPageSlug('clinics'))
  const hubCopy = cms.status === 'ok' ? hubCopyFromCmsPage(cms.page) : {}

  return (
    <>
      <CmsPageJsonLd result={cms} />
      <HubHero
        variant="compact"
        eyebrow="Clinics"
        title={hubCopy.title ?? 'Find verified clinics abroad'}
        subtitle={
          hubCopy.description ??
          'Explore verified clinics with transparent patient data and pricing.'
        }
      />
      <HubPageLayout
        locale={locale}
        hubId="clinics"
        title=""
        description=""
        showHeading={false}
        showCrossLinks
      >
        <div className="mb-12 flex flex-wrap items-center gap-4">
          <SearchTriggerButton className="min-w-[200px] flex-1 sm:max-w-md" />
        </div>

        <Suspense fallback={<ClinicsHubDestinationsSkeleton />}>
          <ClinicsHubDestinationsSection locale={locale} />
        </Suspense>

        <Suspense fallback={<ClinicsHubTopRatedSkeleton />}>
          <ClinicsHubTopRatedSection />
        </Suspense>
      </HubPageLayout>
    </>
  )
}
