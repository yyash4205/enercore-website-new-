import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPostBySlug, getAllPosts, getRelatedPosts } from '@/lib/blog/queries';
import { ReadingProgress, TableOfContents, ShareButtons } from '@/components/blog/blog-reading';

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Article not found' };
  const seo = (post.seo ?? {}) as Record<string, string>;
  return {
    title: seo.title || post.title,
    description: seo.description || post.excerpt || undefined,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    openGraph: {
      title: seo.title || post.title,
      description: seo.description || post.excerpt || undefined,
      images: post.featured_image_url ? [post.featured_image_url] : undefined,
      type: 'article',
    },
  };
}

function formatDate(input: string | null) {
  if (!input) return '';
  return new Date(input).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  const related = await getRelatedPosts(slug, post.category?.slug, 3);

  return (
    <div className="bg-brand-white">
      <ReadingProgress />

      {/* Hero */}
      <header className="relative bg-brand-dark px-6 pb-14 pt-32 text-center text-brand-lgrey">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-center gap-3 text-sm">
            {post.category && (
              <span className="rounded-full bg-brand-lime/20 px-3 py-1 font-medium text-brand-lime">
                {post.category.name}
              </span>
            )}
            <span>{formatDate(post.published_at)}</span>
            {post.reading_time && <span>· {post.reading_time} min read</span>}
          </div>
          <h1 className="mt-5 font-heading text-4xl font-bold leading-tight text-white md:text-5xl">{post.title}</h1>
          {post.excerpt && <p className="mx-auto mt-4 max-w-2xl text-brand-grey">{post.excerpt}</p>}
          {post.author && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-green text-sm font-semibold text-white">
                {post.author.avatar_url ? (
                  <Image src={post.author.avatar_url} alt="" width={40} height={40} className="h-full w-full object-cover" />
                ) : (
                  (post.author.full_name ?? 'E').charAt(0)
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">{post.author.full_name ?? 'Enercore Team'}</p>
                <p className="text-xs text-brand-grey">Enercore New Energy</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {post.featured_image_url && (
        <div className="mx-auto -mt-8 max-w-4xl px-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-xl">
            <Image src={post.featured_image_url} alt={post.title} fill priority className="object-cover" />
          </div>
        </div>
      )}

      {/* Body + sidebar */}
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1fr_240px]">
        <article>
          <div
            id="article-body"
            className="blog-content max-w-2xl"
            dangerouslySetInnerHTML={{ __html: post.content_html ?? '' }}
          />

          <div className="mt-12 max-w-2xl border-t border-brand-lgrey pt-8">
            <ShareButtons title={post.title} />
          </div>

          {post.author?.bio && (
            <div className="mt-10 max-w-2xl rounded-2xl bg-brand-offwhite p-6">
              <p className="font-heading font-semibold text-brand-navy">{post.author.full_name ?? 'Enercore Team'}</p>
              <p className="mt-1 text-sm text-brand-grey">{post.author.bio}</p>
            </div>
          )}
        </article>

        {/* Sticky sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <TableOfContents />
          </div>
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-brand-lgrey bg-brand-offwhite px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 font-heading text-2xl font-bold text-brand-navy">Related articles</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="group flex flex-col">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-brand-white">
                    {r.featured_image_url && (
                      <Image src={r.featured_image_url} alt={r.title} fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  <h3 className="mt-3 font-heading text-lg font-semibold text-brand-navy group-hover:text-brand-green">
                    {r.title}
                  </h3>
                  <span className="mt-1 text-xs text-brand-grey">{formatDate(r.published_at)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-6xl px-6 pb-16">
        <Link href="/blog" className="text-sm font-medium text-brand-green hover:underline">← Back to all articles</Link>
      </div>
    </div>
  );
}
