import type { MetadataRoute } from "next"
import { site } from "@/lib/site"

/* Single-page site: only the homepage is listed. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ]
}
