import { ShieldCheck } from 'lucide-react'
import type { ContentPage } from '@/lib/api/types'
import { en } from '@/lib/i18n/en'
import { cn } from '@/lib/utils/cn'

function getGrade(score: number): { letter: string; label: string; color: string } {
  if (score >= 85) return { letter: 'A', label: en.truthScore.gradeA, color: 'text-[var(--color-accent-600)]' }
  if (score >= 70) return { letter: 'B', label: en.truthScore.gradeB, color: 'text-[var(--color-primary-600)]' }
  if (score >= 55) return { letter: 'C', label: en.truthScore.gradeC, color: 'text-[var(--color-trust-600)]' }
  if (score >= 40) return { letter: 'D', label: en.truthScore.gradeD, color: 'text-orange-600' }
  return { letter: 'F', label: en.truthScore.gradeF, color: 'text-red-600' }
}

interface TruthScoreCardProps {
  scores: ContentPage['scores']
}

export function TruthScoreCard({ scores }: TruthScoreCardProps) {
  if (scores.seo == null) return null

  const normalizedScore = Math.round(scores.seo)
  const grade = getGrade(normalizedScore)

  const dimensions = [
    { label: 'Readability', value: scores.readability },
    { label: 'Content Depth', value: scores.contentDepth },
    { label: 'Intent Match', value: scores.intentMatch },
    { label: 'SEO Quality', value: scores.seo },
  ].filter((d) => d.value != null) as { label: string; value: number }[]

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-start gap-6 p-6">
        {/* Score badge */}
        <div className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--color-primary-50)] p-4">
          <ShieldCheck
            size={20}
            className="mb-1 text-[var(--color-primary-600)]"
            aria-hidden="true"
          />
          <span className={cn('text-4xl font-bold leading-none', grade.color)}>
            {grade.letter}
          </span>
          <span className="mt-1 text-xs font-medium text-[var(--color-neutral-500)]">
            {normalizedScore}/100
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-500)]">
            {en.truthScore.label}
          </p>
          <p className={cn('mt-1 text-xl font-bold', grade.color)}>{grade.label}</p>
          <p className="mt-1 text-sm text-[var(--color-neutral-600)]">
            {en.truthScore.verifiedBy}
          </p>
        </div>
      </div>

      {/* Dimension bars */}
      {dimensions.length > 0 && (
        <div className="border-t border-[var(--color-border)] px-6 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {dimensions.map((dim) => (
              <div key={dim.label}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--color-neutral-600)]">
                    {dim.label}
                  </span>
                  <span className="text-xs font-semibold text-[var(--color-primary-800)]">
                    {Math.round(dim.value)}
                  </span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-neutral-100)]"
                  role="progressbar"
                  aria-valuenow={Math.round(dim.value)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={dim.label}
                >
                  <div
                    className="h-full rounded-full bg-[var(--color-primary-500)] transition-all"
                    style={{ width: `${Math.round(dim.value)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
