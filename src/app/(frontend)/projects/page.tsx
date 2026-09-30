import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { Container } from '@/components/Container'
import { PageHero } from '@/components/PageHero'
import { ProjectCard } from '@/components/ProjectCard'
import { Reveal } from '@/components/Reveal'
import { getPayloadClient } from '@/lib/payload'
import type { Project } from '@/payload-types'

export const metadata: Metadata = {
  description:
    'Kitchens, bedrooms and bathrooms we have designed and fitted across Bawtry, Doncaster and South Yorkshire.',
  title: 'Projects',
}

const roomFilters = [
  { label: 'All', value: '' },
  { label: 'Kitchens', value: 'kitchen' },
  { label: 'Bedrooms', value: 'bedroom' },
  { label: 'Bathrooms', value: 'bathroom' },
  { label: 'Whole home', value: 'multiple' },
]

type SearchParams = Promise<{ room?: string; style?: string }>

export default async function ProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const { room, style } = await searchParams
  const payload = await getPayloadClient()

  const ranges = await payload.find({ collection: 'ranges', limit: 100, sort: 'order' })

  const activeRange = style ? ranges.docs.find((item) => item.slug === style) : undefined

  const projects = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 100,
    sort: '-publishedAt',
    where: {
      ...(room ? { roomType: { equals: room } } : {}),
      ...(activeRange ? { styles: { in: [activeRange.id] } } : {}),
    },
  })

  // Building filter links that preserve whichever other filter is active.
  const withParams = (next: { room?: string; style?: string }) => {
    const params = new URLSearchParams()
    const nextRoom = 'room' in next ? next.room : room
    const nextStyle = 'style' in next ? next.style : style
    if (nextRoom) params.set('room', nextRoom)
    if (nextStyle) params.set('style', nextStyle)
    const query = params.toString()
    return query ? `/projects?${query}` : '/projects'
  }

  return (
    <>
      <PageHero
        eyebrow="Our work"
        image={projects.docs[0]?.heroImage}
        intro="Every project starts with a conversation about how you actually live. These are the finished rooms."
        title="Projects"
      />

      <section className="py-16 lg:py-24">
        <Container width="wide">
          {/* Filters. Plain links, so they work without JavaScript and are
              crawlable as distinct URLs. Grouped and labelled for screen
              readers, which also gives tests a stable handle. */}
          <div
            aria-label="Filter by room"
            className="flex flex-wrap items-center gap-x-3 gap-y-3 border-b border-hairline pb-8"
            role="group"
          >
            <span className="eyebrow mr-2">Room</span>
            {roomFilters.map((filter) => {
              const active = (room ?? '') === filter.value
              return (
                <Link
                  aria-current={active}
                  className={[
                    'border px-4 py-2 text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors',
                    active
                      ? 'border-ink bg-ink text-bone'
                      : 'border-hairline text-ink-muted hover:border-ink hover:text-ink',
                  ].join(' ')}
                  href={withParams({ room: filter.value })}
                  key={filter.value || 'all'}
                >
                  {filter.label}
                </Link>
              )
            })}
          </div>

          {ranges.docs.length > 0 ? (
            <div
              aria-label="Filter by style"
              className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-3"
              role="group"
            >
              <span className="eyebrow mr-2">Style</span>
              <Link
                aria-current={!style}
                className={[
                  'border px-4 py-2 text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors',
                  !style
                    ? 'border-ink bg-ink text-bone'
                    : 'border-hairline text-ink-muted hover:border-ink hover:text-ink',
                ].join(' ')}
                href={withParams({ style: '' })}
              >
                All styles
              </Link>
              {ranges.docs.map((range) => {
                const active = style === range.slug
                return (
                  <Link
                    aria-current={active}
                    className={[
                      'border px-4 py-2 text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors',
                      active
                        ? 'border-ink bg-ink text-bone'
                        : 'border-hairline text-ink-muted hover:border-ink hover:text-ink',
                    ].join(' ')}
                    href={withParams({ style: range.slug ?? '' })}
                    key={range.id}
                  >
                    {range.title}
                  </Link>
                )
              })}
            </div>
          ) : null}

          <p className="mt-8 text-sm text-ink-faint">
            {projects.totalDocs} {projects.totalDocs === 1 ? 'project' : 'projects'}
            {activeRange ? ` in ${activeRange.title}` : ''}
          </p>

          {projects.docs.length === 0 ? (
            <p className="mt-16 text-ink-muted">
              Nothing matches that combination yet.{' '}
              <Link className="text-brass underline" href="/projects">
                Show everything
              </Link>
              .
            </p>
          ) : (
            <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {projects.docs.map((project, index) => (
                <Reveal key={project.id} delay={(index % 3) * 60}>
                  <ProjectCard
                    project={project as Project}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
