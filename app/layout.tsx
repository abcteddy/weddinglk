import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://weddinglk.com'),
  title: {
    default: 'WeddingLK — 3D Wedding Invitations for Sri Lanka',
    template: '%s | WeddingLK',
  },
  description:
    'Create stunning 3D interactive wedding invitations. Share with a unique link, collect RSVPs in real-time. Built for Sri Lankan couples.',
  keywords: [
    'wedding invitation',
    'Sri Lanka wedding',
    'digital wedding card',
    '3D wedding invitation',
    'online RSVP',
    'wedding card Sri Lanka',
    'e-invite Sri Lanka',
  ],
  authors: [{ name: 'WeddingLK' }],
  openGraph: {
    type: 'website',
    locale: 'en_LK',
    siteName: 'WeddingLK',
    title: 'WeddingLK — 3D Wedding Invitations for Sri Lanka',
    description: 'Create stunning 3D interactive wedding invitations. Share with a unique link, collect RSVPs in real-time.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WeddingLK — 3D Wedding Invitations',
    description: 'Create stunning 3D interactive wedding invitations for Sri Lankan couples.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-wedding antialiased">
        {children}
      </body>
    </html>
  )
}
