import Link from "next/link"
import { cn } from "@/lib/utils"
import type { PostMeta } from "@/lib/blog"
import { StackTags } from "@/components/project/stack-tags"
import { PostDate } from "@/components/blog/post-date"

/*
 * Article card on /blog. Same stretched-link pattern as the project cards:
 * "Read article" covers the whole card with an ::after overlay and its focus
 * ring is drawn on the card, so the card is one tab stop.
 */
export function PostCard({ post, className }: { post: PostMeta; className?: string }) {
  const titleId = `post-${post.slug}-title`

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "group relative flex flex-col rounded-[20px] border border-line bg-surface p-5 shadow-card-sm",
        "transition-[translate,border-color,box-shadow] duration-150 ease-[var(--ease-out)]",
        "hover:border-line-hover hover:shadow-card motion-safe:hover:-translate-y-0.5",
        "has-[[data-card-link]:focus-visible]:ring-focus sm:rounded-[24px] sm:p-6",
        className
      )}
    >
      <PostDate date={post.date} />

      <h2
        id={titleId}
        className="mt-3 text-fg-strong text-[19px] font-bold leading-[1.3] tracking-[-0.02em] text-balance sm:text-[20px]"
      >
        {post.title}
      </h2>

      <p className="mt-2 text-[15px] leading-[1.6] text-fg-muted text-pretty">{post.description}</p>

      {/* Tags + action, pinned to the bottom so cards in a row line up */}
      <div className="mt-auto pt-5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-line pt-4">
          {post.tags.length > 0 && <StackTags items={post.tags} label="Tags" />}
          <Link
            href={`/blog/${post.slug}`}
            data-card-link
            className="
              inline-flex items-center gap-1.5 rounded-[8px] text-[14px] font-semibold text-accent-ink
              underline-offset-4 group-hover:underline
              after:absolute after:inset-0 after:content-['']
              focus-visible:shadow-none focus-visible:outline-none
            "
          >
            Read article
            <span aria-hidden="true">→</span>
            <span className="sr-only">: {post.title}</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
