import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type CardGridSkeletonProps = {
  count?: number
  children: ReactNode
  className?: string
  gridClassName?: string
}

export function CardGridSkeleton({
  count = 6,
  children,
  className,
  gridClassName = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3',
}: CardGridSkeletonProps) {
  return (
    <div className={cn(gridClassName, className)} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{children}</div>
      ))}
    </div>
  )
}
