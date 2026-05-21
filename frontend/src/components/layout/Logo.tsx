import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={className} aria-label="MedCover — Home">
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
