import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PublishedHubList, PublishedHubListSkeleton } from '@/components/hubs/PublishedHubList'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'

const locale = activeLocale

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(locale)
  return {
    title: t.hubs.compareHub.title,
    description: t.hubs.compareHub.description,
  }
}

export default function CompareHubPage() {
  const t = getDictionary(locale)

  return (
    <HubPageLayout
      locale={locale}
      hubId="compare"
      title={t.hubs.compareHub.title}
      description={t.hubs.compareHub.description}
    >
      <Suspense fallback={<PublishedHubListSkeleton />}>
        <PublishedHubList locale={locale} hubSegment="compare" />
      </Suspense>
    </HubPageLayout>
  )
}
