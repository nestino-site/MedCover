import Link from 'next/link'
import { localizedPath, type Locale } from '@/lib/i18n'

interface LogoProps {
  className?: string
  locale?: Locale
}

export function Logo({ className, locale = 'en' }: LogoProps) {
  return (
    <Link
      href={localizedPath('/', locale)}
      className={`inline-flex shrink-0 items-center ${className ?? ''}`}
      aria-label="MedCover — Home"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 160 40"
        fill="none"
        role="img"
        aria-label="MedCover"
        className="h-9 w-auto"
      >
        <rect x="2" y="4" width="24" height="32" rx="4" fill="#0f2040" />
        <rect x="8" y="2" width="24" height="32" rx="4" fill="#1a3460" opacity="0.7" />
        <rect x="11" y="13" width="6" height="14" rx="1" fill="white" />
        <rect x="7" y="17" width="14" height="6" rx="1" fill="white" />
        <text
          x="42"
          y="26"
          fontFamily="var(--font-geist), ui-sans-serif, system-ui, sans-serif"
          fontSize="18"
          fontWeight="700"
          letterSpacing="-0.5"
          fill="#0f2040"
        >
          Med
        </text>
        <text
          x="80"
          y="26"
          fontFamily="var(--font-geist), ui-sans-serif, system-ui, sans-serif"
          fontSize="18"
          fontWeight="400"
          letterSpacing="-0.3"
          fill="#0f2040"
        >
          Cover
        </text>
      </svg>
    </Link>
  )
}
