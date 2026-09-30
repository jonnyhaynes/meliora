import React from 'react'

import { Container } from '@/components/Container'
import { CtaLink } from '@/components/CtaLink'
import { MediaImage } from '@/components/MediaImage'
import { Parallax } from '@/components/Parallax'
import { Reveal } from '@/components/Reveal'
import { RichText } from '@/components/RichText'
import { BrandStrip } from '@/components/sections/BrandStrip'
import { CtaBand } from '@/components/sections/CtaBand'
import { FeaturedProjects } from '@/components/sections/FeaturedProjects'
import { GoogleReviewsSection } from '@/components/sections/GoogleReviewsSection'
import { Hero } from '@/components/sections/Hero'
import { RangesStrip } from '@/components/sections/RangesStrip'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { getGoogleReviews } from '@/lib/google-reviews'
import { getPayloadClient } from '@/lib/payload'
import { populated } from '@/lib/relationships'
import type { Brand, Project, Range, Testimonial } from '@/payload-types'

export default async function HomePage() {
  const payload = await getPayloadClient()

  const [homepage, googleReviews] = await Promise.all([
    payload.findGlobal({ slug: 'homepage', depth: 2 }),
    getGoogleReviews(),
  ])

  const projects = populated<Project>(homepage.featuredProjects)
  const ranges = populated<Range>(homepage.featuredRanges)
  const testimonials = populated<Testimonial>(homepage.testimonials)
  const brands = populated<Brand>(homepage.brands)

  return (
    <>
      <Hero slides={homepage.heroSlides ?? []} />

      {/* Introduction — asymmetric split, copy left, portrait image right */}
      <section className="py-24 lg:py-32">
        <Container width="wide">
          <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow">About Meliora</p>
              <h2 className="mt-4 font-display text-display-2">{homepage.introHeading}</h2>
              <RichText className="mt-6" data={homepage.introBody} />
              <CtaLink className="group mt-9" href="/about" variant="text">
                Our story
              </CtaLink>
            </Reveal>

            {homepage.introImage ? (
              <Reveal className="lg:col-span-6 lg:col-start-7" delay={120}>
                {/* Gentler than the full-bleed sections: this sits beside text,
                    so it wants depth rather than travel. */}
                <Parallax amount={0.055} className="relative aspect-[4/5] bg-bone-deep">
                  <MediaImage
                    fill
                    media={homepage.introImage}
                    size="card"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </Parallax>
              </Reveal>
            ) : null}
          </div>
        </Container>
      </section>

      <FeaturedProjects
        intro="Each of these is a real home, designed around a specific brief. The photographs are the finished rooms."
        projects={projects}
      />

      <RangesStrip ranges={ranges} />

      {/*
        Live Google reviews when the Places API is configured, falling back to
        testimonials an editor has entered by hand. Something credible always
        renders, even if Google is unreachable.
      */}
      {googleReviews ? (
        <GoogleReviewsSection data={googleReviews} />
      ) : (
        <TestimonialsSection testimonials={testimonials} />
      )}

      <div className="pt-24 lg:pt-32">
        <BrandStrip brands={brands} />
      </div>

      <CtaBand
        body={homepage.ctaBody}
        heading={homepage.ctaHeading}
        href={homepage.ctaHref}
        image={homepage.introImage}
        label={homepage.ctaLabel}
      />
    </>
  )
}
