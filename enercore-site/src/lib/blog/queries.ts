import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

/**
 * File-based blog. Each post is a Markdown file in `content/blog/*.md` with
 * frontmatter. No database or server — add a post by dropping in a new .md file.
 * See README for the frontmatter format.
 */

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogListItem {
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  reading_time: number | null;
  published_at: string | null;
  is_featured: boolean;
  category: { name: string; slug: string } | null;
}

export interface BlogPost extends BlogListItem {
  content_html: string | null;
  banner_image_url: string | null;
  seo: Record<string, unknown> | null;
  author: { full_name: string | null; avatar_url: string | null; bio: string | null } | null;
}

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function listFiles(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
}

function parseFile(file: string): BlogPost | null {
  try {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const { data, content } = matter(raw);

    // Drafts are hidden; posts with a future date are hidden until then.
    if (data.draft === true) return null;
    const published = data.date ? new Date(data.date) : null;
    if (published && published.getTime() > Date.now()) return null;

    const slug = (data.slug as string) || file.replace(/\.mdx?$/, '');
    const categoryName = (data.category as string) || null;

    return {
      title: data.title ?? slug,
      slug,
      excerpt: data.excerpt ?? null,
      featured_image_url: data.coverImage ?? data.featured_image ?? null,
      banner_image_url: data.bannerImage ?? null,
      reading_time: readingTime(content),
      published_at: published ? published.toISOString() : null,
      is_featured: data.featured === true,
      category: categoryName ? { name: categoryName, slug: slugify(categoryName) } : null,
      content_html: marked.parse(content, { async: false }) as string,
      seo: {
        title: data.seoTitle ?? null,
        description: data.seoDescription ?? data.excerpt ?? null,
        canonical: data.canonical ?? null,
      },
      author: data.author
        ? { full_name: data.author, avatar_url: data.authorAvatar ?? null, bio: data.authorBio ?? null }
        : null,
    };
  } catch {
    return null;
  }
}

function stripBody(post: BlogPost): BlogListItem {
  const { content_html, banner_image_url, seo, author, ...rest } = post;
  void content_html; void banner_image_url; void seo; void author;
  return rest;
}

/** All visible posts, newest first. */
export async function getAllPosts(): Promise<BlogListItem[]> {
  return listFiles()
    .map(parseFile)
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''))
    .map(stripBody);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  for (const file of listFiles()) {
    const post = parseFile(file);
    if (post && post.slug === slug) return post;
  }
  return null;
}

/** Up to `limit` other posts, preferring the same category. */
export async function getRelatedPosts(slug: string, categorySlug?: string, limit = 3): Promise<BlogListItem[]> {
  const all = (await getAllPosts()).filter((p) => p.slug !== slug);
  const sameCat = categorySlug ? all.filter((p) => p.category?.slug === categorySlug) : [];
  const merged = [...sameCat, ...all.filter((p) => !sameCat.includes(p))];
  return merged.slice(0, limit);
}
