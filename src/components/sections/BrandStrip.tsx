import React from 'react'

import { Container } from '@/components/Container'
import type { Brand } from '@/payload-types'

/**
 * Trust strip. Renders logos when they exist and plain names when they do not,
 * which is the honest state of things until the brand assets are supplied.
 */
export const BrandStrip = ({ brands }: { brands: Brand[] }) => {
  if (brands.length === 0) return null

  return (
    <section className="border-y border-hairline py-14">
      <Container width="wide">
        <p className="eyebrow text-center">Appliances and materials we work with</p>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {brands.map((brand) => (
            <li key={brand.id}>
              <span className="text-sm font-medium tracking-[0.14em] text-ink-faint uppercase">
                {brand.name}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
