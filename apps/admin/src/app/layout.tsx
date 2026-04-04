import type { Metadata } from 'next';
import Providers from './providers';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Intemso Admin Panel',
  description: 'Platform administration — users, disputes, analytics, and system management.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
