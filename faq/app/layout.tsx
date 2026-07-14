import type { Metadata, Viewport } from 'next'

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
      style={{
        margin: 0,
        padding: 0,
        height: '100%',
      }}
    >
      <head>
        {/* Neue Montreal Font - Single Font */}
        <link
          rel="preload"
          href="/fonts/NeueMontreal-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: 'Neue Montreal';
                src: url('/fonts/NeueMontreal-Regular.woff2') format('woff2'),
                     url('/fonts/NeueMontreal-Regular.woff') format('woff');
                font-weight: 400;
                font-style: normal;
                font-display: swap;
              }
              @font-face {
                font-family: 'Neue Montreal';
                src: url('/fonts/NeueMontreal-Medium.woff2') format('woff2'),
                     url('/fonts/NeueMontreal-Medium.woff') format('woff');
                font-weight: 500;
                font-style: normal;
                font-display: swap;
              }
              @font-face {
                font-family: 'Neue Montreal';
                src: url('/fonts/NeueMontreal-Bold.woff2') format('woff2'),
                     url('/fonts/NeueMontreal-Bold.woff') format('woff');
                font-weight: 700;
                font-style: normal;
                font-display: swap;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              html, body {
                height: 100%;
                margin: 0;
                padding: 0;
                font-family: 'Neue Montreal', sans-serif;
              }
            `,
          }}
        />

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
          fontFamily: "'Neue Montreal', sans-serif",
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {children}
      </body>
    </html>
  )
}
