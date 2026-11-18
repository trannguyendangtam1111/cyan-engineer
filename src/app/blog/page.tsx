import type { Metadata } from "next"
import Link from "next/link"
import { Github, NotebookPen } from "lucide-react"
import { site } from "@/lib/site"
import { getPublishedPosts } from "@/lib/blog"
import { blogJsonLd, serializeJsonLd } from "@/lib/structured-data"
import { Breadcrumb } from "@/components/project/breadcrumb"
import { FeaturedPostEntry, PostEntry } from "@/components/blog/post-entry"
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

const button =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] px-5 " +
  "border border-line bg-surface text-[15px] font-semibold leading-none tracking-[-0.01em] " +
  "text-fg-strong transition-colors duration-100 hover:border-line-hover hover:text-accent-ink " +
  "focus-visible:outline-none focus-visible:ring-focus"

/* Small uppercase section label above the article lists */
const sectionLabel = "text-[12px] font-semibold uppercase leading-none tracking-[0.12em] text-fg-subtle"

export default function BlogPage() {
  const posts = getPublishedPosts()
  const [featured, ...more] = posts
  const { github } = site.links

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogJsonLd(posts, description)) }}
      />
      {/* Top-bar → page header */}
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
        /* Empty state: no published posts yet */
        <section
          aria-labelledby="empty-heading"
          className="
            mt-10 flex max-w-[720px] flex-col items-start rounded-[20px] border border-dashed
            border-line-strong bg-surface-sunken p-6 sm:mt-12 sm:rounded-[24px] sm:p-8
          "
        >
          <span
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-mint text-mint-ink"
          >
            <NotebookPen size={20} strokeWidth={2} />
          </span>
          <h2
            id="empty-heading"
            className="mt-5 text-fg-strong text-[20px] font-bold leading-[1.25] tracking-[-0.02em] sm:text-[22px]"
          >
            No articles yet
          </h2>
          <p className="mt-2 max-w-[520px] text-[15px] leading-[1.6] text-fg-muted text-pretty">
            Articles will appear here once they are published. In the meantime, the projects
            and their source code show how I work.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link href="/projects" className={button}>
              View projects
              <span aria-hidden="true">→</span>
            </Link>
            {github !== null && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  -m-1 inline-flex items-center gap-1.5 rounded-[8px] p-1 text-[14px] font-semibold
                  text-fg-muted underline-offset-4 transition-colors duration-100
                  hover:text-accent-ink hover:underline
                  focus-visible:outline-none focus-visible:ring-focus
                "
              >
                <Github aria-hidden="true" size={15} strokeWidth={2} />
                GitHub
                <span aria-hidden="true">↗</span>
                <span className="sr-only"> profile (opens in new tab)</span>
              </a>
            )}
          </div>
        </section>
      ) : (
        <div className="mt-10 max-w-[880px] sm:mt-12">
          {/* Newest article first, set larger */}
          <section aria-labelledby="latest-heading" className="border-t border-line-strong pt-6 sm:pt-8">
            <h2 id="latest-heading" className={sectionLabel}>
              Latest article
            </h2>
            <div className="mt-4">
              <FeaturedPostEntry post={featured} />
            </div>
          </section>

          {more.length > 0 && (
            <section aria-labelledby="more-heading" className="mt-12 border-t border-line-strong pt-6 sm:mt-16 sm:pt-8">
              <h2 id="more-heading" className={sectionLabel}>
                More articles
              </h2>
              <ol role="list" className="mt-2 divide-y divide-line">
                {more.map((post) => (
                  <li key={post.slug}>
                    <PostEntry post={post} />
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      )}

      {/* Content → Footer (rendered by the root layout) */}
      <div className="mt-16 sm:mt-20" />
    </main>
  )
}
