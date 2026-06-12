'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type PdpScrollRowProps = {
  children: ReactNode
  ariaLabel: string
  itemWidth?: string
  showNavButtons?: boolean
  className?: string
  gapClassName?: string
}

export function PdpScrollRow({
  children,
  ariaLabel,
  itemWidth = 'min(85vw, 340px)',
  showNavButtons = true,
  className,
  gapClassName = 'gap-4',
}: PdpScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(el)
    return () => observer.disconnect()
  }, [updateScrollState, children])

  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.85
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <div className={cn('relative', className)}>
      {showNavButtons && canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy('left')}
          className="absolute -left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border)] bg-white shadow-md transition hover:bg-[var(--color-neutral-50)] lg:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-[var(--color-primary-800)]" />
        </button>
      )}
      {showNavButtons && canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy('right')}
          className="absolute -right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border)] bg-white shadow-md transition hover:bg-[var(--color-neutral-50)] lg:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-[var(--color-primary-800)]" />
        </button>
      )}

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 bg-gradient-to-r from-white to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-white to-transparent"
          aria-hidden="true"
        />

        <div
          ref={scrollRef}
          role="list"
          aria-label={ariaLabel}
          onScroll={updateScrollState}
          className={cn(
            'flex snap-x snap-mandatory overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            gapClassName,
          )}
          style={{ '--pdp-scroll-item-width': itemWidth } as React.CSSProperties}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export function PdpScrollRowItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      role="listitem"
      className={cn('w-[var(--pdp-scroll-item-width,340px)] shrink-0 snap-start', className)}
    >
      {children}
    </div>
  )
}
