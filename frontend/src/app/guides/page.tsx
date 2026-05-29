import type { Metadata } from 'next'
import { Suspense } from 'react'
import { GuidesList, GuidesListSkeleton } from '@/components/hubs/GuidesList'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { FilterBar } from '@/components/filters/FilterBar'
import { SortSelect } from '@/components/filters/SortSelect'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'

const locale = activeLocale
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

const sortOptions = [
  { value: 'alpha', label: 'A – Z' },
  { value: 'updated', label: 'Recently updated' },
]

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(locale)
  return {
    title: t.meta.guides.title,
    description: t.meta.guides.description,
    alternates: { canonical: `${SITE_URL}/guides/` },
  }
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

function GuidesSortBar() {
  return (
    <FilterBar>
      <SortSelect options={sortOptions} defaultValue="alpha" label="Sort guides" />
    </FilterBar>
  )
}

function GuidesPageShell({ children }: { children: React.ReactNode }) {
  const t = getDictionary(locale)

  return (
    <HubPageLayout
      locale={locale}
      hubId="guides"
      title={t.hubs.guides.title}
      description={t.hubs.guides.description}
    >
      <Suspense fallback={null}>
        <GuidesSortBar />
      </Suspense>
      {children}
    </HubPageLayout>
  )
}

async function GuidesPageContent({ searchParams }: { searchParams: SearchParams }) {
  const { sort, q } = await searchParams
  const sortFilter = typeof sort === 'string' ? sort : undefined
  const qFilter = typeof q === 'string' ? q : undefined

  return (
    <Suspense fallback={<GuidesListSkeleton />}>
      <GuidesList locale={locale} sort={sortFilter} q={qFilter} />
    </Suspense>
  )
}

export default function GuidesHubPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <GuidesPageShell>
      <Suspense fallback={<GuidesListSkeleton />}>
        <GuidesPageContent searchParams={searchParams} />
      </Suspense>
    </GuidesPageShell>
  )
}
