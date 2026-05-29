import { GuidePostsList, GuidePostsListSkeleton } from '@/components/hubs/GuidePostsList'
import { HubHero } from '@/components/hubs/HubHero'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { FilterBar } from '@/components/filters/FilterBar'
import { SortSelect } from '@/components/filters/SortSelect'
import { FilterNavigationProvider } from '@/components/filters/filter-navigation'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import type { Metadata } from 'next'
import { Suspense } from 'react'

const locale = activeLocale
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(locale)
  return {
    title: t.meta.guides.title,
    description: t.meta.guides.description,
    alternates: { canonical: `${SITE_URL}/guides/` },
  }
}

export default function GuidesHubPage() {
  const t = getDictionary(locale)

  const sortOptions = [
    { value: 'alpha', label: t.hubs.guides.sortAlpha },
    { value: 'updated', label: t.hubs.guides.sortUpdated },
  ]

  return (
    <>
      <HubHero
        variant="compact"
        eyebrow={t.hubs.guides.hero.eyebrow}
        title={t.hubs.guides.hero.title}
        subtitle={t.hubs.guides.hero.subtitle}
      />
      <HubPageLayout
        locale={locale}
        hubId="guides"
        title={t.hubs.guides.title}
        description={t.hubs.guides.description}
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
