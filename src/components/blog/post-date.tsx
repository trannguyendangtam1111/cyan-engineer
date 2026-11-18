import { cn } from "@/lib/utils"
import { formatPostDate } from "@/lib/blog"

/* Publication date: machine-readable <time>, read out as "Published 18 Nov 2026". */
export function PostDate({ date, className }: { date: string; className?: string }) {
  return (
    <p className={cn("text-[13px] font-medium leading-none text-fg-muted", className)}>
      <span className="sr-only">Published </span>
      <time dateTime={date}>{formatPostDate(date)}</time>
    </p>
  )
}
