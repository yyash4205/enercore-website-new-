import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/blog/queries';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog — Solar Insights & Industry Updates',
  description:
    'Insights on industrial solar, OPEX & CAPEX models, open access, and clean-energy policy in India — from the Enercore team.',
};

function formatDate(input: string | null) {
  if (!input) return '';
  return new Date(input).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function BlogIndexPage() {
  const posts = await getAllPosts();
  const featured = posts.find((p) => p.is_featured) ?? posts[0];
  const rest = posts.filter((p) => p.slug !== featured?.slug);

  return (
    <div className="bg-brand-white">
      {/* Hero */}
      <section className="bg-brand-dark px-6 pb-16 pt-32 text-center text-brand-lgrey">
        <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-brand-lime">Enercore Blog</p>
        <h1 className="mx-auto mt-4 max-w-3xl font-heading text-4xl font-bold text-white md:text-5xl">
          Insights on India&apos;s Industrial Solar Transition
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-brand-grey">
          Practical guidance on OPEX &amp; CAPEX solar, open access, policy, and the economics of going clean.
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16">
        {posts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-brand-lgrey py-24 text-center text-brand-grey">
            <p className="text-lg font-medium text-brand-navy">No articles published yet</p>
            <p className="mt-1">Check back soon — our team is preparing the first stories.</p>
          </div>
        )}

        {/* Featured */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group mb-16 grid gap-8 md:grid-cols-2 md:items-center">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-brand-offwhite">
              {featured.featured_image_url && (
                <Image src={featured.featured_image_url} alt={featured.title} fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 text-sm text-brand-grey">
                {featured.category && (
                  <span className="rounded-full bg-brand-lime/20 px-3 py-1 font-medium text-brand-green">
                    {featured.category.name}
                  </span>
                )}
                <span>{formatDate(featured.published_at)}</span>
                {featured.reading_time && <span>· {featured.reading_time} min read</span>}
              </div>
              <h2 className="mt-4 font-heading text-3xl font-bold text-brand-navy transition-colors group-hover:text-brand-green">
                {featured.title}
              </h2>
              {featured.excerpt && <p className="mt-3 text-brand-grey">{featured.excerpt}</p>}
              <span className="mt-5 inline-block font-medium text-brand-green">Read article →</span>
            </div>
          </Link>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-brand-offwhite">
                  {post.featured_image_url && (
                    <Image src={post.featured_image_url} alt={post.title} fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-brand-grey">
                  {post.category && <span className="font-medium text-brand-green">{post.category.name}</span>}
                  <span>{formatDate(post.published_at)}</span>
                  {post.reading_time && <span>· {post.reading_time} min</span>}
                </div>
                <h3 className="mt-2 font-heading text-xl font-semibold text-brand-navy transition-colors group-hover:text-brand-green">
                  {post.title}
                </h3>
                {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-brand-grey">{post.excerpt}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
