import { notFound } from "next/navigation"
import { site } from "@/lib/site"
import { detailProjects } from "@/lib/projects"
import { OG_CONTENT_TYPE, OG_SIZE, projectOgImage } from "@/components/og/project-og-image"

/*
 * Per-project social preview (1200×630), prerendered for each published case
 * study — the same slugs as the page. `alt` is static so the images stay
 * static; og:title names the project.
 */
export const alt = `Project case study by ${site.name} · ${site.domain}`
export const contentType = OG_CONTENT_TYPE
export const size = OG_SIZE

export function generateStaticParams() {
  return detailProjects.map(({ slug }) => ({ slug }))
}

type Params = { slug: string }

export default async function Image({ params }: { params: Params | Promise<Params> }) {
  const { slug } = await params
  const project = detailProjects.find((p) => p.slug === slug)
  if (!project) notFound()
  return projectOgImage(project)
}
