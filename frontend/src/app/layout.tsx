import type { Metadata, Viewport } from 'next'
import { GoogleTagManager } from '@next/third-parties/google'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WebMCPProvider } from '@/components/WebMCPProvider'
import { DEFAULT_LOCALE, getLocaleDir } from '@/lib/i18n/locales'
import { en } from '@/lib/i18n/en'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: en.meta.layout.title,
    template: '%s | MedCover',
  },
  description: en.meta.layout.description,
  keywords: [...en.meta.layout.keywords],
  authors: [{ name: 'MedCover' }],
  creator: 'MedCover',
  publisher: 'MedCover',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    siteName: 'MedCover',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@medcover',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = DEFAULT_LOCALE
  const dir = getLocaleDir(locale)

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      {process.env.NODE_ENV === 'production' && GTM_ID ? (
        <GoogleTagManager gtmId={GTM_ID} />
      ) : null}
      <body className="flex min-h-dvh flex-col bg-[var(--color-surface)] font-sans antialiased">
        <WebMCPProvider />
        <Header locale={locale} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} />
      </body>
    </html>
  )
}
