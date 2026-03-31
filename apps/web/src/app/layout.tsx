import type { Metadata } from 'next';
import { Navbar, Footer } from '@/components/layout';
import CookieConsent from '@/components/ui/CookieConsent';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Intemso — Student Gig Marketplace',
  description:
    'Find short-term flexible work opportunities designed for university students.',
  icons: {
    icon: '/favicon.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
