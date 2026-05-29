'use client'

import {
  createContext,
  useCallback,
  useContext,
  useTransition,
  type ReactNode,
} from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

type FilterNavigationContextValue = {
  isPending: boolean
  pushFilterUrl: (pathname: string, params: URLSearchParams) => void
}

const FilterNavigationContext = createContext<FilterNavigationContextValue | null>(null)

export function FilterNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const pushFilterUrl = useCallback(
    (pathname: string, params: URLSearchParams) => {
      const qs = params.toString()
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      })
    },
    [router],
  )

  return (
    <FilterNavigationContext.Provider value={{ isPending, pushFilterUrl }}>
      {children}
    </FilterNavigationContext.Provider>
  )
}

export function useFilterNavigation() {
  const ctx = useContext(FilterNavigationContext)
  if (!ctx) {
    throw new Error('useFilterNavigation must be used within FilterNavigationProvider')
  }
  return ctx
}

/** Optional hook for components outside the provider (falls back to non-transition push). */
export function useFilterNavigationOptional() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const ctx = useContext(FilterNavigationContext)
  const [localPending, startTransition] = useTransition()

  const pushParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      mutate(params)
      const qs = params.toString()
      const target = qs ? `${pathname}?${qs}` : pathname
      if (ctx) {
        ctx.pushFilterUrl(pathname, params)
      } else {
        startTransition(() => {
          router.push(target, { scroll: false })
        })
      }
    },
    [ctx, pathname, router, searchParams],
  )

  return {
    isPending: ctx?.isPending ?? localPending,
    pushParams,
  }
}

interface FilteredResultsRegionProps {
  children: ReactNode
  fallback: ReactNode
  className?: string
}

/**
 * Shows a skeleton immediately when filters change, while keeping prior results visible underneath.
 */
export function FilteredResultsRegion({
  children,
  fallback,
  className,
}: FilteredResultsRegionProps) {
  const { isPending } = useFilterNavigationOptional()

  return (
    <div
      className={cn('relative', className)}
      aria-busy={isPending}
      data-filter-pending={isPending ? '' : undefined}
    >
      {isPending && (
        <div
          className="absolute inset-0 z-10 min-h-[12rem] rounded-xl bg-white/90 backdrop-blur-[1px]"
          role="status"
          aria-live="polite"
          aria-label="Updating results"
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
