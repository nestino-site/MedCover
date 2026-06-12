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
  if (sections.length < 4) return null

  return (
    <nav
      aria-label={en.clinicPdp.sectionNav}
      className={cn(
        'sticky top-16 z-20 -mx-4 mb-8 border-b border-[var(--color-border)] bg-white/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:top-20',
        className,
      )}
    >
      <ul className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((section) => (
          <li key={section.id} className="shrink-0">
            <Link
              href={`#${section.id}`}
              className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-neutral-50)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary-800)] transition-colors hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]"
            >
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
