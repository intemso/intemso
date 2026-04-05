import type { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function fetchPost(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/blog/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) {
    return { title: 'Post Not Found — Intemso Blog' };
  }

  const title = post.metaTitle || post.title;
  const description =
    post.metaDescription || post.excerpt || `Read "${post.title}" on the Intemso blog.`;
  const canonical = post.canonicalUrl || `https://intemso.com/blog/${post.slug}`;
  const ogImage = post.ogImage || post.featuredImage;

  return {
    title: `${title} — Intemso Blog`,
    description,
    keywords: post.focusKeyword
      ? [post.focusKeyword, ...post.tags]
      : post.tags,
    robots: post.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Intemso',
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.author
        ? [`${post.author.firstName} ${post.author.lastName}`]
        : undefined,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    alternates: { canonical },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}
