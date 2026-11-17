import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrowserFrameProps {
  src: string
  alt: string
  /** Responsive `sizes` for next/image; match the frame's rendered width. */
  sizes: string
  priority?: boolean
  className?: string
}

/* Screenshot in a minimal browser frame: three dots, 16:10, top-aligned crop. */
export function BrowserFrame({ src, alt, sizes, priority = false, className }: BrowserFrameProps) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-[14px] border border-line bg-surface-sunken",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="flex h-7 items-center gap-1.5 border-b border-line px-3"
      >
        <span className="h-2 w-2 rounded-full bg-line-strong" />
        <span className="h-2 w-2 rounded-full bg-line-strong" />
        <span className="h-2 w-2 rounded-full bg-line-strong" />
      </div>
      <div className="relative aspect-[16/10]">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover object-top"
        />
      </div>
    </figure>
  )
}
