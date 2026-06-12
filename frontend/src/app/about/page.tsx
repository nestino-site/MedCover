import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'
import { hubPath } from '@/lib/content/site-nav'
import { cmsHubMetadata } from '@/lib/seo/site-metadata'

const locale = activeLocale

export async function generateMetadata(): Promise<Metadata> {
  return cmsHubMetadata('about')
}

export default function AboutPage() {
  const t = getDictionary(locale)

  return (
    <HubPageLayout
      locale={locale}
      title={t.meta.about.title}
      description={t.meta.about.description}
      showCrossLinks={false}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-600)]">
        {t.about.eyebrow}
      </p>

      <section className="mt-10 max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-primary-950)]">
          {t.about.missionTitle}
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-[var(--color-neutral-600)]">
          {t.about.missionBody}
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-primary-950)]">
          {t.about.pillarsTitle}
        </h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          {t.about.pillars.map((pillar) => (
            <li
              key={pillar.title}
              className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold text-[var(--color-primary-900)]">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-neutral-600)]">
                {pillar.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12">
        <Link
          href={hubPath('countries', locale)}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary-900)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-800)]"
        >
          {t.about.exploreCta}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </HubPageLayout>
  )
}
