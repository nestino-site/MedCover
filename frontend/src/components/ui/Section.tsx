import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type SectionWidth = 'wide' | 'narrow'
type SectionTone = 'plain' | 'subtle'

type SectionProps = {
  /** wide = max-w-7xl (hubs/listings), narrow = max-w-4xl (editorial). */
  width?: SectionWidth
  tone?: SectionTone
  id?: string
  className?: string
  containerClassName?: string
  children: ReactNode
}

const WIDTH_CLASSES: Record<SectionWidth, string> = {
  wide: 'max-w-7xl',
  narrow: 'max-w-4xl',
}

/**
 * Vertical-rhythm wrapper: one consistent section padding + container width
 * across all pages.
 */
export function Section({
  width = 'wide',
  tone = 'plain',
  id,
  className,
  containerClassName,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'py-[var(--spacing-section-sm)]',
        tone === 'subtle' && 'bg-[var(--color-surface-subtle)]',
        className,
      )}
    >
      <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', WIDTH_CLASSES[width], containerClassName)}>
        {children}
      </div>
    </section>
  )
}
