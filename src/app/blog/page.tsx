import type { Metadata } from "next"
import Link from "next/link"
import { NotebookPen } from "lucide-react"
import { site } from "@/lib/site"
import { formatPostDate, getPublishedPosts } from "@/lib/blog"
import { Breadcrumb } from "@/components/project/breadcrumb"
import { StackTags } from "@/components/project/stack-tags"
import { alt, contentType, size } from "@/app/opengraph-image"

// The site-wide social image (app/opengraph-image.tsx). A page that sets its
// own openGraph/twitter fields must list it, or the image is dropped.
const socialImage = { url: "/opengraph-image", ...size, alt, type: contentType }

const title = "Blog"
const description = `Notes on backend development by ${site.name}.`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `${title} · ${site.name}`,
    description,
    url: "/blog",
    siteName: site.domain,
    type: "website",
    locale: "en_US",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${site.name}`,
    description,
    images: [{ ...socialImage, url: "/twitter-image" }],
  },
}

export default function BlogPage() {
  const posts = getPublishedPosts()

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12"
    >
      <header className="mt-6 sm:mt-10 lg:mt-12">
        <Breadcrumb trail={[{ href: "/", label: "Home" }]} current="Blog" />
        <h1
          className="mt-5 text-fg-strong font-bold leading-[1.05] tracking-[-0.035em]"
          style={{ fontSize: "clamp(34px, 4.5vw, 48px)" }}
        >
          Blog
        </h1>
        <p className="mt-3 max-w-[640px] text-[15px] leading-[1.6] text-fg-muted text-pretty sm:text-[16px]">
          Notes on backend development with Java, Spring Boot, and PostgreSQL.
        </p>
      </header>

      {posts.length === 0 ? (
        <section
          aria-labelledby="empty-heading"
          className="mt-10 max-w-[640px] rounded-[20px] border border-line bg-surface p-6 shadow-card-sm sm:mt-12 sm:p-8"
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-mint text-mint-ink"
          >
            <NotebookPen size={18} strokeWidth={2} />
          </span>
          <h2
            id="empty-heading"
            className="mt-4 text-fg-strong text-[20px] font-bold leading-[1.25] tracking-[-0.02em]"
          >
            No posts yet
          </h2>
          <p className="mt-2 text-[15px] leading-[1.6] text-fg-muted text-pretty">
            The first posts are being written. In the meantime, the projects show the code.
          </p>
          <Link
            href="/projects"
            className="
              mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px]
              border border-line bg-surface px-5 text-[15px] font-semibold leading-none
              tracking-[-0.01em] text-fg-strong transition-colors duration-100
              hover:border-line-hover hover:text-accent-ink
              focus-visible:outline-none focus-visible:ring-focus
            "
          >
            View projects
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      ) : (
        <section aria-label="Posts" className="mt-10 sm:mt-12">
          <ul role="list" className="flex max-w-[760px] flex-col gap-4 sm:gap-5">
            {posts.map((post) => (
              <li key={post.slug}>
                <article
                  aria-labelledby={`post-${post.slug}`}
                  className="
                    group relative rounded-[20px] border border-line bg-surface p-5 shadow-card-sm
                    transition-[border-color,box-shadow] duration-150
                    hover:border-line-hover hover:shadow-card
                    has-[a:focus-visible]:ring-focus sm:p-6
                  "
                >
                  <time dateTime={post.date} className="text-[13px] font-medium text-fg-muted">
                    {formatPostDate(post.date)}
                  </time>
                  <h2
                    id={`post-${post.slug}`}
                    className="mt-2 text-fg-strong text-[20px] font-bold leading-[1.25] tracking-[-0.02em]"
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      className="
                        underline-offset-4 group-hover:text-accent-ink
                        after:absolute after:inset-0 after:content-['']
                        focus-visible:outline-none
                      "
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-[15px] leading-[1.6] text-fg-muted text-pretty">
                    {post.description}
                  </p>
                  {post.tags.length > 0 && (
                    <StackTags items={post.tags} label="Tags" className="mt-4" />
                  )}
                </article>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Content → Footer (rendered by the root layout) */}
      <div className="mt-16 sm:mt-20" />
    </main>
  )
}
