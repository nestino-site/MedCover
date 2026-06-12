import { GuidePostsList, GuidePostsListSkeleton } from '@/components/hubs/GuidePostsList'
import { HubHero } from '@/components/hubs/HubHero'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { FilterBar } from '@/components/filters/FilterBar'
import { FilterBarSkeleton } from '@/components/filters/FilterBarSkeleton'
import { FilterSearch } from '@/components/filters/FilterSearch'
import { SortSelect } from '@/components/filters/SortSelect'
import {
  FilterNavigationProvider,
  FilteredResultsRegion,
} from '@/components/filters/filter-navigation'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { getTaxonomy } from '@/lib/api/catalog'
import { partitionGuides } from '@/lib/content/hubs'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { cmsPageSlug } from '@/lib/routes'
import { hubCopyFromCmsPage, loadCmsPage } from '@/lib/seo/cms-seo'
import { cmsHubMetadata } from '@/lib/seo/site-metadata'
import type { FaqItem } from '@/lib/api/types'
import type { Metadata } from 'next'
import { Suspense } from 'react'

const locale = activeLocale

export async function generateMetadata(): Promise<Metadata> {
  return cmsHubMetadata('guides')
}

export default async function GuidesHubPage() {
  const t = getDictionary(locale)
  const [cms, pages, taxonomy] = await Promise.all([
    loadCmsPage(cmsPageSlug('guides')),
    listPublishedPagesSafe(),
    getTaxonomy(),
  ])
  const hubCopy = cms.status === 'ok' ? hubCopyFromCmsPage(cms.page) : {}
  const hubFaqs: FaqItem[] = cms.status === 'ok' ? cms.page.faq : []

  const { countries, cities } = partitionGuides(pages, locale, taxonomy)
  const heroStats =
    countries.length > 0 || cities.length > 0
      ? [
          ...(countries.length > 0
            ? [
                {
                  value: String(countries.length),
                  label: t.hubs.guides.countryGuidesStat,
                },
              ]
            : []),
          ...(cities.length > 0
            ? [
                {
                  value: String(cities.length),
                  label: t.hubs.guides.cityGuidesStat,
                },
              ]
            : []),
        ]
      : undefined

  const sortOptions = [
    { value: 'featured', label: t.hubs.guides.sortFeatured },
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
        stats={heroStats}
      />
      <HubPageLayout
        locale={locale}
        hubId="guides"
        title={hubCopy.title ?? t.hubs.guides.title}
        description={hubCopy.description ?? t.hubs.guides.description}
        showHeading={false}
      >
        <FilterNavigationProvider>
          <div id="guides">
            <Suspense fallback={<FilterBarSkeleton />}>
              <FilterBar>
                <FilterSearch
                  placeholder={t.hubs.guides.searchPlaceholder}
                  label={t.hubs.guides.searchLabel}
                />
                <SortSelect
                  options={sortOptions}
                  defaultValue="featured"
                  label={t.hubs.guides.sortLabel}
                />
              </FilterBar>
            </Suspense>

            <FilteredResultsRegion fallback={<GuidePostsListSkeleton grouped />}>
              <Suspense fallback={<GuidePostsListSkeleton grouped />}>
                <GuidePostsList locale={locale} scope="all" showHeading={false} />
              </Suspense>
            </FilteredResultsRegion>
          </div>
        </FilterNavigationProvider>

        {hubFaqs.length > 0 && (
          <div className="mt-14 border-t border-[var(--color-border)] pt-8">
            <FaqAccordion faqs={hubFaqs} title={t.hubs.guides.faqTitle} />
          </div>
        )}
      </HubPageLayout>
    </>
  )
}
