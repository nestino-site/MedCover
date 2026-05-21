import Image from 'next/image'

interface HeroImageProps {
  src: string
  alt: string
  priority?: boolean
}

export function HeroImage({ src, alt, priority = true }: HeroImageProps) {
  return (
    <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl bg-[var(--color-primary-100)]">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        className="object-cover"
      />
    </div>
  )
}
