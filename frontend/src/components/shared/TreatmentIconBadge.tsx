import { getTreatmentIcon, getTreatmentIconStyle } from '@/lib/content/treatment-icons'
import { cn } from '@/lib/utils/cn'

const SIZE_CLASSES = {
  xs: { box: 'h-5 w-5 rounded', icon: 10 },
  sm: { box: 'h-6 w-6 rounded-md', icon: 12 },
  md: { box: 'h-8 w-8 rounded-lg', icon: 15 },
  lg: { box: 'h-10 w-10 rounded-xl', icon: 18 },
} as const

export function TreatmentIconBadge({
  treatmentId,
  size = 'md',
  className,
}: {
  treatmentId: string
  size?: keyof typeof SIZE_CLASSES
  className?: string
}) {
  const Icon = getTreatmentIcon(treatmentId)
  const style = getTreatmentIconStyle(treatmentId)
  const s = SIZE_CLASSES[size]

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center',
        style.bg,
        s.box,
        className,
      )}
      aria-hidden="true"
    >
      <Icon size={s.icon} className={style.color} />
    </span>
  )
}
