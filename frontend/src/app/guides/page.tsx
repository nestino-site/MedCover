import { GuidePostsList, GuidePostsListSkeleton } from '@/components/hubs/GuidePostsList'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { FilterBar } from '@/components/filters/FilterBar'
import { SortSelect } from '@/components/filters/SortSelect'
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

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

async function GuidesResults({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const sort = typeof params.sort === 'string' ? params.sort : undefined
  const q = typeof params.q === 'string' ? params.q : undefined

  return <GuidePostsList locale={locale} scope="all" showHeading={false} sort={sort} q={q} />
}

export default function GuidesHubPage({ searchParams }: { searchParams: SearchParams }) {
  const t = getDictionary(locale)

  const sortOptions = [
    { value: 'alpha', label: t.hubs.guides.sortAlpha },
    { value: 'updated', label: t.hubs.guides.sortUpdated },
  ]

  return (
    <HubPageLayout
      locale={locale}
      hubId="guides"
      title={t.hubs.guides.title}
      description={t.hubs.guides.description}
    >
      <Suspense fallback={null}>
        <FilterBar>
          <SortSelect options={sortOptions} defaultValue="alpha" label={t.hubs.guides.sortLabel} />
        </FilterBar>
      </Suspense>
      <Suspense fallback={<GuidePostsListSkeleton grouped />}>
        <GuidesResults searchParams={searchParams} />
      </Suspense>
    </HubPageLayout>
  )
}
