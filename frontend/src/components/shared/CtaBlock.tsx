'use client'

import { ArrowRight } from 'lucide-react'
import { en } from '@/lib/i18n/en'
import { Button } from '@/components/ui/Button'
import { trackCtaClick } from '@/lib/analytics'

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
            <Button href={primaryHref} variant="primary" size="md" onClick={() => trackCtaClick({ label: primaryLabel, location: 'cta_compact' })}>
              {primaryLabel}
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <Button href={secondaryHref} variant="ghost" size="md" onClick={() => trackCtaClick({ label: secondaryLabel, location: 'cta_compact' })}>
              {secondaryLabel}
            </Button>
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
          <Button href={primaryHref} variant="accent" size="lg" onClick={() => trackCtaClick({ label: primaryLabel, location: 'cta_default' })}>
            {primaryLabel}
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
          <Button href={secondaryHref} variant="ghostOnDark" size="lg" onClick={() => trackCtaClick({ label: secondaryLabel, location: 'cta_default' })}>
            {secondaryLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}
