import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, Github } from "lucide-react"
import { cn } from "@/lib/utils"
import { isExternal, site } from "@/lib/site"
import { detailProjects, type DetailProject, type ProjectPoint } from "@/lib/projects"
import { Breadcrumb } from "@/components/project/breadcrumb"
import { BrowserFrame } from "@/components/project/browser-frame"
import { PROJECT_LOOK } from "@/components/project/project-look"
import { StackTags } from "@/components/project/stack-tags"
import { StatusBadge } from "@/components/project/status-badge"

/* Only projects with verified detail content get a page; any other slug is a 404. */
export const dynamicParams = false

export function generateStaticParams() {
  return detailProjects.map(({ slug }) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

function findProject(slug: string) {
  return detailProjects.find((project) => project.slug === slug)
}

// og:image and twitter:image come from the project-specific
// opengraph-image.tsx / twitter-image.tsx in this folder.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = findProject((await params).slug)
  if (!project) return {}

  const title = `${project.name} · ${site.name}`
  const description = `${project.tagline} Built with ${project.stack.slice(0, -1).join(", ")} and ${project.stack.at(-1)}.`
  const url = `/projects/${project.slug}`

  return {
    title: project.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: site.domain,
      type: "article",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

const sectionHeading =
  "text-fg-strong text-[20px] font-bold leading-[1.25] tracking-[-0.02em] sm:text-[22px]"

const panel = "rounded-[20px] border border-line bg-surface p-5 shadow-card-sm sm:p-6"

const button =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] px-5 " +
  "text-[15px] font-semibold leading-none tracking-[-0.01em] transition-colors duration-100 " +
  "focus-visible:outline-none focus-visible:ring-focus"

export default async function ProjectPage({ params }: PageProps) {
  const project = findProject((await params).slug)
  if (!project) notFound()

  const { id, name, tagline, image, repository, status, detail } = project
  const look = PROJECT_LOOK[id]
  const Icon = look.icon
  const external = repository !== null && isExternal(repository)
  const repoPath = repository?.replace(/^https?:\/\/github\.com\//, "")

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12"
    >
      {/* Top-bar → page header */}
      <header className="mt-6 sm:mt-10 lg:mt-12">
        <Breadcrumb
          trail={[
            { href: "/", label: "Home" },
            { href: "/projects", label: "Projects" },
          ]}
          current={name}
        />

        <div className="mt-6 flex items-start gap-4">
          <span
            aria-hidden="true"
            className={cn(
              "mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] sm:h-14 sm:w-14",
              look.tile
            )}
          >
            <Icon size={24} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h1
              className="text-fg-strong font-bold leading-[1.05] tracking-[-0.035em]"
              style={{ fontSize: "clamp(34px, 4.5vw, 48px)" }}
            >
              {name}
            </h1>
            <p className="mt-3 max-w-[640px] text-[15px] leading-[1.6] text-fg-muted text-pretty sm:text-[17px]">
              {tagline}
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          {repository !== null && (
            <a
              href={repository}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={cn(button, "bg-accent text-accent-on hover:bg-accent-hover active:bg-accent-pressed")}
            >
              <Github aria-hidden="true" size={16} strokeWidth={2} />
              View on GitHub
              <span aria-hidden="true">↗</span>
              {external && <span className="sr-only"> (opens in new tab)</span>}
            </a>
          )}
          <Link
            href="/projects"
            className={cn(
              button,
              "border border-line bg-surface text-fg-strong hover:border-line-hover hover:text-accent-ink"
            )}
          >
            <ArrowLeft aria-hidden="true" size={16} strokeWidth={2} />
            All projects
          </Link>
        </div>
      </header>

      {/*
        Mobile: screenshot → sidebar → sections.
        Desktop (lg): screenshot and sections in 8 columns, sticky sidebar in 4.
      */}
      <div className="mt-10 grid grid-cols-1 gap-10 sm:mt-12 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-14">
        <div className="lg:col-span-8 lg:row-start-1">
          <BrowserFrame
            src={image.src}
            alt={image.alt}
            priority
            sizes="(min-width: 1200px) 730px, (min-width: 1024px) 62vw, 92vw"
          />
        </div>

        <aside
          aria-label={`${name} facts`}
          className="lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1"
        >
          <div className="flex flex-col gap-4 lg:sticky lg:top-6">
            <section aria-labelledby="stack-heading" className={panel}>
              <h2 id="stack-heading" className="text-fg-strong text-[16px] font-semibold leading-[1.3]">
                Tech stack
              </h2>
              <dl className="mt-4 flex flex-col gap-4">
                {detail.stackGroups.map((group) => (
                  <div key={group.label}>
                    <dt className="text-[12px] font-semibold uppercase leading-none tracking-[0.08em] text-fg-subtle">
                      {group.label}
                    </dt>
                    <dd className="mt-2">
                      <StackTags items={group.items} label={`${group.label} technologies`} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {status !== null && (
              <section aria-labelledby="status-heading" className={panel}>
                <h2 id="status-heading" className="text-fg-strong text-[16px] font-semibold leading-[1.3]">
                  Status
                </h2>
                <StatusBadge status={status} className="mt-3" />
              </section>
            )}

            {repository !== null && (
              <section aria-labelledby="repo-heading" className={panel}>
                <h2 id="repo-heading" className="text-fg-strong text-[16px] font-semibold leading-[1.3]">
                  Source code
                </h2>
                <p className="mt-1 break-all text-[14px] font-medium leading-[1.5] text-fg-muted">
                  {repoPath}
                </p>
                <a
                  href={repository}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="
                    mt-4 inline-flex items-center gap-1.5 rounded-[8px]
                    text-[14px] font-semibold text-accent-ink
                    underline-offset-4 hover:underline
                    focus-visible:outline-none focus-visible:ring-focus
                  "
                >
                  <Github aria-hidden="true" size={15} strokeWidth={2} />
                  GitHub repository
                  <span aria-hidden="true">↗</span>
                  {external && <span className="sr-only"> (opens in new tab)</span>}
                </a>
              </section>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-12 sm:gap-14 lg:col-span-8 lg:row-start-2">
          <section aria-labelledby="overview-heading">
            <h2 id="overview-heading" className={sectionHeading}>
              Overview
            </h2>
            <div className="mt-4 flex max-w-[68ch] flex-col gap-4 text-[15px] leading-[1.7] text-fg sm:text-[16px]">
              {detail.overview.map((paragraph) => (
                <p key={paragraph} className="text-pretty">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section aria-labelledby="features-heading">
            <h2 id="features-heading" className={sectionHeading}>
              Key features
            </h2>
            <ul role="list" className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {detail.features.map((feature) => (
                <li key={feature.title} className="rounded-[16px] border border-line bg-surface p-4 sm:p-5">
                  <PointText point={feature} checkClass={look.check} />
                </li>
              ))}
            </ul>
          </section>

          {detail.architecture && detail.architecture.length > 0 && (
            <section aria-labelledby="architecture-heading">
              <h2 id="architecture-heading" className={sectionHeading}>
                Architecture &amp; engineering decisions
              </h2>
              <ol role="list" className="mt-5 flex flex-col">
                {detail.architecture.map((point, index) => (
                  <li
                    key={point.title}
                    className="flex gap-4 border-t border-line py-5 first:border-t-0 first:pt-0 last:pb-0"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-line bg-surface-sunken text-[12px] font-semibold text-fg-muted"
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-fg-strong text-[16px] font-semibold leading-[1.35]">
                        {point.title}
                      </h3>
                      <p className="mt-1.5 text-[15px] leading-[1.65] text-fg-muted text-pretty">
                        {point.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {detail.screenshots && detail.screenshots.length > 0 && (
            <section aria-labelledby="screenshots-heading">
              <h2 id="screenshots-heading" className={sectionHeading}>
                Screenshots
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                {detail.screenshots.map((shot, index) => {
                  // With an odd count, the first screenshot spans the full width
                  const wide = detail.screenshots!.length % 2 === 1 && index === 0
                  return (
                    <figure
                      key={shot.src}
                      className={cn(
                        "overflow-hidden rounded-[14px] border border-line bg-surface",
                        wide && "sm:col-span-2"
                      )}
                    >
                      <Image
                        src={shot.src}
                        alt={shot.alt}
                        width={shot.width}
                        height={shot.height}
                        sizes={
                          wide
                            ? "(min-width: 1200px) 730px, (min-width: 1024px) 62vw, 92vw"
                            : "(min-width: 1200px) 360px, (min-width: 640px) 45vw, 92vw"
                        }
                        className="h-auto w-full border-b border-line"
                      />
                      <figcaption className="px-4 py-3 text-[13px] leading-[1.5] text-fg-muted">
                        {shot.caption}
                      </figcaption>
                    </figure>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      <ProjectPager current={project} />

      {/* Content → Footer (rendered by the root layout) */}
      <div className="mt-16 sm:mt-20" />
    </main>
  )
}

function PointText({ point, checkClass }: { point: ProjectPoint; checkClass: string }) {
  return (
    <div className="flex gap-2.5">
      <Check
        aria-hidden="true"
        size={16}
        strokeWidth={2.25}
        className={cn("mt-[3px] flex-shrink-0", checkClass)}
      />
      <div className="min-w-0">
        <h3 className="text-fg-strong text-[15px] font-semibold leading-[1.4]">{point.title}</h3>
        <p className="mt-1 text-[14px] leading-[1.6] text-fg-muted text-pretty">{point.description}</p>
      </div>
    </div>
  )
}

/* Previous / next case study, in the same order as the Projects page. */
function ProjectPager({ current }: { current: DetailProject }) {
  const index = detailProjects.findIndex((project) => project.slug === current.slug)
  const previous = detailProjects[index - 1]
  const next = detailProjects[index + 1]
  if (!previous && !next) return null

  const link =
    "group flex flex-col gap-1 rounded-[16px] border border-line bg-surface p-4 sm:p-5 " +
    "transition-[border-color] duration-150 hover:border-line-hover " +
    "focus-visible:outline-none focus-visible:ring-focus"

  return (
    <nav aria-label="More projects" className="mt-14 border-t border-line pt-8 sm:mt-16">
      <ul role="list" className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {previous && (
          <li>
            <Link href={`/projects/${previous.slug}`} className={link}>
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-fg-muted">
                <ArrowLeft aria-hidden="true" size={14} strokeWidth={2} />
                Previous project
              </span>
              <span className="text-fg-strong text-[17px] font-semibold group-hover:text-accent-ink">
                {previous.name}
              </span>
            </Link>
          </li>
        )}
        {next && (
          <li className="sm:col-start-2">
            <Link href={`/projects/${next.slug}`} className={cn(link, "sm:items-end sm:text-right")}>
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-fg-muted">
                Next project
                <ArrowRight aria-hidden="true" size={14} strokeWidth={2} />
              </span>
              <span className="text-fg-strong text-[17px] font-semibold group-hover:text-accent-ink">
                {next.name}
              </span>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
