import type { Metadata } from 'next'
import React from 'react'

import { ServicePage, serviceMetadata } from '@/components/templates/ServicePage'

export const generateMetadata = (): Promise<Metadata> => serviceMetadata('bedrooms')

export default function BedroomsRoute() {
  return <ServicePage slug="bedrooms" />
}
