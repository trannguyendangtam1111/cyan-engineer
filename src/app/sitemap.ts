import type { MetadataRoute } from "next"
import { site } from "@/lib/site"
import { detailProjects } from "@/lib/projects"
import { getPublishedSlugs } from "@/lib/blog"

/*
 * Published routes only: the homepage, the projects listing, a case study for
 * each project with verified detail content (the same list that
 * /projects/[slug] pre-renders), the blog listing, and every published post
 * (the same list that /blog/[slug] pre-renders). Drafts and any other slug
 * are a 404 and never listed.
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
    { url: `${site.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
    ...getPublishedSlugs().map((slug) => ({
      url: `${site.url}/blog/${slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ]
}
