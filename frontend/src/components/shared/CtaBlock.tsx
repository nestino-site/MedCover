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
}

export function CtaBlock({
  headline = 'Get Your Personalized IVF Report',
  description = 'Based on verified patient interviews — not clinic marketing.',
  primaryLabel = en.cta.primaryLabel,
  primaryHref = en.cta.primaryHref,
  secondaryLabel = en.cta.shareStory,
  secondaryHref = en.cta.shareHref,
}: CtaBlockProps) {
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
