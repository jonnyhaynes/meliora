import React from 'react'

import { Container } from '@/components/Container'
import { Reveal } from '@/components/Reveal'
import type { GoogleReviews } from '@/lib/google-reviews'

/**
 * Live Google reviews. Google's terms require that reviews shown elsewhere are
 * attributed and link back to Google, hence the author links and the "Read on
 * Google" link.
 */
export const GoogleReviewsSection = ({ data }: { data: GoogleReviews }) => (
  <section className="border-y border-hairline bg-bone-deep py-24 lg:py-32">
    <Container width="wide">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Reviews</p>
            <h2 className="mt-4 font-display text-display-2">
              {data.rating.toFixed(1)} out of 5 on Google
            </h2>
            <p className="mt-3 text-sm text-ink-muted">
              From {data.total} {data.total === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {data.mapsUrl ? (
            <a
              className="text-[0.75rem] font-medium tracking-[0.12em] text-ink uppercase underline decoration-hairline underline-offset-[6px] transition-colors hover:text-brass"
              href={data.mapsUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Read on Google →
            </a>
          ) : null}
        </div>
      </Reveal>

      <div className="mt-12 grid gap-x-12 gap-y-12 lg:grid-cols-3">
        {data.reviews.slice(0, 3).map((review, index) => (
          <Reveal key={review.id} delay={index * 80}>
            <figure className="flex h-full flex-col">
              <div
                aria-label={`${review.rating} out of 5`}
                className="mb-5 flex gap-1"
              >
                {Array.from({ length: 5 }).map((_, star) => (
                  <span
                    aria-hidden="true"
                    className={star < review.rating ? 'text-brass' : 'text-hairline'}
                    key={star}
                  >
                    ★
                  </span>
                ))}
              </div>

              <blockquote className="font-display text-xl leading-snug text-ink">
                “{review.text}”
              </blockquote>

              <figcaption className="mt-auto pt-6 text-sm">
                {review.authorUrl ? (
                  <a
                    className="text-ink underline decoration-hairline underline-offset-4 transition-colors hover:text-brass"
                    href={review.authorUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {review.author}
                  </a>
                ) : (
                  <span className="text-ink">{review.author}</span>
                )}
                {review.relativeTime ? (
                  <span className="mt-1 block text-xs text-ink-faint">{review.relativeTime}</span>
                ) : null}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Container>
  </section>
)
