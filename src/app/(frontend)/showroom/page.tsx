import type { Metadata } from 'next'
import React from 'react'

import { ShowroomDetails } from '@/components/sections/ShowroomDetails'
import { StandalonePage, standaloneMetadata } from '@/components/templates/StandalonePage'

export const generateMetadata = (): Promise<Metadata> => standaloneMetadata('showroom')

export default function ShowroomRoute() {
  return (
    <>
      <StandalonePage eyebrow="Visit us" extra={<ShowroomDetails />} slug="showroom" />
    </>
  )
}
