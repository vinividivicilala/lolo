import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Menuru Official | Home',
  description: 'Menuru Brand from Love yourself',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/ai.jpg',
    apple: '/images/ai.jpg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Menuru',
  },
  openGraph: {
    title: 'Menuru Official | Home',
    description: 'Menuru Brand from Love yourself',
    images: [
      {
        url: '/images/ai.jpg',
        width: 1200,
        height: 630,
        alt: 'Menuru Official',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Menuru Official | Home',
    description: 'Menuru Brand from Love yourself',
    images: ['/images/ai.jpg'],
  },
}

export const viewport: Viewport = {
  themeColor: '#8be9fd',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={plusJakarta.className}
      style={{
        margin: 0,
        padding: 0,
        height: '100%',
      }}
    >
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Menuru" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
      </head>

      <body
        style={{
          margin: 0,
          padding: 0,
          height: '100%',
          background: '#000',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {children}
      </body>
    </html>
  )
}
