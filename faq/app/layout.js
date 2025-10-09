import { Inter, Poppins, ClashDisplay } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Modern Homepage - Next.js & React',
  description: 'Modern homepage built with Next.js, React, and advanced animations',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${clashDisplay.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );

}


