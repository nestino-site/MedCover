import { Quote } from 'lucide-react'
import type { ClinicDetail } from '@/lib/api/types'

type InterviewQuotes = {
  positive?: string
  negative?: string
  summary?: string
}

type PatientVoicesProps = {
  clinic: ClinicDetail
}

function extractQuote(quotes: unknown): string | null {
  if (!quotes || typeof quotes !== 'object') return null
  const q = quotes as InterviewQuotes
  return q.positive ?? q.summary ?? q.negative ?? null
}

export function PatientVoices({ clinic }: PatientVoicesProps) {
  const interviews = clinic.interviews?.filter((i) => extractQuote(i.quotes)) ?? []
  if (interviews.length === 0) return null

  return (
    <section>
      <h2 className="mb-2 text-2xl font-bold text-[var(--color-primary-950)]">Verified patient voices</h2>
      <p className="mb-6 text-sm text-[var(--color-neutral-600)]">
        Quotes from MedCover-verified patient interviews
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {interviews.map((interview, i) => {
          const quote = extractQuote(interview.quotes)
          if (!quote) return null

          const meta = [
            interview.ageBucket ? `Age ${interview.ageBucket}` : null,
            interview.originCountry ? `From ${interview.originCountry}` : null,
            interview.treatmentCode,
            interview.completedYear ? String(interview.completedYear) : null,
          ]
            .filter(Boolean)
            .join(' · ')

          return (
            <blockquote
              key={i}
              className="relative rounded-2xl border border-[var(--color-accent-200)] bg-[var(--color-accent-50)] p-6"
            >
              <Quote className="mb-3 h-6 w-6 text-[var(--color-accent-400)]" aria-hidden />
              <p className="text-[var(--color-neutral-800)] leading-relaxed">&ldquo;{quote}&rdquo;</p>
              {meta && (
                <footer className="mt-4 text-xs font-medium text-[var(--color-neutral-500)]">{meta}</footer>
              )}
            </blockquote>
          )
        })}
      </div>
    </section>
  )
}
