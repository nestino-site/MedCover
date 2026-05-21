import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'
import type { ContentPage } from '@/lib/api/types'
import { en } from '@/lib/i18n/en'

interface HeroAnswerBlockProps {
  page: ContentPage
}

export function HeroAnswerBlock({ page }: HeroAnswerBlockProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-primary-950)] to-[var(--color-primary-800)] px-6 py-10 text-white sm:px-10 sm:py-14">
      {/* Background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle at 70% 50%, var(--color-primary-300) 0%, transparent 60%)`,
        }}
      />

      <div className="relative mx-auto max-w-3xl">
        {/* Eyebrow */}
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[var(--color-accent-400)]" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-400)]">
            {en.countryGuide.heroSubtitle}
          </span>
        </div>

        {/* H1 */}
        <h1 className="text-[var(--text-5xl)] font-bold leading-tight tracking-tight text-white">
          {page.title}
        </h1>

        {/* Hero answer — the AEO snippet, first 60 words after H1 */}
        {page.metaDescription && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--color-primary-200)]">
            {page.metaDescription}
          </p>
        )}

        {/* Trust signals */}
        {page.heroImage && (
          <div className="mt-8 flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white/20">
              <Image
                src={page.heroImage}
                alt="Country guide hero"
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <span className="text-sm text-[var(--color-primary-300)]">
              MedCover verified
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
