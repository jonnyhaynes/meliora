import React from 'react'

import { Container } from '@/components/Container'
import { Reveal } from '@/components/Reveal'
import type { Testimonial } from '@/payload-types'

export const TestimonialsSection = ({ testimonials }: { testimonials: Testimonial[] }) => {
  if (testimonials.length === 0) return null

  return (
    <section className="border-y border-hairline bg-bone-deep py-24 lg:py-32">
      <Container width="wide">
        <Reveal>
          <p className="eyebrow">What clients say</p>
        </Reveal>

        <div className="mt-12 grid gap-x-12 gap-y-12 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.id} delay={index * 80}>
              <figure className="flex h-full flex-col">
                {testimonial.rating ? (
                  <div aria-label={`${testimonial.rating} out of 5`} className="mb-6 flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, star) => (
                      <span aria-hidden="true" className="text-sm text-brass" key={star}>
                        ★
                      </span>
                    ))}
                  </div>
                ) : null}

                <blockquote className="font-display text-xl leading-snug text-ink lg:text-[1.375rem]">
                  “{testimonial.quote}”
                </blockquote>

                <figcaption className="mt-auto pt-6">
                  <p className="text-sm text-ink">{testimonial.author}</p>
                  {testimonial.location ? (
                    <p className="eyebrow mt-1">{testimonial.location}</p>
                  ) : null}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
