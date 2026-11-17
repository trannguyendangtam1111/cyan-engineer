import { cn } from "@/lib/utils"

interface ComingSoonProps {
  label?: string
  className?: string
}

/* Shown wherever a destination is not available yet (see `site.ts`). */
export function ComingSoon({ label = "Coming soon", className }: ComingSoonProps) {
  return (
    <span
      className={cn(
        "inline-flex flex-shrink-0 items-center whitespace-nowrap rounded-full",
        "border border-dashed border-line-strong px-2.5 py-0.5",
        "text-[12px] font-medium leading-[1.6] text-fg-muted",
        className
      )}
    >
      {label}
    </span>
  )
}
