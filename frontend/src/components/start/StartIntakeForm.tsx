'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import type { TreatmentCategoryDisplay } from '@/lib/content/treatments'
import { trackLeadSubmit } from '@/lib/analytics'

interface StartIntakeFormProps {
  treatments: TreatmentCategoryDisplay[]
  countries: { slug: string; name: string }[]
}

export function StartIntakeForm({ treatments, countries }: StartIntakeFormProps) {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[var(--color-trust-200)] bg-[var(--color-trust-50)] px-8 py-10 text-center">
        <CheckCircle2 className="mx-auto text-[var(--color-trust-600)]" size={40} aria-hidden="true" />
        <h2 className="mt-4 text-xl font-bold text-[var(--color-primary-950)]">Thanks — we&apos;ve got your details</h2>
        <p className="mt-2 text-sm text-[var(--color-neutral-600)]">
          We&apos;ll review your situation and follow up with clinic matches and cost context from verified patient data.
        </p>
      </div>
    )
  }

  const activeTreatments = treatments.filter((t) => t.status === 'active')

  return (
    <form
      className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        trackLeadSubmit({
          treatment: String(fd.get('treatment') ?? ''),
          country: String(fd.get('country') ?? ''),
        })
        setSubmitted(true)
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-[var(--color-primary-900)]">Email</span>
          <input
            type="email"
            name="email"
            required
            placeholder="you@email.com"
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-primary-100)]"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-[var(--color-primary-900)]">Treatment</span>
          <select
            name="treatment"
            required
            defaultValue={activeTreatments[0]?.id ?? ''}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-primary-100)]"
          >
            {activeTreatments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-[var(--color-primary-900)]">Preferred destination</span>
          <select
            name="country"
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-primary-100)]"
          >
            <option value="">Not sure yet</option>
            {countries.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-[var(--color-primary-900)]">
            Tell us about your situation
          </span>
          <textarea
            name="notes"
            rows={4}
            placeholder="Age, prior treatment, timeline, budget range, or questions..."
            className="w-full resize-y rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-primary-100)]"
          />
        </label>
      </div>

      <p className="mt-4 text-xs text-[var(--color-neutral-500)]">
        Independent matching based on verified patient data — not clinic referral fees.
      </p>

      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-trust-500)] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-trust-400)] sm:w-auto"
      >
        Get matched
        <ArrowRight size={16} aria-hidden="true" />
      </button>
    </form>
  )
}
