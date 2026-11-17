import { Github, Mail } from "lucide-react"
import { site } from "@/lib/site"
import { BentoCard } from "@/components/bento-card"
import { CVCard } from "@/components/cv-card"
import { ProjectCard } from "@/components/projects-card"
import { SkillsCard } from "@/components/skills-card"

/*
 * Two tiers: project cards, Skills and CV are primary, GitHub / Contact secondary.
 *
 *   Desktop (lg, 12 col):  FoodMap 6 | Cyan Arcade 6
 *                          Skills 8  | CV 4
 *                          GitHub 6  | Contact 6
 *   Tablet  (sm, 6 col):   FoodMap 6
 *                          Cyan Arcade 6
 *                          Skills 6
 *                          CV 3 (2 rows) | GitHub 3
 *                                        | Contact 3
 *   Mobile  (1 col):       CV, FoodMap, Cyan Arcade, Skills, GitHub, Contact
 */
export function BentoGrid() {
  return (
    <nav aria-label="Primary destinations">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6 sm:gap-5 lg:grid-cols-12 lg:gap-6">
        {/* CV — first in DOM for recruiter-first order on mobile */}
        <CVCard
          className="
            order-first
            sm:order-3 sm:col-span-3 sm:row-span-2
            lg:col-span-4 lg:row-span-1
          "
        />

        {site.projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            className="order-2 sm:order-1 sm:col-span-6"
          />
        ))}

        <SkillsCard className="order-3 sm:order-2 sm:col-span-6 lg:col-span-8" />

        <BentoCard
          title="GitHub"
          caption="Source for FoodMap, Cyan Arcade, and smaller experiments."
          href={site.links.github}
          icon={Github}
          className="order-4 sm:col-span-3 lg:col-span-6"
        />

        <BentoCard
          title="Contact"
          caption="About backend work, systems, or to talk shop."
          href={site.links.email}
          icon={Mail}
          className="order-5 sm:col-span-3 lg:col-span-6"
        />
      </div>
    </nav>
  )
}
