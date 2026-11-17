/*
 * Identity and destinations — single source of truth for the site.
 * Project data lives in projects.ts.
 *
 * A destination set to `null` is hidden. Never put a guessed or example URL here.
 *
 * VERIFIED (checked 2026-11-17)
 *   name               — full name as printed on the CV (no diacritics there)
 *   links.github       — profile
 *   links.cv           — the owner's CV.pdf, published with approval (2026-11-17)
 *   links.email        — the address printed on that CV, approved for the site
 *   skills             — only technologies used in FoodMap or Cyan Arcade
 *                        (pom.xml, frontend sources, migrations, CI workflow)
 *
 * NEEDS INPUT — null until real details exist
 *   links.linkedin
 */
export type Destination = string | null

export interface SkillGroup {
  id: "languages" | "backend" | "database" | "tools"
  label: string
  items: string[]
}

interface SiteConfig {
  /** Professional display name — matches the CV. */
  name: string
  /** Personal brand, behind the cyan.engineer domain. */
  brand: string
  location: string
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
  skills: SkillGroup[]
}

export const site: SiteConfig = {
  name: "Tran Nguyen Dang Tam",
  brand: "Cyan",
  location: "Ho Chi Minh City",
  domain: "cyan.engineer",
  url: "https://cyan.engineer",
  role: "Java Backend Engineer",
  pitch:
    "I build backend systems with Java and Spring Boot: secure REST APIs, PostgreSQL databases, and tested services, shown in FoodMap and Cyan Arcade.",
  availability: "Open to Work · Ho Chi Minh City",
  links: {
    github: "https://github.com/trannguyendangtam1111",
    cv: "/cv/tran-nguyen-dang-tam-cv.pdf",
    linkedin: null,
    email: "mailto:trannguyendangtam1111@gmail.com",
  },
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
