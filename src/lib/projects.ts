import type { Destination } from "@/lib/site"

/*
 * Projects — single source of truth for every page that shows a project.
 *
 * Only verified facts belong here. Leave a field `null` (or omit `detail`)
 * rather than guessing; the UI hides what is missing.
 *
 * VERIFIED (local git remotes; public on GitHub, checked 2026-11-17)
 *   foodmap.repository    — dev/FoodMap → trannguyendangtam1111/FoodMap
 *   cyanarcade.repository — dev/GameHub → trannguyendangtam1111/cyan-arcade
 *   englishlab.repository — dev/EnglishLab → trannguyendangtam1111/englishLab
 *   stack, highlights     — each repo's README, cross-checked against its pom.xml
 *                           and source (Cyan Arcade: the `main` branch)
 *   englishlab            — README, backend/pom.xml and frontend/package.json on
 *                           the public `main` branch (9059f57). It has no AI
 *                           features yet, so none are claimed.
 *
 * NEEDS INPUT — null until the owner confirms
 *   status (all projects)
 */

export type ProjectStatus = "completed" | "in-development" | "paused"

export interface ProjectImage {
  src: string
  alt: string
}

/** Long-form content for /projects/[slug]. A project without it gets no detail page. */
export interface ProjectDetail {
  overview: string[]
  features: string[]
  /** Backend architecture and engineering decisions, when the repo documents them. */
  architecture?: string[]
  screenshots?: (ProjectImage & { caption?: string })[]
}

export interface Project {
  /** Stable key for presentation lookups (icon, accent colour). */
  id: "foodmap" | "cyanarcade" | "englishlab"
  /** URL segment for /projects/[slug]. */
  slug: string
  name: string
  tagline: string
  /** Technology labels taken from each project's own README. */
  stack: string[]
  /** Backend engineering points, each traceable to the project's README. */
  highlights: string[]
  /** Screenshot in /public, copied from the project's docs/screenshots. `null` for list-only cards. */
  image: ProjectImage | null
  /** Public repository URL. */
  repository: Destination
  /** Shown on the homepage. Featured projects must have an image. */
  featured: boolean
  /** `null` until confirmed by the owner; never shown when null. */
  status: ProjectStatus | null
  detail?: ProjectDetail
}

export type FeaturedProject = Project & { featured: true; image: ProjectImage }

export const projects: Project[] = [
  {
    id: "foodmap",
    slug: "foodmap",
    name: "FoodMap",
    tagline: "Food and restaurant discovery for Ho Chi Minh City.",
    stack: ["Java 17", "Spring Boot", "PostgreSQL/PostGIS", "React"],
    highlights: [
      "JWT access tokens with hashed, rotating refresh tokens and reuse detection",
      "Vietnamese-aware search with pg_trgm and unaccent, plus PostGIS spatial filtering",
      "Versioned Flyway migrations and per-IP rate limiting",
    ],
    image: {
      src: "/projects/foodmap-home.png",
      alt: "FoodMap home page in Vietnamese: a food and restaurant search box, the “What to eat today?” picker, and food categories around central Ho Chi Minh City.",
    },
    repository: "https://github.com/trannguyendangtam1111/FoodMap",
    featured: true,
    status: null,
  },
  {
    id: "cyanarcade",
    slug: "cyan-arcade",
    name: "Cyan Arcade",
    tagline: "A full-stack browser arcade with accounts, leaderboards, a coin economy, and trading-card packs.",
    stack: ["Java 21", "Spring Boot", "PostgreSQL", "React/TypeScript"],
    highlights: [
      "Spring Security session auth with CSRF protection and USER/ADMIN roles",
      "Transactional coin wallet with row locks, an auditable ledger, and idempotent purchases",
      "PostgreSQL Testcontainers, ArchUnit rules, and GitHub Actions CI",
    ],
    image: {
      src: "/projects/cyan-arcade-home.png",
      alt: "Cyan Arcade hub page: a welcome banner, completed daily challenges for Snake, 2048, and Tetris, and the featured games row.",
    },
    repository: "https://github.com/trannguyendangtam1111/cyan-arcade",
    featured: true,
    status: null,
  },
  {
    id: "englishlab",
    slug: "englishlab",
    name: "EnglishLab",
    tagline: "A personal English learning platform with a daily study plan, vocabulary review, and IELTS practice.",
    stack: ["Java 21", "Spring Boot", "PostgreSQL", "React/TypeScript"],
    // List-only entry: no highlights, screenshot or detail page yet
    highlights: [],
    image: null,
    repository: "https://github.com/trannguyendangtam1111/englishLab",
    featured: false,
    status: null,
  },
]

function isFeatured(project: Project): project is FeaturedProject {
  return project.featured && project.image !== null
}

/** Homepage projects, in display order. */
export const featuredProjects: FeaturedProject[] = projects.filter(isFeatured)

/** Listed on /projects below the featured ones. */
export const otherProjects: Project[] = projects.filter((project) => !isFeatured(project))
