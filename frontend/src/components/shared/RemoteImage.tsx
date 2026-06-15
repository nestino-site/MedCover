'use client'

import Image from 'next/image'
import { isNextImageOptimizable } from '@/lib/content/optimizable-image'
import { cn } from '@/lib/utils/cn'

type RemoteImageProps = {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
}

/** next/image for allowlisted hosts; native img for Google and other external clinic media. */
export function RemoteImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: RemoteImageProps) {
  if (isNextImageOptimizable(src)) {
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          sizes={sizes}
          priority={priority}
        />
      )
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={width ?? 1200}
        height={height ?? 630}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    )
  }

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn('h-full w-full', className)}
        sizes={sizes}
        fetchPriority={priority ? 'high' : undefined}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      fetchPriority={priority ? 'high' : undefined}
    />
  )
}
