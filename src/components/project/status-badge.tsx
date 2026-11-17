import { cn } from "@/lib/utils"
import type { ProjectStatus } from "@/lib/projects"

/* The label carries the meaning; the dot colour only reinforces it. */
const STATUS: Record<ProjectStatus, { label: string; dot: string }> = {
  completed: { label: "Completed", dot: "bg-accent" },
  "in-development": { label: "In development", dot: "bg-butter" },
  paused: { label: "Paused", dot: "bg-fg-subtle" },
}

interface StatusBadgeProps {
  /** `null` = not confirmed yet; nothing is rendered. */
  status: ProjectStatus | null
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (status === null) return null
  const { label, dot } = STATUS[status]

  return (
    <span className={cn("stack-tag gap-1.5", className)}>
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", dot)} />
      {label}
    </span>
  )
}
