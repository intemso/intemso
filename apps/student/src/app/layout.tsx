import type { Metadata } from 'next';
import Providers from './providers';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Intemso Student Portal',
  description: 'Student dashboard — manage your gigs, applications, earnings and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
