import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { Container } from '@/components/Container'
import { MediaImage } from '@/components/MediaImage'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  description:
    'Advice, inspiration and behind-the-scenes notes from a kitchen, bedroom and bathroom studio in Bawtry.',
  title: 'Journal',
}

const categoryLabels: Record<string, string> = {
  advice: 'Advice',
  'behind-the-scenes': 'Behind the scenes',
  inspiration: 'Inspiration',
  'project-spotlight': 'Project spotlight',
}

export default async function JournalIndexPage() {
  const payload = await getPayloadClient()
  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 100,
    sort: '-publishedAt',
  })

  const [lead, ...rest] = posts.docs

  return (
    <>
      <PageHero
        eyebrow="Journal"
        image={lead?.heroImage}
        intro="Practical advice and a look behind the scenes, written by the people who do the work."
        title="Journal"
      />

      <section className="py-20 lg:py-28">
        <Container width="wide">
          {posts.docs.length === 0 ? (
            <p className="text-ink-muted">Nothing published yet.</p>
          ) : null}

          {/* Lead article, given more room than the rest. */}
          {lead ? (
            <Reveal>
              <Link className="group grid gap-8 lg:grid-cols-2 lg:gap-14" href={`/journal/${lead.slug}`}>
                <div className="relative aspect-[4/3] overflow-hidden bg-bone-deep">
                  <MediaImage
                    className="transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    fill
                    media={lead.heroImage}
                    priority
                    size="wide"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="eyebrow">
                    {categoryLabels[lead.category ?? ''] ?? 'Journal'}
                  </p>
                  <h2 className="mt-4 font-display text-display-2 transition-colors group-hover:text-brass">
                    {lead.title}
                  </h2>
                  <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted">
                    {lead.excerpt}
                  </p>
                  <span className="mt-7 inline-flex items-center gap-3 text-[0.75rem] font-medium tracking-[0.12em] text-ink uppercase">
                    Read it
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ) : null}

          {rest.length > 0 ? (
            <div className="mt-20 grid gap-x-8 gap-y-14 border-t border-hairline pt-16 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post, index) => (
                <Reveal key={post.id} delay={(index % 3) * 60}>
                  <Link className="group block" href={`/journal/${post.slug}`}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-bone-deep">
                      <MediaImage
                        className="transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                        fill
                        media={post.heroImage}
                        size="wide"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                    <p className="eyebrow mt-5">{categoryLabels[post.category ?? ''] ?? 'Journal'}</p>
                    <h3 className="mt-3 font-display text-xl leading-snug transition-colors group-hover:text-brass">
                      {post.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted">{post.excerpt}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : null}
        </Container>
      </section>
    </>
  )
}
