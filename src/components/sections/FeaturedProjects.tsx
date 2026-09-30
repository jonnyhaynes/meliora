import React from 'react'

import { Container } from '@/components/Container'
import { CtaLink } from '@/components/CtaLink'
import { ProjectCard } from '@/components/ProjectCard'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import type { Project } from '@/payload-types'

/**
 * Staggered editorial grid: wide, then a tall offset tile, then a centred one.
 * The pattern repeats for as many projects as the editor selects.
 */
const layout = [
  { aspect: 'wide', span: 'lg:col-span-8' },
  { aspect: 'portrait', span: 'lg:col-span-4 lg:pt-24' },
  { aspect: 'portrait', span: 'lg:col-span-5 lg:col-start-4' },
  { aspect: 'landscape', span: 'lg:col-span-7 lg:col-start-6 lg:pt-16' },
] as const

export const FeaturedProjects = ({
  projects,
  heading = 'Selected work',
  intro,
}: {
  projects: Project[]
  heading?: string
  intro?: string
}) => {
  if (projects.length === 0) return null

  return (
    <section className="py-24 lg:py-32">
      <Container width="wide">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SectionHeading eyebrow="Our work" intro={intro} title={heading} />
            <CtaLink className="group" href="/projects" variant="text">
              All projects
            </CtaLink>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-x-8 gap-y-16 lg:mt-20 lg:grid-cols-12 lg:gap-y-24">
          {projects.map((project, index) => {
            const pattern = layout[index % layout.length]
            return (
              <Reveal className={pattern.span} key={project.id} delay={index * 60}>
                <ProjectCard
                  aspect={pattern.aspect}
                  project={project}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
