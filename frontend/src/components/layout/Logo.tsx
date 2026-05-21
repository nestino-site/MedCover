import Link from 'next/link'
import Image from 'next/image'
import { localizedPath, type Locale } from '@/lib/i18n'

interface LogoProps {
  className?: string
  locale?: Locale
}

export function Logo({ className, locale = 'en' }: LogoProps) {
  return (
    <Link href={localizedPath('/', locale)} className={className} aria-label="MedCover — Home">
      <Image
        src="/medcover-logo.svg"
        alt="MedCover"
        width={140}
        height={36}
        priority
        className="h-9 w-auto"
      />
    </Link>
  )
}
