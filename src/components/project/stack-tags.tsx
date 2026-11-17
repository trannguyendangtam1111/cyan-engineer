import { cn } from "@/lib/utils"

interface StackTagsProps {
  items: string[]
  /** Accessible name for the list. */
  label?: string
  className?: string
}

/* Technology pills (.stack-tag in globals.css), wrapping onto new lines as needed. */
export function StackTags({ items, label = "Tech stack", className }: StackTagsProps) {
  return (
    <ul role="list" aria-label={label} className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((item) => (
        <li key={item} className="stack-tag">
          {item}
        </li>
      ))}
    </ul>
  )
}
