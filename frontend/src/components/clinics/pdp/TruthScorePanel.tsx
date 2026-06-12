import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import type { ClinicDetail } from '@/lib/api/types'
import { TruthScoreBadge } from '@/components/shared/TruthScoreBadge'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { dimensionLabel } from '@/lib/clinics/format'
import { cn } from '@/lib/utils/cn'
import { en } from '@/lib/i18n/en'

type TruthScorePanelProps = {
  clinic: ClinicDetail
}

function gradeLabel(grade: string | null | undefined): string | null {
  if (!grade) return null
  const key = `grade${grade.toUpperCase()}` as keyof typeof en.truthScore
  const label = en.truthScore[key]
  return typeof label === 'string' ? label : null
}

export function TruthScorePanel({ clinic }: TruthScorePanelProps) {
  const score = clinic.truthScore
  if (!score?.composite) return null

  const dimensions = score.dimensionScores
    ? Object.entries(score.dimensionScores).sort(([, a], [, b]) => b - a)
    : []

  const topDimensionCodes = new Set(dimensions.slice(0, 3).map(([code]) => code))
  const interviewCount = score.interviewCount ?? clinic.interviewCount
  const copy = en.clinicPdp.sections.truthScore
  const grade = gradeLabel(score.grade)
  const hasInterviews = (clinic.interviews?.length ?? 0) > 0

  return (
    <section
      id="truth-score"
      className="scroll-mt-28 rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-trust-50)] to-white p-6 sm:p-8"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
            className="mb-0"
          />
          {grade && (
            <p className="mt-2 text-sm font-semibold text-[var(--color-trust-700)]">{grade}</p>
          )}
        </div>
        <TruthScoreBadge composite={score.composite} grade={score.grade} size="lg" />
      </div>

      {interviewCount != null && interviewCount > 0 && (
        <p className="flex items-center gap-2 text-sm font-medium text-[var(--color-trust-800)]">
          <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
          {interviewCount} verified patient interview{interviewCount === 1 ? '' : 's'}
          {hasInterviews && (
            <>
              {' '}
              ·{' '}
              <Link href="#patient-voices" className="font-semibold underline-offset-2 hover:underline">
                Read patient voices
              </Link>
            </>
          )}
        </p>
      )}

      {dimensions.length > 0 && (
        <div className="mt-6 space-y-4">
          {dimensions.map(([code, value]) => {
            const isTop = topDimensionCodes.has(code)
            return (
              <div key={code}>
                <div className="mb-1 flex justify-between text-sm">
                  <span
                    className={cn(
                      'text-[var(--color-primary-900)]',
                      isTop ? 'font-bold' : 'font-medium',
                    )}
                  >
                    {dimensionLabel(code)}
                  </span>
                  <span className={cn('tabular-nums', isTop ? 'font-bold text-[var(--color-trust-700)]' : 'text-[var(--color-neutral-600)]')}>
                    {value}/100
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--color-neutral-200)]">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      isTop ? 'bg-[var(--color-trust-600)]' : 'bg-[var(--color-trust-500)]',
                    )}
                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {score.lastComputedAt && (
        <p className="mt-4 text-xs text-[var(--color-neutral-500)]">
          Last updated {new Date(score.lastComputedAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      )}
    </section>
  )
}
