import { cn } from '@/lib/utils/cn'

type AnswerBlockProps = {
  children: React.ReactNode
  speakable?: boolean
  label?: string
  className?: string
}

/**
 * The single summary/answer box used site-wide (hero answers, speakable
 * summaries). Sage accent surface, one typography.
 */
export function AnswerBlock({ children, speakable, label, className }: AnswerBlockProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--color-accent-200)] bg-[var(--color-accent-50)] px-6 py-5',
        className,
      )}
      {...(speakable ? { 'data-speakable': 'true' } : {})}
    >
      {label && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-700)]">
          {label}
        </p>
      )}
      <div className="text-lg leading-relaxed text-[var(--color-primary-900)]">{children}</div>
    </div>
  )
}
