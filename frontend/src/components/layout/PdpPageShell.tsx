import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type PdpPageShellProps = {
  width?: 'wide' | 'narrow'
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function PdpPageShell({
  width = 'wide',
  children,
  footer,
  className,
}: PdpPageShellProps) {
  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        width === 'wide' ? 'max-w-7xl py-12' : 'max-w-4xl pb-16 pt-8',
        className,
      )}
    >
      {children}
      {footer}
    </div>
  )
}

export function PdpFooterBlock({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mt-16', className)}>{children}</div>
}
