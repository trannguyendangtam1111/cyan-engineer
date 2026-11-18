import { site } from "@/lib/site"
import type { PostMeta } from "@/lib/blog"
import { alt as imageAlt, size as imageSize } from "@/app/opengraph-image"

/*
 * Schema.org JSON-LD for the blog, built only from verified site and post
 * metadata (lib/site.ts, post frontmatter). No dateModified: posts have no
 * recorded content-change date, and a build time is not one.
 */

const blogUrl = `${site.url}/blog`

/** The site owner, as author and publisher of the blog. */
function person() {
  const sameAs = [site.links.github, site.links.linkedin].filter((link): link is string => link !== null)
  return {
    "@type": "Person",
    "@id": `${site.url}/#person`,
    name: site.name,
    url: site.url,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
}

/** The site-wide social image (app/opengraph-image.tsx), also used by every post. */
function socialImage() {
  return {
    "@type": "ImageObject",
    url: `${site.url}/opengraph-image`,
    width: imageSize.width,
    height: imageSize.height,
    caption: imageAlt,
  }
}

export function postUrl(slug: string): string {
  return `${blogUrl}/${slug}`
}

export function blogPostingJsonLd(post: PostMeta) {
  const url = postUrl(post.slug)
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: post.date,
    author: person(),
    publisher: person(),
    image: socialImage(),
    keywords: post.tags.join(", "),
    inLanguage: "en",
    isPartOf: { "@type": "Blog", "@id": `${blogUrl}#blog` },
  }
}

/** The /blog listing: the blog itself and its published posts (drafts are never passed in). */
export function blogJsonLd(posts: PostMeta[], description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${blogUrl}#blog`,
    name: `Blog · ${site.name}`,
    description,
    url: blogUrl,
    inLanguage: "en",
    author: person(),
    publisher: person(),
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": `${postUrl(post.slug)}#article`,
      headline: post.title,
      url: postUrl(post.slug),
      datePublished: post.date,
    })),
  }
}

/*
 * JSON for a <script type="application/ld+json"> body. JSON.stringify does not
 * escape "<", so a value containing "</script>" could end the script early.
 * Writing <, >, & and the two JS line separators (U+2028, U+2029) as JSON
 * unicode escapes keeps the script inert, and JSON parsers read back the same
 * text. Built from char codes so the source holds no escape sequences.
 */
const BACKSLASH = String.fromCharCode(92)
const UNSAFE = new RegExp(`[<>&${String.fromCharCode(0x2028, 0x2029)}]`, "g")

export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(
    UNSAFE,
    (char) => `${BACKSLASH}u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
  )
}
