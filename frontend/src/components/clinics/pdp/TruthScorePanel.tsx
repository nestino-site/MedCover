import type { ClinicDetail } from '@/lib/api/types'
import { TruthScoreBadge } from '@/components/shared/TruthScoreBadge'
import { dimensionLabel } from '@/lib/clinics/format'

type TruthScorePanelProps = {
  clinic: ClinicDetail
}

export function TruthScorePanel({ clinic }: TruthScorePanelProps) {
  const score = clinic.truthScore
  if (!score?.composite) return null

  const dimensions = score.dimensionScores
    ? Object.entries(score.dimensionScores).sort(([, a], [, b]) => b - a)
    : []

  const interviewCount = score.interviewCount ?? clinic.interviewCount

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-trust-50)] to-white p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary-950)]">MedCover Truth Score</h2>
          <p className="mt-1 text-sm text-[var(--color-neutral-600)]">
            Based on verified patient interviews and transparency signals
          </p>
        </div>
        <TruthScoreBadge composite={score.composite} grade={score.grade} size="lg" />
      </div>

      {interviewCount != null && interviewCount > 0 && (
        <p className="mt-4 text-sm font-medium text-[var(--color-trust-800)]">
          {interviewCount} verified patient interview{interviewCount === 1 ? '' : 's'}
        </p>
      )}

      {dimensions.length > 0 && (
        <div className="mt-6 space-y-4">
          {dimensions.map(([code, value]) => (
            <div key={code}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-[var(--color-primary-900)]">
                  {dimensionLabel(code)}
                </span>
                <span className="text-[var(--color-neutral-600)]">{value}/100</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--color-neutral-200)]">
                <div
                  className="h-full rounded-full bg-[var(--color-trust-500)] transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {score.lastComputedAt && (
        <p className="mt-4 text-xs text-[var(--color-neutral-500)]">
          Last updated {new Date(score.lastComputedAt).toLocaleDateString()}
        </p>
      )}
    </section>
  )
}
