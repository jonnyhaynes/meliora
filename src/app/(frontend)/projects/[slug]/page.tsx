import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { Container } from '@/components/Container'
import { Gallery } from '@/components/Gallery'
import { JsonLd } from '@/components/JsonLd'
import { MediaImage } from '@/components/MediaImage'
import { Parallax } from '@/components/Parallax'
import { Reveal } from '@/components/Reveal'
import { RichText } from '@/components/RichText'
import { getPayloadClient } from '@/lib/payload'
import { populated, populatedOne } from '@/lib/relationships'
import { breadcrumbSchema } from '@/lib/schema'
import type { Brand, Range, Testimonial } from '@/payload-types'

export const revalidate = 3600

const siteURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const roomLabels: Record<string, string> = {
  kitchen: 'Kitchen',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  multiple: 'Whole home',
}

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'projects',
    limit: 1,
    where: { slug: { equals: slug } },
  })

  const project = result.docs[0]
  if (!project) return {}

  const meta = project.meta

  return {
    description: meta?.description ?? project.summary,
    openGraph: meta?.image ? { images: [{ url: (meta.image as { url?: string }).url ?? '' }] } : undefined,
    title: meta?.title ?? `${project.title} — ${project.location}`,
  }
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'projects',
    depth: 2,
    limit: 1,
    where: { slug: { equals: slug } },
  })

  const project = result.docs[0]
  if (!project) notFound()

  const styles = populated<Range>(project.styles)
  const brands = populated<Brand>(project.appliances)
  const testimonial = populatedOne<Testimonial>(project.testimonial)

  // Neighbours for the "more projects" strip.
  const siblings = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 3,
    sort: '-publishedAt',
    where: { id: { not_equals: project.id } },
  })

  const gallery = project.gallery ?? []

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: 'Home', url: '/' },
            { name: 'Projects', url: '/projects' },
            { name: project.title, url: `/projects/${project.slug}` },
          ],
          siteURL,
        )}
      />

      {/* Hero */}
      <section className="relative isolate flex min-h-[70svh] items-end overflow-hidden bg-ink">
        <Parallax amount={0.09} className="absolute inset-0">
          <MediaImage className="opacity-85" fill media={project.heroImage} priority size="hero" sizes="100vw" />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/40" />

        <Container className="relative py-16 lg:py-20" width="wide">
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              className="text-[0.6875rem] tracking-[0.12em] text-white/60 uppercase transition-colors hover:text-white"
              href="/projects"
            >
              ← All projects
            </Link>
          </nav>
          <p className="eyebrow text-white/65">
            {roomLabels[project.roomType] ?? project.roomType} · {project.location}
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-display-1 text-white">{project.title}</h1>
        </Container>
      </section>

      {/* Summary, narrative and specification */}
      <section className="py-20 lg:py-28">
        <Container width="wide">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Reveal>
                <p className="font-display text-2xl leading-snug text-ink lg:text-3xl">
                  {project.summary}
                </p>
              </Reveal>
              <Reveal className="mt-10" delay={80}>
                <RichText data={project.narrative} />
              </Reveal>

              {styles.length > 0 ? (
                <Reveal className="mt-12" delay={120}>
                  <p className="eyebrow">Ranges used</p>
                  <ul className="mt-4 flex flex-wrap gap-3">
                    {styles.map((range) => (
                      <li key={range.id}>
                        <Link
                          className="border border-hairline px-4 py-2 text-[0.6875rem] font-medium tracking-[0.1em] text-ink-muted uppercase transition-colors hover:border-ink hover:text-ink"
                          href={`/ranges/${range.slug}`}
                        >
                          {range.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}
            </div>

            <aside className="lg:col-span-4 lg:col-start-9">
              {(project.specs ?? []).length > 0 ? (
                <Reveal delay={100}>
                  <p className="eyebrow">Specification</p>
                  <dl className="mt-5 border-t border-hairline">
                    {(project.specs ?? []).map((spec) => (
                      <div
                        className="flex justify-between gap-6 border-b border-hairline py-3.5"
                        key={spec.id ?? spec.label}
                      >
                        <dt className="text-sm text-ink-muted">{spec.label}</dt>
                        <dd className="text-right text-sm text-ink">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </Reveal>
              ) : null}

              {brands.length > 0 ? (
                <Reveal className="mt-10" delay={140}>
                  <p className="eyebrow">Appliances and materials</p>
                  <ul className="mt-4 space-y-2">
                    {brands.map((brand) => (
                      <li className="text-sm text-ink-muted" key={brand.id}>
                        {brand.name}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}
            </aside>
          </div>
        </Container>
      </section>

      {/* Gallery */}
      {gallery.length > 0 ? (
        <section className="pb-20 lg:pb-28">
          <Container width="wide">
            <Reveal>
              <Gallery items={gallery} />
            </Reveal>
          </Container>
        </section>
      ) : null}

      {/* Client quote */}
      {testimonial ? (
        <section className="border-y border-hairline bg-bone-deep py-20">
          <Container width="narrow">
            <Reveal>
              <figure className="text-center">
                <blockquote className="font-display text-2xl leading-snug text-ink lg:text-display-3">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-6">
                  <p className="text-sm text-ink">{testimonial.author}</p>
                  {testimonial.location ? (
                    <p className="eyebrow mt-1">{testimonial.location}</p>
                  ) : null}
                </figcaption>
              </figure>
            </Reveal>
          </Container>
        </section>
      ) : null}

      {/* More projects */}
      {siblings.docs.length > 0 ? (
        <section className="py-20 lg:py-28">
          <Container width="wide">
            <Reveal>
              <div className="flex items-end justify-between gap-6">
                <h2 className="font-display text-display-3">More projects</h2>
                <Link
                  className="text-[0.75rem] font-medium tracking-[0.12em] text-ink uppercase transition-colors hover:text-brass"
                  href="/projects"
                >
                  View all →
                </Link>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {siblings.docs.map((item, index) => (
                <Reveal key={item.id} delay={index * 70}>
                  <Link className="group block" href={`/projects/${item.slug}`}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-bone-deep">
                      <MediaImage
                        className="transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                        fill
                        media={item.heroImage}
                        size="wide"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                    <p className="eyebrow mt-4">{item.location}</p>
                    <h3 className="mt-2 font-display text-xl transition-colors group-hover:text-brass">
                      {item.title}
                    </h3>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  )
}
