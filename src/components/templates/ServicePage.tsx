import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { Container } from '@/components/Container'
import { CtaBand } from '@/components/sections/CtaBand'
import { Gallery } from '@/components/Gallery'
import { PageHero } from '@/components/PageHero'
import { ProjectCard } from '@/components/ProjectCard'
import { Reveal } from '@/components/Reveal'
import { RichText } from '@/components/RichText'
import { getPayloadClient } from '@/lib/payload'
import type { Project } from '@/payload-types'

/** Which project room type each service page should pull its examples from. */
const relatedRoomTypes: Record<string, string> = {
  bathrooms: 'bathroom',
  bedrooms: 'bedroom',
  kitchens: 'kitchen',
}

const serviceMetadata = async (slug: string): Promise<Metadata> => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'services',
    limit: 1,
    where: { slug: { equals: slug } },
  })

  const service = result.docs[0]
  if (!service) return {}

  return {
    description: service.meta?.description ?? service.intro,
    title: service.meta?.title ?? service.title,
  }
}

/**
 * Shared template for the four service pages (Kitchens, Bedrooms, Bathrooms and
 * the Design service). They only differ by slug and by which projects they show.
 */
const ServicePage = async ({ slug }: { slug: string }) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'services',
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
  })

  const service = result.docs[0]
  if (!service) notFound()

  const roomType = relatedRoomTypes[slug]

  const projects = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 3,
    sort: '-publishedAt',
    where: roomType ? { roomType: { equals: roomType } } : {},
  })

  const gallery = service.gallery ?? []
  const steps = service.processSteps ?? []

  return (
    <>
      <PageHero
        eyebrow="What we do"
        image={service.heroImage}
        intro={service.intro}
        title={service.title}
      />

      <section className="py-20 lg:py-28">
        <Container width="wide">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-6">
              <RichText data={service.body} />
            </Reveal>

            {steps.length > 0 ? (
              <div className="lg:col-span-5 lg:col-start-8">
                <Reveal delay={80}>
                  <p className="eyebrow">How we work</p>
                  <ol className="mt-6 border-t border-hairline">
                    {steps.map((step, index) => (
                      <li className="border-b border-hairline py-6" key={step.id ?? step.title}>
                        <div className="flex gap-5">
                          <span className="font-display text-sm text-brass">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <h3 className="font-display text-xl text-ink">{step.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Reveal>
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      {gallery.length > 0 ? (
        <section className="pb-20 lg:pb-28">
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
              <p className="eyebrow">Recent work</p>
              <h2 className="mt-4 font-display text-display-3">
                {service.title} we have designed
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

      <CtaBand
        body="Tell us roughly what you have in mind and we will come to you, measure up and talk it through."
        heading={`Start planning your ${service.title.toLowerCase()}`}
        href="/book-an-appointment"
        image={service.heroImage as never}
        label="Book a design visit"
      />
    </>
  )
}

export { ServicePage, serviceMetadata }
