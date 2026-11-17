import { BookOpen, Gamepad2, MapPin, type LucideIcon } from "lucide-react"
import type { Project } from "@/lib/projects"

/* Presentation only — content and links live in projects.ts */
export const PROJECT_LOOK: Record<
  Project["id"],
  { icon: LucideIcon; tile: string; bar: string; check: string }
> = {
  foodmap: {
    icon: MapPin,
    tile: "bg-mint text-mint-ink",
    bar: "bg-mint-ink",
    check: "text-mint-ink",
  },
  cyanarcade: {
    icon: Gamepad2,
    tile: "bg-butter-soft text-butter-ink",
    bar: "bg-butter",
    check: "text-butter-ink",
  },
  englishlab: {
    icon: BookOpen,
    tile: "bg-lavender text-lavender-ink",
    bar: "bg-lavender-ink",
    check: "text-lavender-ink",
  },
}
