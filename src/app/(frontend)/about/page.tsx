import type { Metadata } from 'next'
import React from 'react'

import { StandalonePage, standaloneMetadata } from '@/components/templates/StandalonePage'

export const generateMetadata = (): Promise<Metadata> => standaloneMetadata('about')

export default function AboutRoute() {
  return <StandalonePage eyebrow="About us" slug="about" />
}
