import { Github, Mail, PenLine } from "lucide-react"
import { site } from "@/lib/site"
import { BentoCard } from "@/components/bento-card"
import { CVCard } from "@/components/cv-card"
import { ProjectCard } from "@/components/projects-card"

/*
 * Two tiers: project cards + CV are primary, Writing / GitHub / Contact secondary.
 *
 *   Desktop (lg, 12 col):  FoodMap 6 | Cyan Arcade 6
 *                          CV 3 | Writing 3 | GitHub 3 | Contact 3
 *   Tablet  (sm, 6 col):   FoodMap 6
 *                          Cyan Arcade 6
 *                          CV 3 (2 rows) | Writing 3
 *                                        | GitHub 3
 *                          Contact 6
 *   Mobile  (1 col):       CV, FoodMap, Cyan Arcade, Writing, GitHub, Contact
 */
export function BentoGrid() {
  return (
    <nav aria-label="Primary destinations">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6 sm:gap-5 lg:grid-cols-12 lg:gap-6">
        {/* CV — first in DOM for recruiter-first order on mobile */}
        <CVCard
          className="
            order-first
            sm:order-2 sm:col-span-3 sm:row-span-2
            lg:col-span-3 lg:row-span-1
          "
        />

        {site.projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            className="order-2 sm:order-1 sm:col-span-6"
          />
        ))}

        {/* Entry point to the personal blog (not built yet) */}
        <BentoCard
          title="Writing"
          caption="Notes on what I build, learn, and discover."
          href={site.links.blog}
          icon={PenLine}
          className="order-3 sm:col-span-3"
        />

        <BentoCard
          title="GitHub"
          caption="Source for FoodMap, Cyan Arcade, and smaller experiments."
          href={site.links.github}
          icon={Github}
          className="order-4 sm:col-span-3"
        />

        <BentoCard
          title="Contact"
          caption="About backend work, systems, or to talk shop."
          href={site.links.email}
          icon={Mail}
          className="order-5 sm:col-span-6 lg:col-span-3"
        />
      </div>
    </nav>
  )
}
