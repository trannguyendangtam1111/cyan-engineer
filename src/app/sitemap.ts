import type { MetadataRoute } from "next"
import { site } from "@/lib/site"
import { detailProjects } from "@/lib/projects"

/*
 * Published routes only: the homepage, the projects listing, and a case study
 * for each project with verified detail content (the same list that
 * /projects/[slug] pre-renders — any other slug is a 404).
 *
 * No lastModified: a build timestamp is not a real content-change date.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/projects`, changeFrequency: "monthly", priority: 0.8 },
    ...detailProjects.map(({ slug }) => ({
      url: `${site.url}/projects/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
