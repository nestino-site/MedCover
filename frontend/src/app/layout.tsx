import type { Metadata, Viewport } from 'next'
import { GoogleTagManager } from '@next/third-parties/google'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WebMCPProvider } from '@/components/WebMCPProvider'
import { DEFAULT_LOCALE, getLocaleDir } from '@/lib/i18n/locales'
import { en } from '@/lib/i18n/en'
import { siteMetadataDefaults } from '@/lib/seo/site-metadata'

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

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

export const viewport: Viewport = {
  themeColor: '#0f2040',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light',
}

const siteDefaults = siteMetadataDefaults()

export const metadata: Metadata = {
  ...siteDefaults,
  title: {
    default: en.meta.layout.title,
    template: '%s | MedCover',
  },
  description: en.meta.layout.description,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    ...siteDefaults.openGraph,
    title: en.meta.layout.title,
    description: en.meta.layout.description,
  },
  twitter: {
    ...siteDefaults.twitter,
    title: en.meta.layout.title,
    description: en.meta.layout.description,
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
