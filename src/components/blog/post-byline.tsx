import { cn } from "@/lib/utils"
import { site } from "@/lib/site"
import { formatPostDate } from "@/lib/blog"

interface PostBylineProps {
  date: string
  readingMinutes: number
  /** Show "By {author}" first (article pages); listings may leave it out. */
  showAuthor?: boolean
  className?: string
}

/*
 * "By Tran Nguyen Dang Tam · 18 Nov 2026 · 7 min read". The date is a
 * machine-readable <time>; the dots are decoration and hidden from screen readers.
 */
export function PostByline({ date, readingMinutes, showAuthor = true, className }: PostBylineProps) {
  const parts = [
    showAuthor && (
      <span key="author">
        By <span className="font-semibold text-fg">{site.name}</span>
      </span>
    ),
    <span key="date">
      <span className="sr-only">Published </span>
      <time dateTime={date}>{formatPostDate(date)}</time>
    </span>,
    <span key="time">{readingMinutes} min read</span>,
  ].filter(Boolean)

  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium leading-[1.5] text-fg-muted",
        className
      )}
    >
      {parts.map((part, i) => (
        <span key={i} className="inline-flex items-center gap-x-2">
          {i > 0 && (
            <span aria-hidden="true" className="text-fg-subtle">
              ·
            </span>
          )}
          {part}
        </span>
      ))}
    </p>
  )
}
