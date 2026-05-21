import Image from 'next/image'
import { ShieldCheck } from 'lucide-react'
import type { ContentPage } from '@/lib/api/types'
import { en } from '@/lib/i18n/en'

interface HeroAnswerBlockProps {
  page: ContentPage
}

const trustChips = ['Verified Data', 'Patient Interviews', 'Independent']

export function HeroAnswerBlock({ page }: HeroAnswerBlockProps) {
  const lastUpdated = page.updatedAt
    ? new Date(page.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <div className="on-dark relative -mx-4 overflow-hidden bg-gradient-to-br from-[var(--color-primary-950)] via-[var(--color-primary-900)] to-[var(--color-accent-900)] px-6 py-10 text-white sm:-mx-6 sm:px-10 sm:py-14">
      {page.heroImage && (
        <div
          className="pointer-events-none absolute right-0 top-1/2 h-64 w-64 -translate-y-1/2 translate-x-1/4 overflow-hidden rounded-full opacity-50 blur-2xl sm:h-80 sm:w-80"
          aria-hidden="true"
        >
          <Image
            src={page.heroImage}
            alt=""
            fill
            className="object-cover"
            sizes="320px"
          />
        </div>
      )}

      <div className="relative mx-auto max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-400)]">
          {en.countryGuide.heroSubtitle}
        </p>

        <h1 className="text-5xl font-bold leading-tight tracking-tight text-white">
          {page.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-2">
          {trustChips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-[var(--color-accent-400)]/30 bg-white/5 px-3 py-1 text-xs font-medium text-[var(--color-accent-400)]"
            >
              {chip}
            </span>
          ))}
        </div>

        {page.metaDescription && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--color-primary-200)]">
            {page.metaDescription}
          </p>
        )}

        <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-500)]/20">
            <ShieldCheck size={20} className="text-[var(--color-accent-400)]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">MedCover verified</p>
            {lastUpdated && (
              <p className="text-xs text-[var(--color-primary-300)]">
                {en.page.lastUpdated} {lastUpdated}
              </p>
            )}
          </div>
          {page.heroImage && (
            <div className="relative ml-2 h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white/20">
              <Image
                src={page.heroImage}
                alt=""
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
