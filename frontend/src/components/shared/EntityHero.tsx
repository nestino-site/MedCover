import type { ReactNode } from 'react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import type { BreadcrumbItem } from '@/lib/api/types'
import { AnswerBlock } from './AnswerBlock'

export type EntityHeroStat = {
  label: string
  value: string
}

type EntityHeroProps = {
  breadcrumbs: BreadcrumbItem[]
  title: string
  eyebrow?: string
  /** Optional flag emoji rendered before the title (country/city landings). */
  flag?: string
  description?: string
  answer?: string
  answerLabel?: string
  /** Slim inline stat row under the description (replaces standalone StatStrips). */
  stats?: EntityHeroStat[]
  children?: ReactNode
}

export function EntityHero({
  breadcrumbs,
  title,
  eyebrow,
  flag,
  description,
  answer,
  answerLabel,
  stats,
  children,
}: EntityHeroProps) {
  return (
    <header className="mb-10 space-y-6">
      <Breadcrumb items={breadcrumbs} />
      <div className="max-w-3xl space-y-4">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-600)]">
            {eyebrow}
          </p>
        )}
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-primary-950)] sm:text-5xl">
          {flag && (
            <span className="mr-3 align-baseline" role="img" aria-hidden="true">
              {flag}
            </span>
          )}
          {title}
        </h1>
        {description && (
          <p className="text-lg text-[var(--color-neutral-600)]">{description}</p>
        )}
        {stats && stats.length > 0 && (
          <dl
            className="flex flex-wrap gap-x-8 gap-y-3 border-t border-[var(--color-border)] pt-4"
            data-speakable="true"
          >
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col">
                <dd className="text-xl font-bold tabular-nums text-[var(--color-primary-900)]">
                  {s.value}
                </dd>
                <dt className="text-xs text-[var(--color-neutral-500)]">{s.label}</dt>
              </div>
            ))}
          </dl>
        )}
        {answer && (
          <AnswerBlock speakable label={answerLabel}>
            {answer}
          </AnswerBlock>
        )}
      </div>
      {children}
    </header>
  )
}
