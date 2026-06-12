'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import Link from 'next/link'
import { Clock, Globe, Search, Stethoscope, Star, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { TruthScoreBadge } from '@/components/shared/TruthScoreBadge'
import { SearchResultSkeleton } from '@/components/search/SearchResultSkeleton'
import type { ClinicCard } from '@/lib/api/types'
import { trackSearch } from '@/lib/analytics'

type SearchResult = {
  clinics: ClinicCard[]
  treatments: Array<{ slug: string; name: string; clinicCount?: number }>
  countries: Array<{ slug: string; name: string; clinicCount?: number; flagEmoji?: string }>
  cities: Array<{ slug: string; name: string; country?: string; clinicCount?: number }>
  guides: Array<{ slug: string; title: string; description?: string }>
  suggestions?: {
    countries: Array<{ slug: string; name: string; clinicCount?: number; flagEmoji?: string }>
    treatments: Array<{ slug: string; name: string; clinicCount?: number }>
  }
}

type SearchScope = 'all' | 'clinics' | 'destinations' | 'treatments' | 'guides'

type FlatResult = {
  href: string
  title: string
  subtitle?: string
  group: string
  flagEmoji?: string
  clinic?: ClinicCard
}

type RecentSearch = {
  title: string
  href: string
}

const RECENT_KEY = 'medcover-recent-searches'
const MAX_RECENT = 5

type SearchModalProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

function loadRecent(): RecentSearch[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as RecentSearch[]) : []
  } catch {
    return []
  }
}

function saveRecent(item: RecentSearch) {
  const existing = loadRecent().filter((r) => r.href !== item.href)
  const next = [item, ...existing].slice(0, MAX_RECENT)
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}

function flattenResults(results: SearchResult, scope: SearchScope): FlatResult[] {
  const items: FlatResult[] = []

  if (scope === 'all' || scope === 'clinics') {
    for (const c of results.clinics) {
      const href = c.urlPath.endsWith('/') ? c.urlPath : `${c.urlPath}/`
      items.push({
        href,
        title: c.name,
        subtitle: [c.city?.name, c.country?.name].filter(Boolean).join(', '),
        group: 'Clinics',
        clinic: c,
      })
    }
  }

  if (scope === 'all' || scope === 'treatments') {
    for (const t of results.treatments) {
      items.push({
        href: `/treatments/${t.slug}/`,
        title: t.name,
        subtitle: t.clinicCount ? `${t.clinicCount} clinics` : undefined,
        group: 'Treatments',
      })
    }
  }

  if (scope === 'all' || scope === 'destinations') {
    for (const c of results.countries) {
      items.push({
        href: `/clinics/${c.slug}/`,
        title: c.name,
        subtitle: c.clinicCount ? `${c.clinicCount} clinics` : undefined,
        group: 'Countries',
        flagEmoji: c.flagEmoji,
      })
    }
    for (const c of results.cities) {
      items.push({
        href: `/clinics/${c.country}/${c.slug}/`,
        title: c.name,
        subtitle: c.clinicCount ? `${c.clinicCount} clinics` : undefined,
        group: 'Cities',
      })
    }
  }

  if (scope === 'all' || scope === 'guides') {
    for (const g of results.guides) {
      const href = g.slug.endsWith('/') ? g.slug : `${g.slug}/`
      items.push({
        href,
        title: g.title,
        subtitle: g.description,
        group: 'Guides',
      })
    }
  }

  return items
}

const SCOPE_TABS: { id: SearchScope; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'clinics', label: 'Clinics' },
  { id: 'destinations', label: 'Destinations' },
  { id: 'treatments', label: 'Treatments' },
  { id: 'guides', label: 'Guides' },
]

export function SearchModal({ open: controlledOpen, onOpenChange, trigger }: SearchModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [scope, setScope] = useState<SearchScope>('all')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [recent, setRecent] = useState<RecentSearch[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setOpen])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setRecent(loadRecent())
    } else {
      setQuery('')
      setResults(null)
      setScope('all')
      setActiveIndex(-1)
    }
  }, [open])

  const runSearch = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
      if (res.ok) {
        setResults(await res.json())
        setActiveIndex(-1)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, runSearch])

  const flatResults = useMemo(
    () => (results ? flattenResults(results, scope) : []),
    [results, scope],
  )

  const handleSelect = (item: FlatResult | RecentSearch) => {
    if (query.trim().length >= 2) trackSearch({ query: query.trim() })
    saveRecent({ title: item.title, href: item.href })
    setRecent(loadRecent())
    setOpen(false)
  }

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0 && flatResults[activeIndex]) {
      e.preventDefault()
      const item = flatResults[activeIndex]
      if (query.trim().length >= 2) trackSearch({ query: query.trim() })
      saveRecent({ title: item.title, href: item.href })
      window.location.href = item.href
      setOpen(false)
    }
  }

  const hasQuery = query.trim().length >= 2
  const hasResults = flatResults.length > 0
  const suggestions = results?.suggestions

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-[10%] z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2',
            'rounded-2xl border border-[var(--color-border)] bg-white shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        >
          <Dialog.Title className="sr-only">Search</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-[var(--color-neutral-400)]" />
            <input
              ref={inputRef}
              type="search"
              placeholder="Search clinics, treatments, destinations, guides…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              className="flex-1 bg-transparent text-base outline-none placeholder:text-[var(--color-neutral-400)]"
            />
            <kbd className="hidden rounded border border-[var(--color-border)] px-1.5 py-0.5 text-xs text-[var(--color-neutral-400)] sm:inline">
              ⌘K
            </kbd>
            <Dialog.Close className="rounded-lg p-1 hover:bg-[var(--color-neutral-100)]">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          {hasQuery && (
            <div className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)] px-3 py-2">
              {SCOPE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setScope(tab.id)
                    setActiveIndex(-1)
                  }}
                  className={cn(
                    'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    scope === tab.id
                      ? 'bg-[var(--color-primary-900)] text-white'
                      : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2" aria-busy={loading}>
            {loading && <SearchResultSkeleton count={4} />}

            {!loading && hasQuery && !hasResults && (
              <p className="px-4 py-8 text-center text-sm text-[var(--color-neutral-500)]">No results found</p>
            )}

            {!loading && hasQuery && hasResults && (
              <div className="space-y-1">
                {flatResults.map((item, i) => (
                  <Link
                    key={`${item.href}-${i}`}
                    href={item.href}
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors',
                      i === activeIndex
                        ? 'bg-[var(--color-primary-100)]'
                        : 'hover:bg-[var(--color-primary-50)]',
                    )}
                  >
                    {item.flagEmoji && (
                      <span className="mt-0.5 text-lg leading-none" role="img" aria-hidden="true">
                        {item.flagEmoji}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--color-primary-900)]">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-sm text-[var(--color-neutral-500)]">{item.subtitle}</p>
                      )}
                      {item.clinic && (
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {item.clinic.googleRating != null && (
                            <span className="inline-flex items-center gap-1 text-xs text-[var(--color-neutral-600)]">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {item.clinic.googleRating.toFixed(1)}
                            </span>
                          )}
                          {item.clinic.truthScore?.composite != null && (
                            <TruthScoreBadge
                              composite={item.clinic.truthScore.composite}
                              grade={item.clinic.truthScore.grade}
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-[var(--color-neutral-400)]">
                      {item.group}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {!loading && !hasQuery && (
              <div className="space-y-4 p-2">
                {recent.length > 0 && (
                  <div>
                    <p className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                      <Clock className="h-3.5 w-3.5" />
                      Recent
                    </p>
                    {recent.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => handleSelect(item)}
                        className="block rounded-lg px-3 py-2.5 hover:bg-[var(--color-primary-50)]"
                      >
                        <p className="font-medium text-[var(--color-primary-900)]">{item.title}</p>
                      </Link>
                    ))}
                  </div>
                )}

                {suggestions && suggestions.countries.length > 0 && (
                  <div>
                    <p className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                      <Globe className="h-3.5 w-3.5" />
                      Popular destinations
                    </p>
                    {suggestions.countries.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/clinics/${c.slug}/`}
                        onClick={() => handleSelect({ title: c.name, href: `/clinics/${c.slug}/` })}
                        className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-[var(--color-primary-50)]"
                      >
                        {c.flagEmoji ? (
                          <span className="mt-0.5 text-lg leading-none" role="img" aria-hidden="true">
                            {c.flagEmoji}
                          </span>
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[var(--color-primary-900)]">{c.name}</p>
                          {c.clinicCount != null ? (
                            <p className="text-sm text-[var(--color-neutral-500)]">
                              {c.clinicCount} clinics
                            </p>
                          ) : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {suggestions && suggestions.treatments.length > 0 && (
                  <div>
                    <p className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                      <Stethoscope className="h-3.5 w-3.5" />
                      Popular treatments
                    </p>
                    {suggestions.treatments.map((t) => (
                      <Link
                        key={t.slug}
                        href={`/treatments/${t.slug}/`}
                        onClick={() => handleSelect({ title: t.name, href: `/treatments/${t.slug}/` })}
                        className="block rounded-lg px-3 py-2.5 hover:bg-[var(--color-primary-50)]"
                      >
                        <p className="font-medium text-[var(--color-primary-900)]">{t.name}</p>
                      </Link>
                    ))}
                  </div>
                )}

                {!suggestions && !recent.length && (
                  <p className="px-4 py-8 text-center text-sm text-[var(--color-neutral-500)]">
                    Type to search clinics, treatments, destinations, and guides
                  </p>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function SearchTriggerButton({ className }: { className?: string }) {
  return (
    <SearchModal
      trigger={
        <button
          type="button"
          className={cn(
            'flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-neutral-50)] px-3 py-2 text-sm text-[var(--color-neutral-500)] transition-colors hover:border-[var(--color-primary-200)] hover:bg-white',
            className,
          )}
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded border border-[var(--color-border)] bg-white px-1.5 py-0.5 text-[10px] lg:inline">
            ⌘K
          </kbd>
        </button>
      }
    />
  )
}
