import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  /** Optional action rendered on the right (e.g. a "View all" link). */
  action?: ReactNode
  align?: 'left' | 'center'
  as?: 'h2' | 'h3'
  className?: string
}

/**
 * One heading pattern for every page section: eyebrow + H2 (text-2xl) +
 * optional description, so the type scale stays identical site-wide.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  as: Heading = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-8 flex flex-wrap items-end justify-between gap-4',
        align === 'center' && 'justify-center text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-600)]">
            {eyebrow}
          </p>
        )}
        <Heading className="text-2xl font-bold tracking-tight text-[var(--color-primary-950)]">
          {title}
        </Heading>
        {description && (
          <p className="mt-2 text-[var(--color-neutral-600)]">{description}</p>
        )}
      </div>
      {action && align === 'left' && <div className="shrink-0">{action}</div>}
    </div>
  )
}
