'use client'

import {
  createContext,
  useCallback,
  useContext,
  useTransition,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

type ClinicFilterNavigationContextValue = {
  isPending: boolean
  navigate: (url: string, replace?: boolean) => void
}

const ClinicFilterNavigationContext =
  createContext<ClinicFilterNavigationContextValue | null>(null)

export function ClinicFilterNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const navigate = useCallback(
    (url: string, replace = false) => {
      startTransition(() => {
        if (replace) {
          router.replace(url, { scroll: false })
        } else {
          router.push(url, { scroll: false })
        }
      })
    },
    [router],
  )

  return (
    <ClinicFilterNavigationContext.Provider value={{ isPending, navigate }}>
      {children}
    </ClinicFilterNavigationContext.Provider>
  )
}

export function useClinicFilterNavigation() {
  const ctx = useContext(ClinicFilterNavigationContext)
  if (!ctx) {
    throw new Error('useClinicFilterNavigation must be used within ClinicFilterNavigationProvider')
  }
  return ctx
}

export function useClinicFilterNavigationOptional() {
  const router = useRouter()
  const ctx = useContext(ClinicFilterNavigationContext)
  const [localPending, startTransition] = useTransition()

  const navigate = useCallback(
    (url: string, replace = false) => {
      if (ctx) {
        ctx.navigate(url, replace)
      } else {
        startTransition(() => {
          if (replace) {
            router.replace(url, { scroll: false })
          } else {
            router.push(url, { scroll: false })
          }
        })
      }
    },
    [ctx, router],
  )

  return {
    isPending: ctx?.isPending ?? localPending,
    navigate,
  }
}

interface ClinicPlpResultsRegionProps {
  children: ReactNode
  fallback: ReactNode
  className?: string
  minHeight?: string
}

/**
 * Overlays a skeleton on clinic PLP results while filters navigate (server refetch).
 */
export function ClinicPlpResultsRegion({
  children,
  fallback,
  className,
  minHeight = '16rem',
}: ClinicPlpResultsRegionProps) {
  const { isPending } = useClinicFilterNavigationOptional()

  return (
    <div
      className={cn('relative', className)}
      aria-busy={isPending}
      data-filter-pending={isPending ? '' : undefined}
      style={isPending ? { minHeight } : undefined}
    >
      {isPending && (
        <div
          className="absolute inset-0 z-10 rounded-xl bg-white/90 p-4 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-label="Updating clinic results"
        >
          {fallback}
        </div>
      )}
      <div
        className={cn(
          'transition-opacity duration-150',
          isPending && 'pointer-events-none opacity-40',
        )}
      >
        {children}
      </div>
    </div>
  )
}
