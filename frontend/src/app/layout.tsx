import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://medcover.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'MedCover — Verified IVF Clinic Data for Medical Tourists',
    template: '%s | MedCover',
  },
  description:
    'Verified patient interviews and real cost data for IVF clinics abroad. Find the best IVF destination based on truth — not clinic marketing.',
  keywords: ['IVF abroad', 'medical tourism', 'IVF clinics', 'fertility treatment abroad'],
  authors: [{ name: 'MedCover' }],
  creator: 'MedCover',
  publisher: 'MedCover',
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
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col bg-[var(--color-surface)] font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
