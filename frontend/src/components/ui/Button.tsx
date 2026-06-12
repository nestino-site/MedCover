import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type ButtonVariant = 'primary' | 'accent' | 'ghost' | 'ghostOnDark'
type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-primary-900)] text-white hover:bg-[var(--color-primary-700)]',
  accent:
    'bg-[var(--color-trust-500)] text-white shadow-md hover:bg-[var(--color-trust-400)]',
  ghost:
    'border border-[var(--color-border-strong)] bg-white text-[var(--color-primary-800)] hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]',
  ghostOnDark:
    'border border-white/20 text-white/90 hover:border-white/40 hover:text-white',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'gap-1.5 rounded-lg px-4 py-2 text-sm',
  md: 'gap-2 rounded-lg px-5 py-2.5 text-sm',
  lg: 'gap-2 rounded-xl px-7 py-3.5 text-sm',
}

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
  children: ReactNode
  onClick?: () => void
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  type = 'button',
  disabled,
  className,
  children,
  onClick,
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center font-semibold transition-colors',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    disabled && 'pointer-events-none opacity-60',
    className,
  )

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} disabled={disabled} className={classes} onClick={onClick}>
      {children}
    </button>
  )
}
