/*
 * Identity, projects and destinations — single source of truth for the homepage.
 *
 * A destination set to `null` is hidden (or, for a project, labelled
 * "Coming soon"). Never put a guessed or example URL here.
 *
 * VERIFIED (local git remotes; public on GitHub, checked 2026-11-17)
 *   links.github       — profile
 *   links.cv           — the owner's CV.pdf, published with approval (2026-11-17)
 *   links.email        — the address printed on that CV, approved for the site
 *   foodmap.href       — dev/FoodMap → trannguyendangtam1111/FoodMap
 *   cyanarcade.href    — dev/GameHub → trannguyendangtam1111/cyan-arcade
 *   stack, highlights  — each repo's README, cross-checked against its pom.xml
 *                        and source (Cyan Arcade: the `main` branch)
 *   skills             — only technologies used in FoodMap or Cyan Arcade
 *                        (pom.xml, frontend sources, migrations, CI workflow)
 *
 * NEEDS INPUT — null until real details exist
 *   links.linkedin
 */
export type Destination = string | null

export interface Project {
  id: "foodmap" | "cyanarcade"
  name: string
  tagline: string
  /** Technology labels taken from each project's own README. */
  stack: string[]
  /** Backend engineering points, each traceable to the project's README. */
  highlights: string[]
  /** Screenshot in /public, copied from the project's docs/screenshots. */
  image: { src: string; alt: string }
  /** Public repository or live URL. */
  href: Destination
}

export interface SkillGroup {
  id: "languages" | "backend" | "database" | "tools"
  label: string
  items: string[]
}

interface SiteConfig {
  name: string
  domain: string
  url: string
  role: string
  pitch: string
  availability: string
  links: {
    github: Destination
    cv: Destination
    linkedin: Destination
    /** Full `mailto:` URL. */
    email: Destination
  }
  projects: Project[]
  skills: SkillGroup[]
}

export const site: SiteConfig = {
  name: "Cyan",
  domain: "cyan.engineer",
  url: "https://cyan.engineer",
  role: "Java Backend Engineer",
  pitch: "I build software projects with Java, Spring Boot, and modern web technologies.",
  availability: "Available for backend roles · Remote · EU",
  links: {
    github: "https://github.com/trannguyendangtam1111",
    cv: "/cv/tran-nguyen-dang-tam-cv.pdf",
    linkedin: null,
    email: "mailto:trannguyendangtam1111@gmail.com",
  },
  projects: [
    {
      id: "foodmap",
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
      href: "https://github.com/trannguyendangtam1111/FoodMap",
    },
    {
      id: "cyanarcade",
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
      href: "https://github.com/trannguyendangtam1111/cyan-arcade",
    },
  ],
  skills: [
    {
      id: "languages",
      label: "Languages",
      items: ["Java", "TypeScript", "JavaScript", "SQL"],
    },
    {
      id: "backend",
      label: "Backend",
      items: ["Spring Boot", "Spring Security", "REST APIs", "JPA / Hibernate"],
    },
    {
      id: "database",
      label: "Database",
      items: ["PostgreSQL", "PostGIS", "Flyway"],
    },
    {
      id: "tools",
      label: "Tools & Testing",
      items: ["Git", "Docker", "JUnit 5", "Testcontainers", "GitHub Actions"],
    },
  ],
}

/** Repository links on github.com open in a new tab. */
export function isExternal(href: string) {
  return /^https?:\/\//.test(href) && !href.startsWith(site.url)
}
