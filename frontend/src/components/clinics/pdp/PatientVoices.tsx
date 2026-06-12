import { Quote } from 'lucide-react'
import type { ClinicDetail } from '@/lib/api/types'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { en } from '@/lib/i18n/en'

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

  const copy = en.clinicPdp.sections.patientVoices

  return (
    <section id="patient-voices" className="scroll-mt-28">
      <SectionHeading
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        className="mb-6"
      />
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
              key={`${interview.treatmentCode}-${i}`}
              className="relative rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm"
            >
              <Quote
                className="mb-3 h-8 w-8 text-[var(--color-trust-300)]"
                aria-hidden="true"
              />
              <p className="text-[var(--color-neutral-700)] leading-relaxed">&ldquo;{quote}&rdquo;</p>
              {meta && (
                <footer className="mt-4 text-xs font-medium text-[var(--color-neutral-500)]">
                  {meta}
                </footer>
              )}
            </blockquote>
          )
        })}
      </div>
    </section>
  )
}
