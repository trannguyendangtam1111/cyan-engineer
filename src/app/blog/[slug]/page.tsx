import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { site } from "@/lib/site"
import { getPublishedPost, getPublishedSlugs } from "@/lib/blog"
import { Breadcrumb } from "@/components/project/breadcrumb"
import { StackTags } from "@/components/project/stack-tags"
import { PostDate } from "@/components/blog/post-date"
import { alt, contentType, size } from "@/app/opengraph-image"

/* Only published posts are generated; drafts and unknown slugs are a 404. */
export const dynamicParams = false

export function generateStaticParams() {
  return getPublishedSlugs().map((slug) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

const socialImage = { url: "/opengraph-image", ...size, alt, type: contentType }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getPublishedPost((await params).slug)
  if (!post) return {}

  const url = `/blog/${post.slug}`
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${post.title} · ${site.name}`,
      description: post.description,
      url,
      siteName: site.domain,
      type: "article",
      locale: "en_US",
      publishedTime: post.date,
      authors: [site.name],
      tags: post.tags,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} · ${site.name}`,
      description: post.description,
      images: [{ ...socialImage, url: "/twitter-image" }],
    },
  }
}

/* Reading column: 600px at 17px keeps body lines around 65–75 characters. */
const column = "mx-auto w-full max-w-[600px]"

export default async function BlogPostPage({ params }: PageProps) {
  const post = getPublishedPost((await params).slug)
  if (!post) notFound()

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12"
    >
      <article aria-labelledby="post-title" className={column}>
        {/* Top-bar → article header */}
        <header className="mt-6 border-b border-line pb-7 sm:mt-10 sm:pb-8 lg:mt-12">
          <Breadcrumb
            trail={[
              { href: "/", label: "Home" },
              { href: "/blog", label: "Blog" },
            ]}
            current={post.title}
          />
          <h1
            id="post-title"
            className="mt-6 text-fg-strong font-bold leading-[1.1] tracking-[-0.035em] text-balance"
            style={{ fontSize: "clamp(30px, 4.2vw, 42px)" }}
          >
            {post.title}
          </h1>
          <p className="mt-4 text-[17px] leading-[1.6] text-fg-muted text-pretty sm:text-[18px]">
            {post.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
            <PostDate date={post.date} />
            {post.tags.length > 0 && (
              <>
                <span aria-hidden="true" className="h-4 w-px bg-line" />
                <StackTags items={post.tags} label="Tags" />
              </>
            )}
          </div>
        </header>

        {/* Markdown rendered at build time with raw HTML disabled (src/lib/blog.ts) */}
        <div className="blog-prose mt-8 sm:mt-10" dangerouslySetInnerHTML={{ __html: post.html }} />

        <footer className="mt-12 border-t border-line pt-6 sm:mt-16">
          <Link
            href="/blog"
            className="
              inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] px-5
              border border-line bg-surface text-[15px] font-semibold leading-none tracking-[-0.01em]
              text-fg-strong transition-colors duration-100
              hover:border-line-hover hover:text-accent-ink
              focus-visible:outline-none focus-visible:ring-focus
            "
          >
            <ArrowLeft aria-hidden="true" size={16} strokeWidth={2} />
            Back to blog
          </Link>
        </footer>
      </article>

      {/* Content → Footer (rendered by the root layout) */}
      <div className="mt-16 sm:mt-20" />
    </main>
  )
}
