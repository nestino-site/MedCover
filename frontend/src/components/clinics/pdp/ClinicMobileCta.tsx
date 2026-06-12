'use client'

import Link from 'next/link'
import { Phone } from 'lucide-react'
import { en } from '@/lib/i18n/en'

type ClinicMobileCtaProps = {
  phone?: string | null
}

export function ClinicMobileCta({ phone }: ClinicMobileCtaProps) {
  const copy = en.clinicPdp

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-white/95 p-3 backdrop-blur-sm lg:hidden">
      <div className="mx-auto flex max-w-7xl gap-2">
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-primary-900)]"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {copy.hero.call}
          </a>
        )}
        <Link
          href="/start/"
          className="flex flex-[2] items-center justify-center rounded-xl bg-[var(--color-primary-900)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-800)]"
        >
          {copy.sidebar.getQuote}
        </Link>
      </div>
    </div>
  )
}
