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
    title: t.hubs.clinicsHub.title,
    description: t.hubs.clinicsHub.description,
  }
}

export default function ClinicsHubPage() {
  const t = getDictionary(locale)

  return (
    <HubPageLayout
      locale={locale}
      hubId="clinics"
      title={t.hubs.clinicsHub.title}
      description={t.hubs.clinicsHub.description}
    >
      <Suspense fallback={<PublishedHubListSkeleton />}>
        <PublishedHubList locale={locale} hubSegment="clinics" />
      </Suspense>
    </HubPageLayout>
  )
}
