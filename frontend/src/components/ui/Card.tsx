import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type CardProps = {
  as?: ElementType
  /** Adds hover shadow + group class for image-zoom patterns. */
  interactive?: boolean
  className?: string
  children: ReactNode
}

/**
 * Single card shell used across the site (clinics, countries, guides,
 * related links) so radius/border/shadow stay consistent everywhere.
 */
export function Card({ as: Tag = 'div', interactive, className, children }: CardProps) {
  return (
    <Tag
      className={cn(
        'overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-sm',
        interactive && 'group transition-shadow hover:shadow-md',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
