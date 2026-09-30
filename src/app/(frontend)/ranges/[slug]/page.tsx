import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { Container } from '@/components/Container'
import { Gallery } from '@/components/Gallery'
import { PageHero } from '@/components/PageHero'
import { ProjectCard } from '@/components/ProjectCard'
import { Reveal } from '@/components/Reveal'
import { getPayloadClient } from '@/lib/payload'
import type { Project } from '@/payload-types'

type Params = Promise<{ slug: string }>

const findRange = async (slug: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'ranges',
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
  })

  return result.docs[0]
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const range = await findRange(slug)
  if (!range) return {}

  return {
    description: range.meta?.description ?? range.description,
    title: range.meta?.title ?? range.title,
  }
}

export default async function RangePage({ params }: { params: Params }) {
  const { slug } = await params
  const range = await findRange(slug)
  if (!range) notFound()

  const payload = await getPayloadClient()
  const projects = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 3,
    sort: '-publishedAt',
    where: { styles: { in: [range.id] } },
  })

  const gallery = range.gallery ?? []

  return (
    <>
      <PageHero
        eyebrow="Range"
        image={range.heroImage}
        intro={range.description}
        title={range.title}
      />

      {gallery.length > 0 ? (
        <section className="py-20 lg:py-28">
          <Container width="wide">
            <Reveal>
              <Gallery items={gallery} />
            </Reveal>
          </Container>
        </section>
      ) : null}

      {projects.docs.length > 0 ? (
        <section className="border-t border-hairline py-20 lg:py-28">
          <Container width="wide">
            <Reveal>
              <p className="eyebrow">Projects in this range</p>
              <h2 className="mt-4 font-display text-display-3">
                {range.title} kitchens we have built
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {projects.docs.map((project, index) => (
                <Reveal key={project.id} delay={index * 70}>
                  <ProjectCard
                    aspect="landscape"
                    project={project as Project}
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="border-t border-hairline py-20">
        <Container width="wide">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <p className="font-display text-2xl">See this range in the showroom</p>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <Link
                className="text-[0.75rem] font-medium tracking-[0.12em] text-ink uppercase transition-colors hover:text-brass"
                href="/ranges"
              >
                All ranges →
              </Link>
              <Link
                className="text-[0.75rem] font-medium tracking-[0.12em] text-ink uppercase transition-colors hover:text-brass"
                href="/book-an-appointment"
              >
                Book a visit →
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
