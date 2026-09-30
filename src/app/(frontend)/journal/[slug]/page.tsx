import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { Container } from '@/components/Container'
import { JsonLd } from '@/components/JsonLd'
import { MediaImage } from '@/components/MediaImage'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { RichText } from '@/components/RichText'
import { getPayloadClient } from '@/lib/payload'
import { blogPostingSchema, breadcrumbSchema } from '@/lib/schema'

export const revalidate = 3600

const siteURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const categoryLabels: Record<string, string> = {
  advice: 'Advice',
  'behind-the-scenes': 'Behind the scenes',
  inspiration: 'Inspiration',
  'project-spotlight': 'Project spotlight',
}

type Params = Promise<{ slug: string }>

const findPost = async (slug: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    depth: 2,
    limit: 1,
    where: { slug: { equals: slug } },
  })

  return result.docs[0]
}

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const post = await findPost(slug)
  if (!post) return {}

  return {
    description: post.meta?.description ?? post.excerpt,
    openGraph: {
      publishedTime: post.publishedAt ?? undefined,
      type: 'article',
    },
    title: post.meta?.title ?? post.title,
  }
}

export default async function JournalPostPage({ params }: { params: Params }) {
  const { slug } = await params
  const post = await findPost(slug)
  if (!post) notFound()

  const payload = await getPayloadClient()
  const others = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 3,
    sort: '-publishedAt',
    where: { id: { not_equals: post.id } },
  })

  const settings = await payload.findGlobal({ slug: 'site-settings' })

  const published = formatDate(post.publishedAt)

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: 'Home', url: '/' },
            { name: 'Journal', url: '/journal' },
            { name: post.title, url: `/journal/${post.slug}` },
          ],
          siteURL,
        )}
      />
      <JsonLd
        data={blogPostingSchema({
          authorName: settings.businessName,
          datePublished: post.publishedAt,
          description: post.excerpt,
          image: (post.heroImage as { url?: string } | null)?.url ?? null,
          title: post.title,
          url: `${siteURL}/journal/${post.slug}`,
        })}
      />

      <PageHero
        eyebrow={categoryLabels[post.category ?? ''] ?? 'Journal'}
        image={post.heroImage}
        title={post.title}
      >
        {published ? (
          <p className="text-sm text-white/60">
            <time dateTime={post.publishedAt ?? undefined}>{published}</time>
          </p>
        ) : null}
      </PageHero>

      <section className="py-20 lg:py-28">
        <Container width="narrow">
          <Reveal>
            <p className="font-display text-2xl leading-snug text-ink">{post.excerpt}</p>
            <div className="mt-10">
              <RichText data={post.body} />
            </div>
          </Reveal>

          <Reveal className="mt-16 border-t border-hairline pt-10" delay={80}>
            <p className="text-base text-ink-muted">
              Thinking about a project of your own?{' '}
              <Link className="text-brass underline underline-offset-4" href="/book-an-appointment">
                Book a showroom visit
              </Link>{' '}
              or{' '}
              <Link className="text-brass underline underline-offset-4" href="/contact">
                send us a message
              </Link>
              .
            </p>
          </Reveal>
        </Container>
      </section>

      {others.docs.length > 0 ? (
        <section className="border-t border-hairline py-20 lg:py-28">
          <Container width="wide">
            <Reveal>
              <h2 className="font-display text-display-3">More from the journal</h2>
            </Reveal>

            <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {others.docs.map((item, index) => (
                <Reveal key={item.id} delay={index * 70}>
                  <Link className="group block" href={`/journal/${item.slug}`}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-bone-deep">
                      <MediaImage
                        className="transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                        fill
                        media={item.heroImage}
                        size="wide"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                    <h3 className="mt-4 font-display text-xl leading-snug transition-colors group-hover:text-brass">
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
