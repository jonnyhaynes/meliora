import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { Container } from '@/components/Container'
import { YorkshireRose } from '@/components/YorkshireRose'
import { mediaDimensions, mediaUrl } from '@/lib/media'
import type { Navigation, SiteSetting } from '@/payload-types'

type FooterProps = {
  navigation: Navigation
  settings: SiteSetting
}

export const Footer = ({ navigation, settings }: FooterProps) => {
  const { address, email, openingHours, phone, socials, tagline } = settings
  const columns = navigation.footerColumns ?? []

  const logoUrl = mediaUrl(settings.logo)
  const logoDimensions = mediaDimensions(settings.logo)

  const socialLinks = [
    { href: socials?.instagram, label: 'Instagram' },
    { href: socials?.facebook, label: 'Facebook' },
    { href: settings.mapUrl, label: 'Google' },
  ].filter((link): link is { href: string; label: string } => Boolean(link.href))

  return (
    <footer className="mt-24 border-t border-hairline bg-bone-deep lg:mt-32">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            {logoUrl && logoDimensions ? (
              <Image
                alt={settings.businessName}
                className="h-9 w-auto"
                height={logoDimensions.height}
                src={logoUrl}
                width={logoDimensions.width}
              />
            ) : (
              <p className="font-display text-3xl leading-none">Meliora</p>
            )}
            <p className="eyebrow mt-4">Kitchens · Bedrooms · Bathrooms</p>
            {tagline ? (
              <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-muted">{tagline}</p>
            ) : null}
          </div>

          {columns.map((column) => (
            <div className="lg:col-span-2" key={column.id ?? column.title}>
              <p className="eyebrow">{column.title}</p>
              <ul className="mt-5 space-y-2.5">
                {(column.links ?? []).map((link) => (
                  <li key={link.id ?? link.url}>
                    <Link
                      className="text-sm text-ink-muted transition-colors hover:text-ink"
                      href={link.url}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-2">
            <p className="eyebrow">Find us</p>
            <address className="mt-5 space-y-1 text-sm leading-relaxed text-ink-muted not-italic">
              {address?.street ? <p>{address.street}</p> : null}
              {address?.town ? <p>{address.town}</p> : null}
              {address?.county ? <p>{address.county}</p> : null}
              {address?.postcode ? <p>{address.postcode}</p> : null}
            </address>
            <div className="mt-5 space-y-2.5 text-sm">
              <a
                className="block text-ink-muted transition-colors hover:text-ink"
                href={`tel:${phone.replace(/\s/g, '')}`}
              >
                {phone}
              </a>
              <a
                className="block text-ink-muted transition-colors hover:text-ink"
                href={`mailto:${email}`}
              >
                {email}
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="eyebrow">Opening hours</p>
            <dl className="mt-5 space-y-2 text-sm text-ink-muted">
              {(openingHours ?? []).map((row) => (
                <div key={row.id ?? row.days}>
                  <dt className="text-ink">{row.days}</dt>
                  <dd>{row.hours}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-8 border-t border-hairline pt-8 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div>
            <p className="text-xs text-ink-faint">
              © {new Date().getFullYear()} Meliora KBB Ltd t/a Meliora Kitchens, Bedrooms &
              Bathrooms.
            </p>

            {/* House credit, sitting under the copyright rather than centred. The
                rose goes between the two halves of the line, which is how it
                reads on the other Colouring Code sites. */}
            <p className="mt-4 flex items-center text-xs text-ink-faint">
              Forged in Yorkshire
              <YorkshireRose className="mx-1 inline-block h-4 w-4 -translate-y-px align-middle" />
              by{' '}
              <a
                className="text-ink-muted underline decoration-hairline underline-offset-4 transition-colors hover:text-brass"
                href="https://www.colouringcode.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                Colouring Code
              </a>
            </p>
          </div>

          <ul className="flex gap-6">
            {socialLinks.map((link) => (
              <li key={link.label}>
                <a
                  className="text-xs tracking-[0.08em] text-ink-muted uppercase transition-colors hover:text-ink"
                  href={link.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  )
}
