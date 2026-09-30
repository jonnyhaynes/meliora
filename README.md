# Meliora Kitchens, Bedrooms & Bathrooms — website

> ## ⚠️ This is a prototype, not a live website
>
> This repository is an **exploratory prototype / demonstration build**. It is **not** the live
> website of Meliora Kitchens, Bedrooms & Bathrooms, and it is **not affiliated with, commissioned
> by or endorsed by** Meliora KBB Ltd.
>
> **The work shown on the site is not Meliora's.** The projects, testimonials and written content
> are fabricated samples written to demonstrate the layout, and the photography is stock
> placeholder material used under the [Pexels licence](https://www.pexels.com/license/).
> Presenting another photographer's kitchens as Meliora's work would misrepresent the business,
> so this content **must** be replaced before any real deployment — see
> [docs/placeholder-manifest.md](./docs/placeholder-manifest.md).
>
> Nothing here is production-ready: the opening hours are unverified, the Google reviews
> integration is unwired, and no attempts have been made to secure permission from the business.
>
> Do not deploy this as Meliora's real website without their involvement and consent.

The website and content management system for Meliora, a husband-and-wife kitchen,
bedroom and bathroom studio in Bawtry, South Yorkshire.

Previously a placeholder Wix site. This is a photography-led marketing site with a
purpose-built CMS, so the owners can add projects and photographs themselves.

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| CMS | Payload 3 — admin panel, REST and GraphQL API, auth, uploads, live preview |
| Database | Postgres (Docker locally, Neon or similar in production) |
| Styling | Tailwind CSS v4, with design tokens in `src/app/(frontend)/styles.css` |
| Media | Local disk in development, Cloudflare R2 in production |
| Email | Nodemailer (ethereal.email in development, SMTP in production) |
| Tests | Playwright (end-to-end), Vitest (integration) |
| Hosting | Vercel — see [docs/deploy.md](./docs/deploy.md) |

Payload runs *inside* the Next.js app. There is no separate CMS server: the admin
panel, the API and the public site are one deployment.

---

## Getting started

Requires **Node 20.9+** (developed on 22.19) and **pnpm 9/10/11**.

```bash
pnpm install
cp .env.example .env          # then set PAYLOAD_SECRET
docker compose up -d postgres # dev database on port 55432
pnpm dev
```

The admin panel is at **http://localhost:3000/admin**. On first run you will be
asked to create the first user — make that one an **Admin**.

To load the sample content set (photography, projects, ranges, services, journal
and the business details):

```bash
pnpm seed
```

> **The seed loads placeholder photography and sample testimonials.** Read
> [docs/placeholder-manifest.md](./docs/placeholder-manifest.md) before this goes
> anywhere near production.

### Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `PAYLOAD_SECRET` | Signs sessions and tokens. `openssl rand -base64 32` |
| `NEXT_PUBLIC_SERVER_URL` | Canonical origin — used for absolute URLs, sitemap, emails |
| `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME` | Sender identity |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Omit in development to use ethereal.email |
| `ENQUIRY_NOTIFICATION_EMAIL` | Where enquiry and booking notifications are delivered |
| `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID` | Optional. Live Google reviews |
| `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_PUBLIC_URL` | Optional. Cloudflare R2 media storage |

Everything except the database and the secret is optional, and each feature
degrades gracefully when its variables are absent.

Note the dev database is on **55432**, not the default 5432 — there is usually
another Postgres already running on this machine.

---

## Project structure

```
src/
├─ app/
│  ├─ (frontend)/          Public site — routes, sitemap, styles
│  ├─ (payload)/           Payload's admin panel and API (generated — do not edit)
│  └─ api/                 Form submission endpoints
├─ collections/            One file per content type
├─ globals/                Site settings, homepage, navigation
├─ components/             UI, including sections/ and forms/
├─ fields/                 Reusable field definitions (slug, gallery)
├─ lib/                    Payload client, media helpers, SEO schema, validation
└─ seed/                   Sample content
```

`(payload)` and `(frontend)` are separate route groups so the public site and the
admin panel never share a layout. `robots.ts` deliberately lives at `src/app/`
rather than inside a route group — Next does not pick it up from a group.

---

## Content model

Everything the owners edit lives in one of these. The descriptions in the admin
panel are written for a non-technical editor.

**Content** — Projects (case studies), Ranges (styles to browse by), Services,
Pages (About, Showroom), Journal (Posts), Testimonials, Brands, Service areas.

**Lead capture** — Enquiries and Appointment requests. Neither is publicly
readable, and neither has a public write endpoint: the forms post to route
handlers that write with `overrideAccess`, so there is no internet-facing REST
route that can insert a row.

**Media** — every image. Uploads generate five renditions automatically
(480², 900×1200, 1920×1080, 2400-wide and 1200×630), and `alt` is required so
accessibility cannot be forgotten.

**Settings** — Business details, Homepage, Menus. The phone number and address
exist in exactly one place.

---

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm seed` | Load the sample content set (idempotent) |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` after a schema change |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm lint` | ESLint |
| `pnpm test:e2e` | Playwright end-to-end suite |
| `pnpm test:int` | Vitest integration tests |

**After changing a collection**, run `pnpm generate:types` so the TypeScript types
catch up with the schema.

---

## Testing

The end-to-end suite covers the public site, both forms and the SEO plumbing:

```bash
pnpm build && pnpm start   # tests run against the production build
pnpm test:e2e
```

Against a dev server the suite works too, but it is much slower — Turbopack
compiles each route on first request.

---

## SEO

> **This deployment is deliberately not indexed.** While it is a prototype, three layers keep it
> out of search results: an `X-Robots-Tag: noindex` header on every response, `robots` metadata in
> the frontend layout, and `Disallow: /` in `src/app/robots.ts`. All three must be removed together
> to go live — see [docs/deploy.md](./docs/deploy.md) §7.

Once live:

- `sitemap.xml` and `robots.txt` are generated from live content.
- `LocalBusiness` structured data comes from the business details global, so the
  knowledge panel cannot drift from the page.
- Project, area, journal and range pages carry breadcrumb and type-specific schema.
- The old Wix URLs are redirected permanently in `next.config.ts`. Add to that list
  as Search Console reveals more.
- Service-area pages target local searches ("kitchens in Doncaster").

---

## Deployment

See **[docs/deploy.md](./docs/deploy.md)** for the full runbook: hosting, the
production database and media bucket, migrations, and the DNS cutover.

---

## Licence

**Code:** All rights reserved — see [LICENSE](LICENSE). No permission is granted to copy, reuse,
modify or redistribute the code.

**Content:** the Meliora name, logo, contact details and any photography relating to Meliora are
the property of Meliora KBB Ltd or their respective owners. They are included in this repository
**for demonstration purposes only**, are covered by **neither** the code copyright **nor** any
licence, and should not be reused elsewhere without permission.

**Placeholder photography:** the stock photographs used throughout the site are from
[Pexels](https://www.pexels.com/license/) and remain the property of their photographers. Credits
are recorded in the CMS and in `src/seed/placeholder-images.ts`.

---

## Disclaimer

Provided as-is, with no warranty of any kind. This is unaffiliated prototype work and does not
represent Meliora KBB Ltd. If you are looking for the real business, please use their existing
site at [meliora.uk](https://www.meliora.uk/).
