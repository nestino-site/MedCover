import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { en } from '@/lib/i18n/en'

interface CtaBlockProps {
  headline?: string
  description?: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  variant?: 'default' | 'compact'
}

export function CtaBlock({
  headline = 'Get Your Personalized IVF Report',
  description = 'Based on verified patient interviews — not clinic marketing.',
  primaryLabel = en.cta.primaryLabel,
  primaryHref = en.cta.primaryHref,
  secondaryLabel = en.cta.shareStory,
  secondaryHref = en.cta.shareHref,
  variant = 'default',
}: CtaBlockProps) {
  if (variant === 'compact') {
    return (
      <section className="not-prose mt-10 overflow-hidden rounded-xl border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] px-6 py-8 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-primary-950)] sm:text-2xl">
            {headline}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-neutral-600)] sm:text-base">{description}</p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-800)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
            >
              {primaryLabel}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-primary-300)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--color-primary-700)] transition-colors hover:border-[var(--color-primary-400)] hover:bg-white"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="not-prose mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-primary-900)] to-[var(--color-primary-800)] px-6 py-10 sm:px-10 sm:py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          {headline}
        </h2>
        <p className="mt-3 text-[var(--color-primary-200)]">{description}</p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-trust-500)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-[var(--color-trust-400)] transition-colors"
          >
            {primaryLabel}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-sm font-medium text-[var(--color-primary-100)] hover:border-white/40 hover:text-white transition-colors"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
