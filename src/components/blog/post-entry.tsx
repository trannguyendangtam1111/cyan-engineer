import Link from "next/link"
import { cn } from "@/lib/utils"
import type { PostMeta } from "@/lib/blog"
import { StackTags } from "@/components/project/stack-tags"
import { PostByline } from "@/components/blog/post-byline"

/*
 * Blog listing entries, typography-first: no filled cards, hairline rules
 * between entries. Each entry is one tab stop: the title link covers the
 * whole entry with an ::after overlay and its focus ring is drawn on the
 * entry (same stretched-link pattern as the project cards).
 */

const entryFocus = "has-[[data-entry-link]:focus-visible]:ring-focus rounded-[14px]"

const stretchedLink = `
  rounded-[6px] underline-offset-[5px] decoration-1 transition-colors duration-100
  group-hover:text-accent-ink group-hover:underline
  after:absolute after:inset-0 after:rounded-[14px] after:content-['']
  focus-visible:shadow-none focus-visible:outline-none
`

/** The newest article: larger title and the summary at reading size. */
export function FeaturedPostEntry({ post }: { post: PostMeta }) {
  const titleId = `post-${post.slug}-title`
  return (
    <article aria-labelledby={titleId} className={cn("group relative -mx-3 px-3 py-2 sm:-mx-4 sm:px-4", entryFocus)}>
      <PostByline date={post.date} readingMinutes={post.readingMinutes} />
      <h3
        id={titleId}
        className="mt-3 max-w-[760px] text-fg-strong font-bold leading-[1.15] tracking-[-0.03em] text-balance"
        style={{ fontSize: "clamp(26px, 3.4vw, 36px)" }}
      >
        <Link href={`/blog/${post.slug}`} data-entry-link className={stretchedLink}>
          {post.title}
        </Link>
      </h3>
      <p className="mt-4 max-w-[680px] text-[16px] leading-[1.65] text-fg-muted text-pretty sm:text-[17px]">
        {post.description}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        {post.tags.length > 0 && <StackTags items={post.tags} label="Tags" />}
        <span aria-hidden="true" className="text-[14px] font-semibold text-accent-ink">
          Read article →
        </span>
      </div>
    </article>
  )
}

/** A regular article: title, summary, then byline and tags. */
export function PostEntry({ post }: { post: PostMeta }) {
  const titleId = `post-${post.slug}-title`
  return (
    <article
      aria-labelledby={titleId}
      className={cn("group relative -mx-3 px-3 py-6 sm:-mx-4 sm:px-4 sm:py-7", entryFocus)}
    >
      <h3
        id={titleId}
        className="max-w-[720px] text-fg-strong text-[19px] font-bold leading-[1.3] tracking-[-0.02em] text-balance sm:text-[21px]"
      >
        <Link href={`/blog/${post.slug}`} data-entry-link className={stretchedLink}>
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 max-w-[680px] text-[15px] leading-[1.65] text-fg-muted text-pretty sm:text-[16px]">
        {post.description}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <PostByline date={post.date} readingMinutes={post.readingMinutes} />
        {post.tags.length > 0 && <StackTags items={post.tags} label="Tags" />}
      </div>
    </article>
  )
}
