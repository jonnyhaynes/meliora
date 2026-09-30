import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { Container } from '@/components/Container'
import { Gallery } from '@/components/Gallery'
import { MediaImage } from '@/components/MediaImage'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { RichText } from '@/components/RichText'
import { getPayloadClient } from '@/lib/payload'

export const standaloneMetadata = async (slug: string): Promise<Metadata> => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    limit: 1,
    where: { slug: { equals: slug } },
  })

  const page = result.docs[0]
  if (!page) return {}

  return {
    description: page.meta?.description ?? page.intro ?? undefined,
    title: page.meta?.title ?? page.title,
  }
}

type StandalonePageProps = {
  slug: string
  /** Small label above the page title. Defaults to a sensible generic. */
  eyebrow?: string
  /** Extra content rendered before the gallery — used by the showroom page. */
  extra?: React.ReactNode
}

/**
 * Renders a document from the `pages` collection. Copy lives in the CMS, so the
 * About and Showroom pages can be rewritten without a deploy.
 */
export const StandalonePage = async ({ slug, eyebrow, extra }: StandalonePageProps) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'pages',
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
  })

  const page = result.docs[0]
  if (!page) notFound()

  const sections = page.sections ?? []
  const gallery = page.gallery ?? []

  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        image={page.heroImage}
        intro={page.intro}
        title={page.title}
      />

      {page.body ? (
        <section className="py-20 lg:py-28">
          <Container width="narrow">
            <Reveal>
              <RichText data={page.body} />
            </Reveal>
          </Container>
        </section>
      ) : null}

      {sections.length > 0 ? (
        <section className="pb-20 lg:pb-28">
          <Container width="wide">
            <div className="space-y-20 lg:space-y-28">
              {sections.map((section, index) => {
                const flipped = index % 2 === 1

                return (
                  <Reveal key={section.id ?? section.heading}>
                    <article className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
                      <div className={`lg:col-span-7 ${flipped ? 'lg:order-2' : ''}`}>
                        {section.image ? (
                          <div className="relative aspect-[4/3] overflow-hidden bg-bone-deep">
                            <MediaImage
                              fill
                              media={section.image}
                              size="wide"
                              sizes="(max-width: 1024px) 100vw, 58vw"
                            />
                          </div>
                        ) : null}
                      </div>
                      <div
                        className={`lg:col-span-4 ${
                          flipped ? 'lg:order-1 lg:col-start-2' : 'lg:col-start-9'
                        }`}
                      >
                        <h2 className="font-display text-display-3">{section.heading}</h2>
                        <p className="mt-5 text-base leading-relaxed text-ink-muted">
                          {section.body}
                        </p>
                      </div>
                    </article>
                  </Reveal>
                )
              })}
            </div>
          </Container>
        </section>
      ) : null}

      {extra}

      {gallery.length > 0 ? (
        <section className="pb-20 lg:pb-28">
          <Container width="wide">
            <Reveal>
              <Gallery items={gallery} />
            </Reveal>
          </Container>
        </section>
      ) : null}
    </>
  )
}
