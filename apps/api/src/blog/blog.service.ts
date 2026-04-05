import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(private prisma: PrismaService) {}

  /** Calculate reading time from HTML/text content */
  private calcReadingTime(content: string): number {
    const text = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const words = text.split(' ').filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 225));
  }

  /** Auto-generate JSON-LD structured data */
  private buildStructuredData(post: {
    title: string;
    excerpt?: string | null;
    content: string;
    featuredImage?: string | null;
    publishedAt?: Date | null;
    updatedAt: Date;
    slug: string;
    author: { email?: string | null };
  }): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt || post.content.replace(/<[^>]+>/g, '').slice(0, 160),
      image: post.featuredImage || undefined,
      datePublished: post.publishedAt?.toISOString(),
      dateModified: post.updatedAt.toISOString(),
      author: {
        '@type': 'Organization',
        name: 'Intemso',
        url: 'https://intemso.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Intemso',
        logo: {
          '@type': 'ImageObject',
          url: 'https://intemso.com/logo.svg',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://intemso.com/blog/${post.slug}`,
      },
    };
  }

  // ── Admin CRUD ──

  async create(authorId: string, dto: CreateBlogPostDto) {
    // check slug uniqueness
    const existing = await this.prisma.blogPost.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('A blog post with this slug already exists');

    const readingTimeMin = this.calcReadingTime(dto.content);
    const publishedAt = dto.status === 'published' ? new Date() : null;

    const post = await this.prisma.blogPost.create({
      data: {
        authorId,
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        content: dto.content,
        featuredImage: dto.featuredImage,
        featuredImageAlt: dto.featuredImageAlt,
        category: dto.category,
        tags: dto.tags || [],
        status: (dto.status as any) || 'draft',
        readingTimeMin,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        canonicalUrl: dto.canonicalUrl,
        ogImage: dto.ogImage,
        noIndex: dto.noIndex,
        focusKeyword: dto.focusKeyword,
        publishedAt,
      },
      include: { author: { select: { id: true, email: true, avatarUrl: true } } },
    });

    // Auto-generate structured data
    await this.prisma.blogPost.update({
      where: { id: post.id },
      data: { structuredData: this.buildStructuredData(post) },
    });

    this.logger.log(`Blog post created: "${post.title}" [${post.status}]`);
    return { ...post, structuredData: this.buildStructuredData(post) };
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found');

    // If slug is changing, check uniqueness
    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.prisma.blogPost.findUnique({ where: { slug: dto.slug } });
      if (slugExists) throw new BadRequestException('A blog post with this slug already exists');
    }

    const data: any = { ...dto };

    // Recalculate reading time if content changed
    if (dto.content) {
      data.readingTimeMin = this.calcReadingTime(dto.content);
    }

    // Set publishedAt when first published
    if (dto.status === 'published' && existing.status !== 'published') {
      data.publishedAt = existing.publishedAt || new Date();
    }

    const post = await this.prisma.blogPost.update({
      where: { id },
      data,
      include: { author: { select: { id: true, email: true, avatarUrl: true } } },
    });

    // Rebuild structured data
    const structuredData = this.buildStructuredData(post);
    await this.prisma.blogPost.update({
      where: { id },
      data: { structuredData },
    });

    this.logger.log(`Blog post updated: "${post.title}" [${post.status}]`);
    return { ...post, structuredData };
  }

  async remove(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');
    await this.prisma.blogPost.delete({ where: { id } });
    this.logger.log(`Blog post deleted: "${post.title}"`);
    return { message: 'Blog post deleted' };
  }

  async findAllAdmin(params: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, category, search, page = 1, limit = 20 } = params;
    const where: any = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search.toLowerCase()] } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { author: { select: { id: true, email: true, avatarUrl: true } } },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneAdmin(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      include: { author: { select: { id: true, email: true, avatarUrl: true } } },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  // ── Public Endpoints ──

  async findPublished(params: {
    category?: string;
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { category, tag, search, page = 1, limit = 12 } = params;
    const where: any = {
      status: 'published',
      publishedAt: { not: null },
    };

    if (category) where.category = category;
    if (tag) where.tags = { has: tag };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search.toLowerCase()] } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          featuredImageAlt: true,
          category: true,
          tags: true,
          readingTimeMin: true,
          viewCount: true,
          publishedAt: true,
          metaTitle: true,
          metaDescription: true,
          author: { select: { id: true, avatarUrl: true } },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: { author: { select: { id: true, avatarUrl: true } } },
    });

    if (!post || post.status !== 'published') {
      throw new NotFoundException('Blog post not found');
    }

    // Increment view count
    await this.prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return post;
  }

  async getCategories() {
    const posts = await this.prisma.blogPost.findMany({
      where: { status: 'published', category: { not: null } },
      select: { category: true },
    });
    const counts: Record<string, number> = {};
    for (const p of posts) {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getTags() {
    const posts = await this.prisma.blogPost.findMany({
      where: { status: 'published' },
      select: { tags: true },
    });
    const counts: Record<string, number> = {};
    for (const p of posts) {
      for (const t of p.tags) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);
  }

  async getRelated(slug: string, limit = 3) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return [];

    // Find posts with same category or overlapping tags
    const related = await this.prisma.blogPost.findMany({
      where: {
        status: 'published',
        id: { not: post.id },
        OR: [
          ...(post.category ? [{ category: post.category }] : []),
          ...(post.tags.length > 0 ? [{ tags: { hasSome: post.tags } }] : []),
        ],
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        featuredImageAlt: true,
        category: true,
        readingTimeMin: true,
        publishedAt: true,
      },
    });

    return related;
  }

  /** Generate sitemap entries for all published posts */
  async getSitemapEntries() {
    return this.prisma.blogPost.findMany({
      where: { status: 'published', noIndex: false },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
    });
  }
}
