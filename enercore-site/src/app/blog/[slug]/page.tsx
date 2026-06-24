import { getPostBySlug, getAllPosts } from '@/sanity/queries'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BlogPostActions from '@/components/blog/blog-post-actions'

export const revalidate = 60

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post: any) => ({ slug: post.slug }))
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) return notFound()

  return (
    <main className="max-w-2xl mx-auto px-6 py-24">

      <Link href="/blog" className="text-sm text-gray-400 hover:text-gray-900 mb-8 inline-block transition-colors">
        ← Back to Blog
      </Link>

      <p className="text-sm text-gray-400 mt-4 mb-3">
        {new Date(post.publishedAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-10">
        {post.title}
      </h1>

      <div className="blog-content">
        {post.body && <PortableText value={post.body} />}
      </div>

      <BlogPostActions title={post.title} />

    </main>
  )
}