import type { Metadata } from 'next'
import React from 'react'

import { ServicePage, serviceMetadata } from '@/components/templates/ServicePage'

export const generateMetadata = (): Promise<Metadata> => serviceMetadata('bathrooms')

export default function BathroomsRoute() {
  return <ServicePage slug="bathrooms" />
}
