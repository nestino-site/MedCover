import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTaxonomy } from '@/lib/api/catalog'
import { loadPublishedPage, listPublishedPagesSafe } from '@/lib/api/content'
import { CountriesList, CountriesListSkeleton } from '@/components/hubs/CountriesList'
import { HubHero } from '@/components/hubs/HubHero'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { FilterBar } from '@/components/filters/FilterBar'
import { FilterBarSkeleton } from '@/components/filters/FilterBarSkeleton'
import { FilterChips } from '@/components/filters/FilterChips'
import { SortSelect } from '@/components/filters/SortSelect'
import {
  FilterNavigationProvider,
  FilteredResultsRegion,
} from '@/components/filters/filter-navigation'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { treatmentsForDisplay } from '@/lib/content/treatments'
import { hubCopyFromCmsPage } from '@/lib/seo/cms-seo'
import { cmsHubMetadata } from '@/lib/seo/site-metadata'
import type { FaqItem } from '@/lib/api/types'

export async function generateMetadata(): Promise<Metadata> {
  return cmsHubMetadata('countries')
}

export default async function CountriesHubPage() {
  const locale = activeLocale
  const t = getDictionary(locale)
  const [taxonomy, cms, pages] = await Promise.all([
    getTaxonomy(),
    loadPublishedPage('/countries'),
    listPublishedPagesSafe(),
  ])
  const hubFaqs: FaqItem[] = cms.status === 'ok' ? cms.page.faq : []
  const treatmentOptions = treatmentsForDisplay(taxonomy).map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const sortOptions = [
    { value: 'cost-asc', label: 'Cost: low → high' },
    { value: 'cost-desc', label: 'Cost: high → low' },
    { value: 'alpha', label: 'A – Z' },
    { value: 'clinics', label: 'Most clinics' },
  ]

  const hubCopy = cms.status === 'ok' ? hubCopyFromCmsPage(cms.page) : {}

  return (
    <>
      <CmsPageJsonLd result={cms} />
      <HubHero
        variant="compact"
        eyebrow={t.hubs.countries.hero.eyebrow}
        title={hubCopy.title ?? t.hubs.countries.hero.title}
        subtitle={hubCopy.description ?? t.hubs.countries.hero.subtitle}
      />
      <HubPageLayout
        locale={locale}
        hubId="countries"
        title={t.hubs.countries.title}
        description={t.hubs.countries.description}
        showHeading={false}
      >
        <FilterNavigationProvider>
          <div id="destinations">
            <Suspense fallback={<FilterBarSkeleton />}>
              <FilterBar>
                <FilterChips
                  options={treatmentOptions}
                  paramKey="treatment"
                  label={t.hubs.countries.treatmentFilterLabel}
                  allLabel={t.hubs.countries.treatmentFilterAll}
                />
                <SortSelect options={sortOptions} defaultValue="cost-asc" label="Sort countries" />
              </FilterBar>
            </Suspense>
            <FilteredResultsRegion fallback={<CountriesListSkeleton />}>
              <CountriesList locale={locale} taxonomy={taxonomy} pages={pages} />
            </FilteredResultsRegion>
          </div>
        </FilterNavigationProvider>

        {hubFaqs.length > 0 && (
          <div className="mt-14 border-t border-[var(--color-border)] pt-8">
            <FaqAccordion faqs={hubFaqs} title={t.hubs.countries.faqTitle} />
          </div>
        )}
      </HubPageLayout>
    </>
  )
}
