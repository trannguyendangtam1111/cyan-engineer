import { Github } from "lucide-react"
import { site } from "@/lib/site"
import { BentoCard } from "@/components/bento-card"
import { ContactCard } from "@/components/contact-card"
import { CVCard } from "@/components/cv-card"
import { ProjectCard } from "@/components/projects-card"
import { SkillsCard } from "@/components/skills-card"

/*
 * Two tiers: project cards, Skills and CV are primary, GitHub / Contact secondary.
 * DOM order is the reading order at every width — no `order-*` overrides.
 *
 *   Desktop (lg, 12 col):  FoodMap 6 | Cyan Arcade 6
 *                          Skills 8  | CV 4
 *                          GitHub 6  | Contact 6
 *   Tablet  (md, 6 col):   FoodMap 3 | Cyan Arcade 3
 *                          Skills 6
 *                          CV 3 | GitHub 3
 *                          Contact 6
 *   Small tablet (sm):     as tablet, but project cards stacked (6 each)
 *   Mobile  (1 col):       FoodMap, Cyan Arcade, Skills, CV, GitHub, Contact
 */
export function BentoGrid() {
  const { github } = site.links

  return (
    <nav aria-label="Primary destinations">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6 sm:gap-5 lg:grid-cols-12 lg:gap-6">
        {site.projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            className="sm:col-span-6 md:col-span-3 lg:col-span-6"
          />
        ))}

        <SkillsCard className="sm:col-span-6 lg:col-span-8" />

        <CVCard className="sm:col-span-3 lg:col-span-4" />

        {github !== null && (
          <BentoCard
            title="GitHub"
            meta={`@${github.replace(/^https?:\/\/github\.com\//, "")}`}
            caption="Source for FoodMap, Cyan Arcade, and smaller experiments."
            href={github}
            icon={Github}
            className="sm:col-span-3 lg:col-span-6"
          />
        )}

        <ContactCard className="sm:col-span-6 lg:col-span-6" />
      </div>
    </nav>
  )
}
