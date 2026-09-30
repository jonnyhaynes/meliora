import type { Metadata } from 'next'
import React from 'react'

import { ServicePage, serviceMetadata } from '@/components/templates/ServicePage'

export const generateMetadata = (): Promise<Metadata> => serviceMetadata('design')

export default function DesignRoute() {
  return <ServicePage slug="design" />
}
