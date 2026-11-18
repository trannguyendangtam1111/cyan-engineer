import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { site } from "@/lib/site"
import { getPublishedPost, getPublishedSlugs } from "@/lib/blog"
import { Breadcrumb } from "@/components/project/breadcrumb"
import { StackTags } from "@/components/project/stack-tags"
import { PostByline } from "@/components/blog/post-byline"
import { TableOfContents, TableOfContentsCompact } from "@/components/blog/table-of-contents"
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

/*
 * Reading column ~600–620px (body lines around 65–75 characters at 17px).
 * From lg up, a sticky table of contents sits beside it; below lg the
 * contents are a collapsed disclosure above the body.
 */
export default async function BlogPostPage({ params }: PageProps) {
  const post = getPublishedPost((await params).slug)
  if (!post) notFound()
  const hasToc = post.headings.length > 1

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12"
    >
      <div
        className={
          hasToc
            ? "mx-auto w-full max-w-[640px] lg:grid lg:max-w-[904px] lg:grid-cols-[minmax(0,1fr)_224px] lg:gap-x-16"
            : "mx-auto w-full max-w-[640px]"
        }
      >
        <article aria-labelledby="post-title" className="min-w-0">
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
            <PostByline date={post.date} readingMinutes={post.readingMinutes} className="mt-6 text-[14px]" />
            {post.tags.length > 0 && <StackTags items={post.tags} label="Tags" className="mt-4" />}
          </header>

          {hasToc && (
            <div className="mt-6 lg:hidden">
              <TableOfContentsCompact headings={post.headings} />
            </div>
          )}

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

        {hasToc && (
          <aside className="hidden lg:mt-12 lg:block">
            <TableOfContents headings={post.headings} />
          </aside>
        )}
      </div>

      {/* Content → Footer (rendered by the root layout) */}
      <div className="mt-16 sm:mt-20" />
    </main>
  )
}
