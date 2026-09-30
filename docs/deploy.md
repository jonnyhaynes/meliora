# Deployment runbook

Everything needed to take this from a local checkout to meliora.uk.

---

## 1. Hosting

Payload runs inside Next.js, so this is a single deployment. Two sensible options:

### Vercel (recommended)

The best-supported target for Payload 3, and the least to maintain.

- **Vercel Pro is required.** The Hobby tier forbids commercial use, so a business
  site cannot run on it. Budget roughly $20/month.
- Add **Neon** (or Supabase) for Postgres — free tier is ample — and **Cloudflare R2**
  for media.

Four things need to be right on Vercel, and all four are already handled in the code:

| Concern | How it is handled |
|---|---|
| Container filesystem is ephemeral | Media goes to R2, never to disk |
| 4.5 MB serverless upload limit | The storage adapter uses `clientUploads: true`, so uploads go browser → bucket directly |
| Connection pool exhaustion | Use the **pooled** connection string (see §2) |
| Email weight | Nodemailer works; **Resend** is lighter (see §4) |

### Railway or Fly (budget alternative)

Cheaper — a few pounds a month for the app and Postgres together — and it runs as a
normal long-lived Node server, so there are no upload limits or cold starts. You
lose some deployment polish. Nothing in the codebase depends on the choice.

---

## 2. Database

Create a Postgres database (Neon, Supabase, Railway — all fine).

**Use the pooled connection string.** Serverless functions scale horizontally and
will otherwise exhaust Postgres connections; this is the single most common way
Payload-on-Vercel falls over. On Neon this is the `-pooler` hostname.

Set `DATABASE_URL` to it.

### Migrations

Development uses Payload's schema push. **Production must not** — generate
migrations and run them deliberately.

```bash
pnpm payload migrate:create initial   # once, to establish the baseline
pnpm payload migrate                  # against the production DATABASE_URL
```

Run migrations as a deploy step, before the new build starts serving traffic. Commit
the generated files in `src/migrations`.

---

## 3. Media on Cloudflare R2

R2 has no egress fees, which matters for a site that is mostly photographs.

1. Create a bucket, e.g. `meliora-media`.
2. Connect a **custom domain** to it (e.g. `media.meliora.uk`) — the R2 S3 endpoint
   cannot serve files publicly.
3. Create an API token with read/write access and set:

| Variable | Value |
|---|---|
| `R2_BUCKET` | `meliora-media` |
| `R2_ACCESS_KEY_ID` | from the API token |
| `R2_SECRET_ACCESS_KEY` | from the API token |
| `R2_ENDPOINT` | `https://<accountId>.r2.cloudflarestorage.com` |
| `R2_PUBLIC_URL` | `https://media.meliora.uk` |

`R2_BUCKET` is the switch: leave it unset and media stays on local disk, as in
development. Setting it turns the adapter on.

`R2_PUBLIC_URL` is also read by `next.config.ts` to allow the bucket host through
Next's image optimiser.

---

## 4. Email

Without `SMTP_HOST`, development uses ethereal.email and sends nothing real.

In production, set the SMTP variables (any provider — Fastmail, Google Workspace,
Postmark, Resend). If deploying to Vercel, **Resend is a better fit than Nodemailer**
because it is much lighter in a serverless function; swapping the adapter is a
handful of lines in `src/payload.config.ts`.

Set `ENQUIRY_NOTIFICATION_EMAIL` to wherever enquiries should land —
`info@meliora.uk`.

Verify before launch by submitting the contact form on the live site and confirming
the email arrives. A form that silently fails is worse than no form.

---

## 5. Google reviews (optional)

1. Get a Places API key in Google Cloud (restrict it to the Places API).
2. Find the Place ID for the Bawtry showroom — the Place ID Finder in the Google
   Maps Platform docs will resolve it from the business name.
3. Set `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID`.

If either is missing, the homepage falls back to the testimonials entered by hand.
Reviews are cached for 24 hours and **never written to the database** — Google's
terms do not permit storing review content for more than 30 days.

---

## 6. Environment variables

Set all of these in the hosting dashboard:

```
DATABASE_URL            # pooled connection string
PAYLOAD_SECRET          # openssl rand -base64 32
NEXT_PUBLIC_SERVER_URL  # https://www.meliora.uk
EMAIL_FROM_ADDRESS      # info@meliora.uk
EMAIL_FROM_NAME         # Meliora Kitchens, Bedrooms & Bathrooms
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
ENQUIRY_NOTIFICATION_EMAIL
R2_BUCKET
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_ENDPOINT
R2_PUBLIC_URL
GOOGLE_PLACES_API_KEY   # optional
GOOGLE_PLACE_ID         # optional
```

---

## 7. Going live

> ### ⚠️ Turn the prototype noindex off, or the site will never appear in Google
>
> While this is a prototype, three things deliberately keep it out of search results:
>
> 1. `X-Robots-Tag: noindex…` on every response — [next.config.ts](../next.config.ts)
> 2. `robots: { index: false … }` — [src/app/(frontend)/layout.tsx](../src/app/(frontend)/layout.tsx)
> 3. `Disallow: /` — [src/app/robots.ts](../src/app/robots.ts)
>
> **All three must be removed together** as part of going live, and `robots.ts` replaced with a
> normal policy that advertises the sitemap. Miss the first one and the site stays invisible no
> matter what you do afterwards. There are end-to-end tests asserting each layer, so they will
> fail loudly once the restriction is lifted — update them at the same time.

Work against a staging URL while the Wix site stays up.

1. **Deploy to staging.** Confirm `/admin` loads and you can sign in.
2. **Run migrations** against the production database.
3. **Create the first admin user** at `/admin` — the owner, not a developer.
4. **Create an Editor account** for whoever else needs to add content. Editors
   cannot manage users or delete content.
5. **Clear the placeholders.** Work through
   [placeholder-manifest.md](./placeholder-manifest.md) in full. This is the step
   that matters most: the site must not launch with another photographer's kitchens
   credited as Meliora's work.
6. **Check the redirects.** `/about-us` should land on `/about`. Add more to
   `next.config.ts` as Search Console reveals legacy paths.
7. **Point DNS** at the host, and keep the old site up until the new one is serving.
8. **Remove the prototype noindex** — all three layers, see the box above. Confirm by fetching a
   page and checking there is no `X-Robots-Tag` header, then verify with Google's URL Inspection
   tool.
9. **Verify the domain in Google Search Console**, submit the sitemap, and confirm
   the Google Business Profile still points at meliora.uk.
10. **Test the forms on the live site** — submit a real enquiry and confirm the email
    arrives and the row appears in the admin panel.
11. **Remove the prototype banner** — `src/components/PrototypeBanner.tsx` and its usage in the
    frontend layout.

### After launch

- Watch Search Console for 404s from the old site and add redirects.
- Request a review from a recent client — the reviews feed is the strongest trust
  signal on the page.
- Check Core Web Vitals once there is real traffic.

---

## Notes and known trade-offs

- **Rate limiting is in-memory.** On serverless, each instance counts separately, so
  it is a speed bump against casual form spam rather than a wall. Combined with the
  honeypot it is proportionate for a contact form. If spam becomes a real problem,
  move the counter to Upstash Redis or add Cloudflare Turnstile.
- **The CSP allows `'unsafe-inline'` for scripts**, because Next injects its
  hydration bootstrap inline without a nonce. Moving to a nonce-based policy via
  middleware would be a genuine improvement.
- **Appointment booking is a request flow, not a diary.** It records what the client
  asked for and emails it; someone has to confirm. If self-serve availability is
  wanted later, a Calendly or Cal.com embed drops into the existing route.
- **The `payload-*` dev warning about a non-standard `NODE_ENV`** appears if your
  shell exports `NODE_ENV`. Run dev with `NODE_ENV=development pnpm dev` if so.
