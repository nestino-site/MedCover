import Link from 'next/link'
import { FlaskConical, Languages, ShieldCheck, Star } from 'lucide-react'
import type { ClinicDetail } from '@/lib/api/types'
import { TruthScoreBadge } from '@/components/shared/TruthScoreBadge'
import { cn } from '@/lib/utils/cn'
import { en } from '@/lib/i18n/en'

type ClinicAtAGlanceProps = {
  clinic: ClinicDetail
  className?: string
}

type ChipProps = {
  href?: string
  children: React.ReactNode
  className?: string
  title?: string
}

function Chip({ href, children, className, title }: ChipProps) {
  const base =
    'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--color-primary-900)] shadow-sm transition-colors hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]'

  if (href) {
    return (
      <Link href={href} title={title} className={cn(base, className)}>
        {children}
      </Link>
    )
  }

  return (
    <span title={title} className={cn(base, className)}>
      {children}
    </span>
  )
}

export function ClinicAtAGlance({ clinic, className }: ClinicAtAGlanceProps) {
  const copy = en.clinicPdp.atAGlance
  const chips: React.ReactNode[] = []

  if (clinic.truthScore?.composite != null) {
    chips.push(
      <Chip key="truth-score" href="#truth-score" className="gap-2 border-[var(--color-trust-200)] bg-[var(--color-trust-50)]">
        <ShieldCheck className="h-4 w-4 text-[var(--color-trust-600)]" aria-hidden="true" />
        <TruthScoreBadge
          composite={clinic.truthScore.composite}
          grade={clinic.truthScore.grade}
          size="sm"
        />
      </Chip>,
    )
  }

  if (clinic.googleRating != null) {
    chips.push(
      <Chip key="reviews" href="#reviews">
        <Star className="h-4 w-4 fill-[var(--color-trust-400)] text-[var(--color-trust-400)]" aria-hidden="true" />
        {copy.googleReviews
          .replace('{rating}', clinic.googleRating.toFixed(1))
          .replace('{count}', String(clinic.googleReviewCount ?? clinic.googleReviews?.length ?? 0))}
      </Chip>,
    )
  }

  const interviewCount = clinic.truthScore?.interviewCount ?? clinic.interviewCount
  if (interviewCount != null && interviewCount > 0) {
    chips.push(
      <Chip key="interviews" href="#patient-voices">
        {interviewCount === 1
          ? copy.interviews.replace('{count}', String(interviewCount))
          : copy.interviewsPlural.replace('{count}', String(interviewCount))}
      </Chip>,
    )
  }

  if (clinic.foundedYear) {
    chips.push(
      <Chip key="founded">{copy.founded.replace('{year}', String(clinic.foundedYear))}</Chip>,
    )
  }

  if (clinic.inHouseLab) {
    chips.push(
      <Chip key="lab">
        <FlaskConical className="h-4 w-4 text-[var(--color-accent-600)]" aria-hidden="true" />
        {copy.inHouseLab}
      </Chip>,
    )
  }

  if (clinic.languages?.length) {
    chips.push(
      <Chip key="languages">
        <Languages className="h-4 w-4 text-[var(--color-neutral-500)]" aria-hidden="true" />
        {copy.languages.replace('{list}', clinic.languages.join(', '))}
      </Chip>,
    )
  }

  for (const acc of clinic.accreditations) {
    chips.push(
      <Chip key={acc.code} title={acc.regulator ?? undefined}>
        {acc.name}
      </Chip>,
    )
  }

  if (chips.length === 0) return null

  return (
    <div
      className={cn(
        'relative -mx-4 border-y border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-3 sm:-mx-6 sm:px-6',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-6 bg-gradient-to-r from-[var(--color-surface-subtle)] to-transparent sm:w-8" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-6 bg-gradient-to-l from-[var(--color-surface-subtle)] to-transparent sm:w-8" aria-hidden="true" />
      <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips}
      </div>
    </div>
  )
}
