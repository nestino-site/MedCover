'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { hubPath, type HubId } from '@/lib/content/site-nav'
import type { Locale } from '@/lib/i18n'

type NavMoreItem = {
  id: HubId
  label: string
}

type NavMoreMenuProps = {
  locale: Locale
  items: NavMoreItem[]
  moreLabel: string
  soonLabel: string
}

export function NavMoreMenu({ locale, items, moreLabel, soonLabel }: NavMoreMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative hidden md:block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)] lg:px-4"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {moreLabel}
        <ChevronDown size={14} className={open ? 'rotate-180' : ''} aria-hidden="true" />
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 min-w-[10rem] rounded-xl border border-[var(--color-border)] bg-white py-1 shadow-lg"
        >
          {items.map((item) => (
            <li key={item.id} role="none">
              <Link
                href={hubPath(item.id, locale)}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-[var(--color-neutral-700)] hover:bg-[var(--color-primary-50)]"
              >
                {item.label}
                <span className="text-[10px] font-semibold uppercase text-[var(--color-neutral-400)]">
                  {soonLabel}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
