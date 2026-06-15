/** Hostnames allowed for next/image — keep in sync with next.config.ts remotePatterns. */
export function isNextImageOptimizable(url: string): boolean {
  if (url.startsWith('/')) return false

  try {
    const host = new URL(url).hostname
    return (
      host === 'res.cloudinary.com' ||
      host.endsWith('.cloudinary.com') ||
      host === 'nestino-backend-production.up.railway.app'
    )
  } catch {
    return false
  }
}
