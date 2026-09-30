import Link from 'next/link'
import React from 'react'

import { MediaImage } from '@/components/MediaImage'
import type { Project } from '@/payload-types'

const roomLabels: Record<string, string> = {
  kitchen: 'Kitchen',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  multiple: 'Whole home',
}

const aspects = {
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/10]',
  square: 'aspect-square',
}

type ProjectCardProps = {
  project: Project
  aspect?: keyof typeof aspects
  sizes?: string
  priority?: boolean
}

/**
 * A project tile. The whole card is one link, with the image given a slow zoom
 * on hover — the only affordance needed for a photography-led card.
 */
export const ProjectCard = ({
  project,
  aspect = 'portrait',
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
}: ProjectCardProps) => {
  return (
    <Link className="group block" href={`/projects/${project.slug}`}>
      <div className={`relative overflow-hidden bg-bone-deep ${aspects[aspect]}`}>
        <MediaImage
          className="transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          fill
          media={project.heroImage}
          priority={priority}
          size="card"
          sizes={sizes}
        />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <div>
          <p className="eyebrow">
            {roomLabels[project.roomType] ?? project.roomType} · {project.location}
          </p>
          <h3 className="mt-2 font-display text-xl leading-snug transition-colors duration-300 group-hover:text-brass lg:text-2xl">
            {project.title}
          </h3>
        </div>
      </div>
    </Link>
  )
}
