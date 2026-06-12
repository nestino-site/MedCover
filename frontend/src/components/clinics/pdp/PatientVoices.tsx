'use client'

import { useState } from 'react'
import { BadgeCheck, ChevronDown, Quote } from 'lucide-react'
import type { ClinicDetail } from '@/lib/api/types'
import { PdpScrollRow, PdpScrollRowItem } from '@/components/shared/PdpScrollRow'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/utils/cn'
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

function extractNegativeQuote(quotes: unknown): string | null {
  if (!quotes || typeof quotes !== 'object') return null
  return (quotes as InterviewQuotes).negative ?? null
}

function InterviewMeta({
  interview,
}: {
  interview: NonNullable<ClinicDetail['interviews']>[number]
}) {
  const copy = en.clinicPdp.sections.patientVoices
  const chips = [
    interview.ageBucket ? copy.age.replace('{bucket}', interview.ageBucket) : null,
    interview.originCountry ? copy.from.replace('{country}', interview.originCountry) : null,
    interview.treatmentCode ?? null,
    interview.completedYear ? String(interview.completedYear) : null,
  ].filter(Boolean)

  if (chips.length === 0) return null

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip}
          className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-[var(--color-trust-800)]"
        >
          {chip}
        </span>
      ))}
    </div>
  )
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-trust-100)] px-2.5 py-1 text-xs font-semibold text-[var(--color-trust-800)]">
      <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
      {en.clinicPdp.sections.patientVoices.verifiedBadge}
    </span>
  )
}

function BalancedView({ negativeQuote }: { negativeQuote: string }) {
  const [open, setOpen] = useState(false)
  const copy = en.clinicPdp.sections.patientVoices

  return (
    <div className="mt-4 border-t border-[var(--color-trust-200)] pt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left text-sm font-medium text-[var(--color-trust-800)]"
      >
        {copy.balancedView}
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-neutral-700)]">
          &ldquo;{negativeQuote}&rdquo;
        </p>
      )}
    </div>
  )
}

function FeaturedInterview({
  interview,
}: {
  interview: NonNullable<ClinicDetail['interviews']>[number]
}) {
  const quote = extractQuote(interview.quotes)
  const negativeQuote = extractNegativeQuote(interview.quotes)
  if (!quote) return null

  return (
    <blockquote className="relative overflow-hidden rounded-2xl border border-[var(--color-trust-200)] bg-gradient-to-br from-[var(--color-trust-50)] to-white p-6 sm:p-8">
      <Quote className="mb-4 h-10 w-10 text-[var(--color-trust-300)]" aria-hidden="true" />
      <VerifiedBadge />
      <p className="mt-4 text-lg leading-relaxed text-[var(--color-primary-950)] sm:text-xl">
        &ldquo;{quote}&rdquo;
      </p>
      <InterviewMeta interview={interview} />
      {negativeQuote && <BalancedView negativeQuote={negativeQuote} />}
    </blockquote>
  )
}

function CarouselInterviewCard({
  interview,
}: {
  interview: NonNullable<ClinicDetail['interviews']>[number]
}) {
  const quote = extractQuote(interview.quotes)
  const negativeQuote = extractNegativeQuote(interview.quotes)
  if (!quote) return null

  return (
    <blockquote className="flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
      <VerifiedBadge />
      <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--color-neutral-700)]">
        &ldquo;{quote}&rdquo;
      </p>
      <InterviewMeta interview={interview} />
      {negativeQuote && <BalancedView negativeQuote={negativeQuote} />}
    </blockquote>
  )
}

export function PatientVoices({ clinic }: PatientVoicesProps) {
  const interviews = clinic.interviews?.filter((i) => extractQuote(i.quotes)) ?? []
  if (interviews.length === 0) return null

  const copy = en.clinicPdp.sections.patientVoices
  const [featured, ...rest] = interviews

  return (
    <section id="patient-voices" className="scroll-mt-28">
      <SectionHeading
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        className="mb-6"
      />

      <div className="space-y-6">
        <FeaturedInterview interview={featured} />

        {rest.length > 0 && (
          <PdpScrollRow ariaLabel={copy.title} itemWidth="min(85vw, 360px)">
            {rest.map((interview, i) => (
              <PdpScrollRowItem key={`${interview.treatmentCode}-${i}`}>
                <CarouselInterviewCard interview={interview} />
              </PdpScrollRowItem>
            ))}
          </PdpScrollRow>
        )}
      </div>
    </section>
  )
}
