import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { Container } from '@/components/Container'
import { CtaBand } from '@/components/sections/CtaBand'
import { JsonLd } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { ProjectCard } from '@/components/ProjectCard'
import { Reveal } from '@/components/Reveal'
import { RichText } from '@/components/RichText'
import { getPayloadClient } from '@/lib/payload'
import { populated } from '@/lib/relationships'
import { breadcrumbSchema, serviceSchema } from '@/lib/schema'
import type { Project } from '@/payload-types'

type Params = Promise<{ area: string }>

const siteURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const findArea = async (slug: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'service-areas',
    depth: 2,
    limit: 1,
    where: { slug: { equals: slug } },
  })

  return result.docs[0]
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { area } = await params
  const doc = await findArea(area)
  if (!doc) return {}

  return {
    description: doc.meta?.description ?? doc.intro,
    title: doc.meta?.title ?? `Kitchens, bedrooms and bathrooms in ${doc.name}`,
  }
}

export default async function AreaPage({ params }: { params: Params }) {
  const { area } = await params
  const doc = await findArea(area)
  if (!doc) notFound()

  const featured = populated<Project>(doc.featuredProjects)

  // Fall back to recent projects if the editor has not picked any for this area.
  const payload = await getPayloadClient()
  const fallback = featured.length
    ? null
    : await payload.find({ collection: 'projects', depth: 1, limit: 3, sort: '-publishedAt' })

  const projects = featured.length ? featured : ((fallback?.docs ?? []) as Project[])

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: 'Home', url: '/' },
            { name: 'Areas', url: '/areas' },
            { name: doc.name, url: `/areas/${doc.slug}` },
          ],
          siteURL,
        )}
      />
      <JsonLd
        data={serviceSchema({
          areaServed: doc.name,
          description: doc.intro,
          name: `Kitchen, bedroom and bathroom design in ${doc.name}`,
          url: `${siteURL}/areas/${doc.slug}`,
        })}
      />

      <PageHero
        eyebrow="Areas we cover"
        image={doc.heroImage}
        intro={doc.intro}
        title={`Kitchens, bedrooms and bathrooms in ${doc.name}`}
      />

      <section className="py-20 lg:py-28">
        <Container width="narrow">
          <Reveal>
            <RichText data={doc.body} />
          </Reveal>
        </Container>
      </section>

      {projects.length > 0 ? (
        <section className="border-t border-hairline py-20 lg:py-28">
          <Container width="wide">
            <Reveal>
              <p className="eyebrow">Local work</p>
              <h2 className="mt-4 font-display text-display-3">
                Projects near {doc.name}
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <Reveal key={project.id} delay={index * 70}>
                  <ProjectCard
                    aspect="landscape"
                    project={project}
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <CtaBand
        body={`Tell us what you have in mind and we will arrange a visit in ${doc.name}.`}
        heading={`Planning a project in ${doc.name}?`}
        href="/book-an-appointment"
        image={doc.heroImage}
        label="Book a design visit"
      />
    </>
  )
}
