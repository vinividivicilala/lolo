import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Menuru Brand',
  description: 'Menuru Brand from Love yourself',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0, height: '100%' }}>
      <body style={{ margin: 0, padding: 0, height: '100%', backgroundColor: 'black' }}>
        {children}
      </body>
    </html>
  )
}

