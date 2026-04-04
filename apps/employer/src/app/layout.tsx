import type { Metadata } from 'next';
import Providers from './providers';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Intemso Employer Portal',
  description: 'Post gigs, manage contracts, and find talented students.',
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
