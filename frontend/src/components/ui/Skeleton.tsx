import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  /** Use shimmer gradient instead of pulse */
  variant?: 'pulse' | 'shimmer'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const roundedMap = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
} as const

export function Skeleton({
  className,
  variant = 'shimmer',
  rounded = 'md',
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-[var(--color-neutral-100)]',
        variant === 'pulse' && 'animate-pulse',
        variant === 'shimmer' && 'skeleton-shimmer',
        roundedMap[rounded],
        className,
      )}
      style={style}
      {...props}
    />
  )
}

type SkeletonTextProps = {
  lines?: number
  className?: string
  widths?: string[]
}

const defaultWidths = ['w-full', 'w-5/6', 'w-4/6', 'w-3/4']

export function SkeletonText({ lines = 1, className, widths }: SkeletonTextProps) {
  const w = widths ?? defaultWidths
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3.5', w[i % w.length])} rounded="sm" />
      ))}
    </div>
  )
}

type SkeletonBlockProps = {
  aspectRatio?: string
  className?: string
  rounded?: SkeletonProps['rounded']
}

export function SkeletonBlock({
  aspectRatio = '16/10',
  className,
  rounded = 'none',
}: SkeletonBlockProps) {
  return (
    <Skeleton
      className={className}
      rounded={rounded}
      style={{ aspectRatio } as CSSProperties}
    />
  )
}

type SkeletonStatusProps = {
  label?: string
  children: ReactNode
  className?: string
}

/** Wrapper that adds role="status" for screen readers */
export function SkeletonStatus({
  label = 'Loading',
  children,
  className,
}: SkeletonStatusProps) {
  return (
    <div role="status" aria-label={label} className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}
