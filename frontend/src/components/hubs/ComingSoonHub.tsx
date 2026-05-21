import Link from 'next/link'
import { CrossHubNav } from './CrossHubNav'
import { getDictionary, localizedPath } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

type ComingSoonHubProps = {
  locale: Locale
  title: string
  description: string
}

export function ComingSoonHub({ locale, title, description }: ComingSoonHubProps) {
  const t = getDictionary(locale)

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:py-24">
      <span className="inline-flex rounded-full bg-[var(--color-primary-100)] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-700)]">
        {t.nav.soon}
      </span>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-[var(--color-primary-950)]">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-lg text-[var(--color-neutral-600)]">{description}</p>
      <p className="mt-8 text-sm font-medium text-[var(--color-neutral-500)]">
        {t.hubs.comingSoon.exploreActive}
      </p>
      <CrossHubNav locale={locale} className="mt-6 border-t-0 pt-4" />
      <Link
        href={localizedPath('/', locale)}
        className="mt-10 inline-flex text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
      >
        ← {t.notFound.backHome}
      </Link>
    </div>
  )
}
