import type { Viewport, Metadata } from 'next'

export const viewport: Viewport = {
  themeColor: '#8be9fd',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://menuru-studio.netlify.app'),

  // ===== TITLE & DESCRIPTION =====
  title: {
    default: 'Menuru Studio | Official Website — Note, Live Chat & Shop',
    template: '%s | Menuru Studio',
  },
  description:
    'Menuru Studio — Platform digital kreatif untuk Note, Live Chat Agent, Shop, Calendar, dan Community. Brand from Love yourself. Akses fitur lengkap dengan Sign In.',

  // ===== KEYWORDS =====
  keywords: [
    'Menuru',
    'Menuru Studio',
    'menuru-studio',
    'Menuru Note',
    'Menuru Shop',
    'Menuru Live Chat',
    'Menuru Calendar',
    'Menuru Community',
    'Live Chat Agent',
    'Note',
    'Sign In Menuru',
    'Login Menuru',
    'Dashboard Menuru',
    'Brand Indonesia',
    'Love yourself',
  ],

  // ===== AUTHORS & CREATOR =====
  authors: [{ name: 'Menuru Studio', url: 'https://menuru-studio.netlify.app' }],
  creator: 'Menuru Studio',
  publisher: 'Menuru Studio',

  // ===== ROBOTS (WAJIB UNTUK GOOGLE) =====
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ===== CANONICAL =====
  alternates: {
    canonical: 'https://menuru-studio.netlify.app',
  },

  // ===== OPEN GRAPH (Facebook, WhatsApp, dll) =====
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://menuru-studio.netlify.app',
    siteName: 'Menuru Studio',
    title: 'Menuru Studio | Official Website — Note, Live Chat & Shop',
    description:
      'Platform digital kreatif untuk Note, Live Chat Agent, Shop, Calendar, dan Community. Brand from Love yourself.',
    images: [
      {
        url: '/images/ai.jpg',
        width: 1200,
        height: 630,
        alt: 'Menuru Studio',
      },
    ],
  },

  // ===== TWITTER CARD =====
  twitter: {
    card: 'summary_large_image',
    title: 'Menuru Studio | Official Website',
    description:
      'Platform digital kreatif untuk Note, Live Chat Agent, Shop, Calendar, dan Community.',
    images: ['/images/ai.jpg'],
    creator: '@menuru',
  },

  // ===== ICONS =====
  icons: {
    icon: '/images/ai.jpg',
    apple: '/images/ai.jpg',
    shortcut: '/images/ai.jpg',
  },

  // ===== APP INFO =====
  applicationName: 'Menuru Studio',
  category: 'technology',

  // ===== VERIFICATION (ISI SETELAH DAFTAR GOOGLE SEARCH CONSOLE) =====
  verification: {
    google: 'MASUKKAN_KODE_VERIFIKASI_GOOGLE_DISINI',
    // yandex: 'xxx',
    // bing: 'xxx',
  },

  // ===== OTHER META =====
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Menuru',
    'mobile-web-app-capable': 'yes',
    'format-detection': 'telephone=no',
    'msapplication-TileColor': '#8be9fd',
    'msapplication-config': '/browserconfig.xml',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="id"
      style={{
        margin: 0,
        padding: 0,
        height: '100%',
      }}
    >
      <head>
        {/* ===== Google Fonts CDN - Poppins ===== */}
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* ===== Preconnect untuk performa ===== */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://menuru-studio.netlify.app" />

        {/* ===== Meta tambahan ===== */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Menuru" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />

        {/* ===== Favicon ===== */}
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
        <link rel="shortcut icon" href="/images/ai.jpg" />

        {/* ===== JSON-LD: WebSite (untuk Sitelinks Search Box) ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Menuru Studio',
              alternateName: ['Menuru', 'Menuru Note', 'menuru-studio', 'Menuru Shop'],
              url: 'https://menuru-studio.netlify.app',
              inLanguage: 'id-ID',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate:
                    'https://menuru-studio.netlify.app/search?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        {/* ===== JSON-LD: Organization (untuk brand knowledge panel) ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Menuru Studio',
              alternateName: 'Menuru',
              url: 'https://menuru-studio.netlify.app',
              logo: {
                '@type': 'ImageObject',
                url: 'https://menuru-studio.netlify.app/images/ai.jpg',
                width: 512,
                height: 512,
              },
              image: 'https://menuru-studio.netlify.app/images/ai.jpg',
              description:
                'Menuru Studio — Platform digital kreatif untuk Note, Live Chat Agent, Shop, Calendar, dan Community.',
              sameAs: [
                'https://instagram.com/menuru',
                'https://menuru-studio.netlify.app',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                url: 'https://menuru-studio.netlify.app/contact',
                availableLanguage: ['Indonesian', 'English'],
              },
            }),
          }}
        />

        {/* ===== JSON-LD: BreadcrumbList (untuk Sitelinks navigasi) ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://menuru-studio.netlify.app',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Sign In',
                  item: 'https://menuru-studio.netlify.app/signin',
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: 'Dashboard',
                  item: 'https://menuru-studio.netlify.app/dashboard',
                },
                {
                  '@type': 'ListItem',
                  position: 4,
                  name: 'Note',
                  item: 'https://menuru-studio.netlify.app/note',
                },
                {
                  '@type': 'ListItem',
                  position: 5,
                  name: 'Live Chat',
                  item: 'https://menuru-studio.netlify.app/live-chat',
                },
                {
                  '@type': 'ListItem',
                  position: 6,
                  name: 'Shop',
                  item: 'https://menuru-studio.netlify.app/shop',
                },
                {
                  '@type': 'ListItem',
                  position: 7,
                  name: 'Contact',
                  item: 'https://menuru-studio.netlify.app/contact',
                },
              ],
            }),
          }}
        />

        {/* ===== JSON-LD: SiteNavigationElement (PALING PENTING untuk Sitelinks) ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: 'Main Navigation',
              itemListElement: [
                {
                  '@type': 'SiteNavigationElement',
                  position: 1,
                  name: 'Sign In',
                  description: 'Masuk ke akun Menuru Studio',
                  url: 'https://menuru-studio.netlify.app/signin',
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 2,
                  name: 'Sign Up',
                  description: 'Daftar akun Menuru Studio',
                  url: 'https://menuru-studio.netlify.app/signup',
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 3,
                  name: 'Dashboard',
                  description: 'Dashboard pengguna Menuru Studio',
                  url: 'https://menuru-studio.netlify.app/dashboard',
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 4,
                  name: 'Note',
                  description: 'Fitur Note Menuru Studio',
                  url: 'https://menuru-studio.netlify.app/note',
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 5,
                  name: 'Live Chat',
                  description: 'Live Chat Agent Menuru Studio',
                  url: 'https://menuru-studio.netlify.app/live-chat',
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 6,
                  name: 'Shop',
                  description: 'Shop produk Menuru Studio',
                  url: 'https://menuru-studio.netlify.app/shop',
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 7,
                  name: 'Calendar',
                  description: 'Calendar Menuru Studio',
                  url: 'https://menuru-studio.netlify.app/calendar',
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 8,
                  name: 'Community',
                  description: 'Community Menuru Studio',
                  url: 'https://menuru-studio.netlify.app/community',
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 9,
                  name: 'About Us',
                  description: 'Tentang Menuru Studio',
                  url: 'https://menuru-studio.netlify.app/profile',
                },
                {
                  '@type': 'SiteNavigationElement',
                  position: 10,
                  name: 'Contact',
                  description: 'Hubungi Menuru Studio',
                  url: 'https://menuru-studio.netlify.app/contact',
                },
              ],
            }),
          }}
        />

        {/* ===== JSON-LD: WebPage (halaman utama) ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: 'Menuru Studio | Official Website',
              url: 'https://menuru-studio.netlify.app',
              description:
                'Menuru Studio — Platform digital kreatif untuk Note, Live Chat Agent, Shop, Calendar, dan Community.',
              inLanguage: 'id-ID',
              isPartOf: {
                '@type': 'WebSite',
                name: 'Menuru Studio',
                url: 'https://menuru-studio.netlify.app',
              },
              primaryImageOfPage: {
                '@type': 'ImageObject',
                url: 'https://menuru-studio.netlify.app/images/ai.jpg',
              },
              datePublished: '2024-01-01',
              dateModified: new Date().toISOString().split('T')[0],
            }),
          }}
        />

        {/* ===== JSON-LD: FAQ (bonus untuk rich results) ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'Apa itu Menuru Studio?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Menuru Studio adalah platform digital kreatif yang menyediakan fitur Note, Live Chat Agent, Shop, Calendar, dan Community. Brand from Love yourself.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Bagaimana cara Sign In ke Menuru Studio?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Klik tombol Sign In di halaman utama, lalu masukkan email dan password akun kamu. Jika belum punya akun, klik Sign Up untuk mendaftar.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Fitur apa saja yang tersedia di Menuru Studio?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Menuru Studio menyediakan fitur Note, Live Chat Agent, Shop, Calendar, Blog, Donation, Community, dan Stories.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Apakah Menuru Studio gratis?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Ya, Menuru Studio dapat diakses secara gratis. Beberapa fitur premium mungkin tersedia di masa mendatang.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Bagaimana cara menghubungi Menuru Studio?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Kamu bisa menghubungi kami melalui halaman Contact, Live Chat, atau Instagram @menuru.',
                  },
                },
              ],
            }),
          }}
        />
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
