import type { ClinicDetail } from '@/lib/api/types'
import { TruthScoreBadge } from '@/components/shared/TruthScoreBadge'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { dimensionLabel } from '@/lib/clinics/format'
import { en } from '@/lib/i18n/en'

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
  const copy = en.clinicPdp.sections.truthScore

  return (
    <section
      id="truth-score"
      className="scroll-mt-28 rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-trust-50)] to-white p-6 sm:p-8"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <SectionHeading
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          className="mb-0"
        />
        <TruthScoreBadge composite={score.composite} grade={score.grade} size="lg" />
      </div>

      {interviewCount != null && interviewCount > 0 && (
        <p className="text-sm font-medium text-[var(--color-trust-800)]">
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
