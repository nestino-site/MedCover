import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { getTaxonomy } from '@/lib/api/catalog'
import { StartIntakeForm } from '@/components/start/StartIntakeForm'
import { treatmentsForDisplay } from '@/lib/content/treatments'
import { getDictionary, type Locale } from '@/lib/i18n'
import { hubMetadata } from '@/lib/seo/site-metadata'
import { isLocale } from '@/lib/i18n/locales'
import { countriesHubPath } from '@/lib/routes'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : 'en'
  return hubMetadata('start', {
    path: locale === 'en' ? '/start' : `/${locale}/start`,
    robots: { index: false, follow: true },
  })
}

export default async function StartPage({ params }: Props) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const taxonomy = await getTaxonomy()
  const treatments = treatmentsForDisplay(taxonomy)
  const countries = taxonomy.countries.map((c) => ({ slug: c.slug, name: c.name }))

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mb-10 text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-600)]">
          Patient intake
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-primary-950)] sm:text-4xl">
          Get matched with verified clinics abroad
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--color-neutral-600)]">
          Tell us your treatment goals and we&apos;ll connect you with clinics that match verified patient
          experiences — real costs, Truth Scores, and outcomes, not marketing brochures.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
        <StartIntakeForm treatments={treatments} countries={countries} />

        <aside className="space-y-6">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-5">
            <h2 className="text-sm font-bold text-[var(--color-primary-950)]">What happens next</h2>
            <ul className="mt-4 space-y-3 text-sm text-[var(--color-neutral-600)]">
              {[
                'We review your treatment goals and destination preferences.',
                'You receive clinic options ranked by verified patient data.',
                'No referral fees — independent guidance only.',
              ].map((step) => (
                <li key={step} className="flex gap-2">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-[var(--color-accent-600)]"
                    aria-hidden="true"
                  />
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-[var(--color-neutral-500)]">
            Prefer to explore on your own?{' '}
            <Link href={countriesHubPath(locale)} className="font-medium text-[var(--color-accent-600)] hover:underline">
              Browse destinations
            </Link>{' '}
            or read patient guides first.
          </p>
        </aside>
      </div>
    </div>
  )
}
