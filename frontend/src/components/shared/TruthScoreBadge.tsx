import { cn } from '@/lib/utils/cn'

type TruthScoreBadgeProps = {
  composite: number
  grade?: string | null
  size?: 'sm' | 'lg'
  className?: string
}

function gradeColor(grade: string | null | undefined): string {
  switch (grade?.toUpperCase()) {
    case 'A': return 'bg-[var(--color-accent-100)] text-[var(--color-accent-800)] border-[var(--color-accent-200)]'
    case 'B': return 'bg-[var(--color-primary-50)] text-[var(--color-primary-800)] border-[var(--color-primary-200)]'
    case 'C': return 'bg-[var(--color-trust-100)] text-[var(--color-trust-800)] border-[var(--color-trust-200)]'
    case 'D': return 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] border-[var(--color-neutral-200)]'
    default: return 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] border-[var(--color-neutral-200)]'
  }
}

export function TruthScoreBadge({ composite, grade, size = 'sm', className }: TruthScoreBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs',
        gradeColor(grade),
        className,
      )}
      title="MedCover Truth Score"
    >
      <span>{composite}/100</span>
      {grade && <span className="opacity-80">({grade})</span>}
    </span>
  )
}
