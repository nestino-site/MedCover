import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Suspense } from 'react'
import { getTaxonomy } from '@/lib/api/catalog'
import { loadPublishedPage } from '@/lib/api/content'
import { HubHero } from '@/components/hubs/HubHero'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { TreatmentsList, TreatmentsListSkeleton } from '@/components/hubs/TreatmentsList'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { cmsPageSlug, guidesHubPath } from '@/lib/routes'
import { hubCopyFromCmsPage } from '@/lib/seo/cms-seo'
import { cmsHubMetadata } from '@/lib/seo/site-metadata'
import type { FaqItem } from '@/lib/api/types'

const locale = activeLocale

export async function generateMetadata(): Promise<Metadata> {
  return cmsHubMetadata('treatments')
}

export default async function TreatmentsHubPage() {
  const t = getDictionary(locale)
  const [taxonomy, cms] = await Promise.all([
    getTaxonomy(),
    loadPublishedPage('/treatments'),
  ])
  const hubFaqs: FaqItem[] = cms.status === 'ok' ? cms.page.faq : []
  const hubCopy = cms.status === 'ok' ? hubCopyFromCmsPage(cms.page) : {}

  return (
    <>
      <CmsPageJsonLd result={cms} />
      <HubHero
        variant="compact"
        eyebrow={t.hubs.treatments.hero.eyebrow}
        title={hubCopy.title ?? t.hubs.treatments.hero.title}
        subtitle={hubCopy.description ?? t.hubs.treatments.hero.subtitle}
      />
      <HubPageLayout
        locale={locale}
        hubId="treatments"
        title={t.hubs.treatments.title}
        description={t.hubs.treatments.description}
        showHeading={false}
      >
        <Link
          href={guidesHubPath(locale)}
          className="group mb-10 flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-5 py-4 transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)]/40"
        >
          <div>
            <p className="font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
              {t.hubs.guides.browseGuidesCta}
            </p>
            <p className="mt-0.5 text-sm text-[var(--color-neutral-600)]">
              {t.hubs.guides.browseGuidesDescription}
            </p>
          </div>
          <ArrowRight
            size={18}
            className="shrink-0 text-[var(--color-neutral-400)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-primary-500)]"
            aria-hidden="true"
          />
        </Link>

        <Suspense fallback={<TreatmentsListSkeleton />}>
          <TreatmentsList locale={locale} />
        </Suspense>

        {hubFaqs.length > 0 && (
          <div className="mt-14 border-t border-[var(--color-border)] pt-8">
            <FaqAccordion faqs={hubFaqs} title="Medical treatment abroad — common questions" />
          </div>
        )}
      </HubPageLayout>
    </>
  )
}
