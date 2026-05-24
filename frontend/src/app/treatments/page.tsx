import type { Metadata } from 'next'
import { Suspense } from 'react'
import { HubHero } from '@/components/hubs/HubHero'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { TreatmentsList, TreatmentsListSkeleton } from '@/components/hubs/TreatmentsList'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'

const locale = activeLocale

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(locale)
  return { title: t.meta.treatments.title, description: t.meta.treatments.description }
}

export default function TreatmentsHubPage() {
  const t = getDictionary(locale)

  return (
    <>
      <HubHero
        eyebrow={t.hubs.treatments.hero.eyebrow}
        title={t.hubs.treatments.hero.title}
        subtitle={t.hubs.treatments.hero.subtitle}
      />
      <HubPageLayout
        locale={locale}
        hubId="treatments"
        title={t.hubs.treatments.title}
        description={t.hubs.treatments.description}
        showHeading={false}
      >
        <Suspense fallback={<TreatmentsListSkeleton />}>
          <TreatmentsList locale={locale} />
        </Suspense>
      </HubPageLayout>
    </>
  )
}
