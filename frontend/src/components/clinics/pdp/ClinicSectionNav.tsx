'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { en } from '@/lib/i18n/en'

export type ClinicSectionNavItem = {
  id: string
  label: string
}

type ClinicSectionNavProps = {
  sections: ClinicSectionNavItem[]
  className?: string
}

export function ClinicSectionNav({ sections, className }: ClinicSectionNavProps) {
  if (sections.length < 2) return null

  return (
    <nav
      aria-label={en.clinicPdp.sectionNav}
      className={cn(
        'sticky top-16 z-20 -mx-4 mb-8 border-b border-[var(--color-border)] bg-white/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:top-20',
        className,
      )}
    >
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white/95 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-white/95 to-transparent"
          aria-hidden="true"
        />
      <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((section) => (
          <li key={section.id} className="shrink-0 snap-start">
            <Link
              href={`#${section.id}`}
              className="inline-flex min-h-9 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-neutral-50)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary-800)] transition-colors hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]"
            >
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
      </div>
    </nav>
  )
}
