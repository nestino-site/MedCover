import { GuidePostsList, GuidePostsListSkeleton } from '@/components/hubs/GuidePostsList'
import { HubHero } from '@/components/hubs/HubHero'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { FilterBar } from '@/components/filters/FilterBar'
import { SortSelect } from '@/components/filters/SortSelect'
import { FilterNavigationProvider } from '@/components/filters/filter-navigation'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { cmsPageSlug } from '@/lib/routes'
import { cmsMetadataForSlug, hubCopyFromCmsPage, loadCmsPage } from '@/lib/seo/cms-seo'
import type { Metadata } from 'next'
import { Suspense } from 'react'

const locale = activeLocale

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadataForSlug(cmsPageSlug('guides'))
}

export default async function GuidesHubPage() {
  const t = getDictionary(locale)
  const cms = await loadCmsPage(cmsPageSlug('guides'))
  const hubCopy = cms.status === 'ok' ? hubCopyFromCmsPage(cms.page) : {}

  const sortOptions = [
    { value: 'alpha', label: t.hubs.guides.sortAlpha },
    { value: 'updated', label: t.hubs.guides.sortUpdated },
  ]

  return (
    <>
      <CmsPageJsonLd result={cms} />
      <HubHero
        variant="compact"
        eyebrow={t.hubs.guides.hero.eyebrow}
        title={hubCopy.title ?? t.hubs.guides.hero.title}
        subtitle={hubCopy.description ?? t.hubs.guides.hero.subtitle}
      />
      <HubPageLayout
        locale={locale}
        hubId="guides"
        title={hubCopy.title ?? t.hubs.guides.title}
        description={hubCopy.description ?? t.hubs.guides.description}
        showHeading={false}
      >
        <FilterNavigationProvider>
          <Suspense fallback={null}>
            <FilterBar variant="compact">
              <SortSelect options={sortOptions} defaultValue="alpha" label={t.hubs.guides.sortLabel} />
            </FilterBar>
          </Suspense>
          <Suspense fallback={<GuidePostsListSkeleton grouped />}>
            <GuidePostsList locale={locale} scope="all" showHeading={false} />
          </Suspense>
        </FilterNavigationProvider>
      </HubPageLayout>
    </>
  )
}
