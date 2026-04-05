import type { Metadata } from 'next';
import BlogListClient from './BlogListClient';

export const metadata: Metadata = {
  title: 'Blog — Intemso',
  description:
    'Insights, tips, and guides for student freelancers and employers on the Intemso gig marketplace.',
  openGraph: {
    title: 'Intemso Blog — Tips & Insights for Student Freelancers',
    description:
      'Career tips, platform updates, and expert guides for university students and employers.',
    url: 'https://intemso.com/blog',
    siteName: 'Intemso',
    type: 'website',
  },
  alternates: { canonical: 'https://intemso.com/blog' },
};

export default function BlogPage() {
  return <BlogListClient />;
}
