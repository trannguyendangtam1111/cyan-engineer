import type { Metadata } from "next"
import { site } from "@/lib/site"
import { featuredProjects, otherProjects, projects } from "@/lib/projects"
import { ProjectCard } from "@/components/projects-card"
import { Breadcrumb } from "@/components/project/breadcrumb"
import { ProjectListCard } from "@/components/project/project-list-card"
import { alt, contentType, size } from "@/app/opengraph-image"

// The site-wide social image (app/opengraph-image.tsx). A page that sets its
// own openGraph/twitter fields must list it, or the image is dropped.
const socialImage = { url: "/opengraph-image", ...size, alt, type: contentType }

const title = "Projects"
const description = `Backend projects by ${site.name}: ${projects
  .map((p) => p.name)
  .join(", ")}. Built with Java, Spring Boot, and PostgreSQL, with source code on GitHub.`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/projects" },
  openGraph: {
    title: `${title} · ${site.name}`,
    description,
    url: "/projects",
    siteName: site.domain,
    type: "website",
    locale: "en_US",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · ${site.name}`,
    description,
    images: [{ ...socialImage, url: "/twitter-image" }],
  },
}

const sectionHeading =
  "text-fg-strong text-[20px] font-bold leading-[1.25] tracking-[-0.02em] sm:text-[22px]"

export default function ProjectsPage() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12"
    >
      {/* Top-bar → page header */}
      <header className="mt-6 sm:mt-10 lg:mt-12">
        <Breadcrumb trail={[{ href: "/", label: "Home" }]} current="Projects" />

        <h1
          className="mt-5 text-fg-strong font-bold leading-[1.05] tracking-[-0.035em]"
          style={{ fontSize: "clamp(34px, 4.5vw, 48px)" }}
        >
          Projects
        </h1>
        <p className="mt-3 max-w-[640px] text-[15px] leading-[1.6] text-fg-muted text-pretty sm:text-[16px]">
          Backend-focused projects built with Java, Spring Boot, and PostgreSQL. The source code
          for each one is on GitHub.
        </p>
      </header>

      {/* Header → Featured */}
      <section aria-labelledby="featured-heading" className="mt-10 sm:mt-12">
        <h2 id="featured-heading" className={sectionHeading}>
          Featured projects
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:gap-6">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} headingLevel="h3" />
          ))}
        </div>
      </section>

      {otherProjects.length > 0 && (
        <section aria-labelledby="other-heading" className="mt-14 sm:mt-16">
          <h2 id="other-heading" className={sectionHeading}>
            Other projects
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {otherProjects.map((project) => (
              <ProjectListCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Content → Footer (rendered by the root layout) */}
      <div className="mt-16 sm:mt-20" />
    </main>
  )
}
