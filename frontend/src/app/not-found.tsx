import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
        404
      </p>
      <h1 className="mt-4 text-[var(--text-4xl)] font-bold tracking-tight text-[var(--color-primary-950)]">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-[var(--color-neutral-600)]">
        This guide doesn&apos;t exist yet — but we might be building it.{' '}
        Browse all IVF destination guides instead.
      </p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/guides/"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary-900)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-800)] transition-colors"
        >
          <Search size={15} aria-hidden="true" />
          Browse Country Guides
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-6 py-3 text-sm font-medium text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)] transition-colors"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
