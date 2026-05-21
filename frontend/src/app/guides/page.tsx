import type { Metadata } from 'next'
import { Suspense } from 'react'
import { GuidesList, GuidesListSkeleton } from '@/components/hubs/GuidesList'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'

const locale = activeLocale

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(locale)
  return { title: t.meta.guides.title, description: t.meta.guides.description }
}

export default function GuidesHubPage() {
  const t = getDictionary(locale)

  return (
    <HubPageLayout
      locale={locale}
      hubId="guides"
      title={t.hubs.guides.title}
      description={t.hubs.guides.description}
    >
      <Suspense fallback={<GuidesListSkeleton />}>
        <GuidesList locale={locale} />
      </Suspense>
    </HubPageLayout>
  )
}
