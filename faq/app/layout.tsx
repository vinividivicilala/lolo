import type { Viewport } from 'next'

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
        {/* Google Fonts CDN - Poppins (weight 400 saja) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400&display=swap"
          rel="stylesheet"
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
          fontFamily: "'Poppins', 'Poppins Fallback'",
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {children}
      </body>
    </html>
  )
}
