# Agent context for Meliora

This file orients coding agents on this repo. Keep it lean -- it points, it doesn't
explain. Substantive design and rationale live in `/docs`; read those before any
non-trivial change. If a section here wants more than a few lines, move it to its own
doc under `/docs` and link it.

## What this is

Marketing website and Payload CMS for **Meliora Kitchens, Bedrooms & Bathrooms**.
It is an **exploratory prototype, not the live site**: photography is Pexels stock,
projects/ranges/services/journal copy and testimonials are fabricated samples, and the
site is deliberately `noindex`ed. See `docs/placeholder-manifest.md` for everything
that must change before real launch.

`README.md` holds status and first-run setup; `docs/dev-workflow.md` is how we build here.

## Stack

**Next.js 16 (App Router) + Payload CMS 3**, in a single app -- Payload runs inside
Next (no separate server) and provides admin, REST, GraphQL, auth, uploads and live
preview. React 19, TypeScript 5.7 (strict, `noEmit`), Tailwind CSS v4, PostgreSQL 17
via `@payloadcms/db-postgres`. Package manager is **pnpm**; Node **>=22.19**. Media is
local disk in dev, Cloudflare R2 in prod. Tests: **Vitest** (`pnpm test:int`) and
**Playwright** (`pnpm test:e2e`). Lint/format: ESLint 9 + Prettier. Zod schemas are
shared between browser and server forms.

Commands:

- `pnpm dev` -- dev server (Turbopack); admin at `/admin`. Use `pnpm devsafe` to clear `.next` first.
- `pnpm build` / `pnpm start` -- production build and serve.
- `pnpm typecheck` · `pnpm lint` · `pnpm test:int` · `pnpm test:e2e`
- `pnpm seed` -- idempotent sample content.
- `pnpm generate:types` -- regenerate `src/payload-types.ts` after **any** collection/field change.
- `pnpm payload migrate` -- raw Payload CLI (migrations).

## Load-bearing principles

These shape the schema and the code. Don't change them without checking the relevant
doc and flagging it.

- **Leads stay off the public REST API.** `Enquiries` and `Bookings` are not publicly
  readable and have no public write endpoint. The forms POST to
  `src/app/api/enquiry/route.ts` and `src/app/api/booking/route.ts`, which write with
  `overrideAccess: true`. Don't add an internet-facing route that can insert a lead.
- **Store the lead before emailing it** so a mail failure can't lose an enquiry. The
  honeypot field is deliberately named `_hp` and must return success when tripped; the
  in-memory rate limiter is only a per-process speed bump (documented trade-off).
- **Read content through Payload's local API** (`getPayloadClient()` in
  `src/lib/payload.ts`) from server components -- never over HTTP.
- **Auth is role-based**: `Admin` and `Editor`; `role` is saved to the JWT so access
  checks need no DB lookup. Predicates live in `src/access/`.
- **Generated code is off-limits to edit**: `src/app/(payload)/`, `src/payload-types.ts`,
  `src/payload-generated-schema.ts`, `src/migrations/`.
- **The prototype noindex is three coupled layers** -- `X-Robots-Tag` in
  `next.config.ts`, `robots: { index: false }` in `src/app/(frontend)/layout.tsx`, and
  `Disallow: /` in `src/app/robots.ts`. All three come off together, or none do.
- **Production DB changes go through migrations**; dev uses schema push and prod must
  not. Generate migrations with `R2_BUCKET` set and against an **empty** DB, or the
  storage plugin's media column is missing. Never name a local creds file
  `.env.production.local` (Next auto-loads it) -- use `.env.production.credentials`.
- **Media `alt` is required**; five renditions are generated per upload.

## Scope boundaries

What this project is **not**. If a request would drift here, push back before building.

- **Not the live site.** It's an intentional prototype: fabricated content and stock
  photography are expected, and the noindex is by design, not a bug.
- **Not a booking/diary system.** "Book an appointment" is a request flow, not
  availability management.
- **Not a store, CRM, or multi-tenant CMS.**
- **Google reviews are never persisted** -- fetched live and cached 24h in Next's fetch
  cache (Google ToS), failing silently back to hand-entered testimonials.

## How we work (the short version)

Full process: `docs/dev-workflow.md`. The non-negotiables:

- **Plan first.** For non-trivial work, produce an implementation plan saved to
  `docs/plans/<ticket>.md` and have a human approve it before writing code. The
  plan is what gets reviewed, not the first code.
- **A human reviews and merges every PR.** The agent opens the PR and gets CI green; a
  named person reviews the diff against the plan and merges. The agent never merges.
- **Never put secrets, credentials, or client data into the model.** If unsure,
  it's out of bounds until you've asked.
- **Mark AI-assisted work.** Prefix AI-assisted PR titles `[ai-assisted]`, reference
  the approved plan doc, and end the description with a `Manually reviewed by <name>`
  line. Keep the `Co-Authored-By` trailer on commits.

## Documents

Source of truth lives in `/docs`. Read the relevant doc before responding:

- `README.md` -- what it is, first-run setup, testing notes.
- `docs/dev-workflow.md` -- how we build (the loop + standing conventions).
- `docs/placeholder-manifest.md` -- every temporary thing to replace before launch.
- `docs/deploy.md` -- deployment runbook (hosting, DB, R2, email, go-live checklist).
- `docs/brand/README.md` -- brand artwork provenance and logo regeneration.

## Working style

- Push back where appropriate rather than agreeing reflexively.
- When changing a load-bearing principle or scope boundary, flag it explicitly
  rather than slipping it in.
- Prefer pointing at a doc section over reproducing its content here.

## Raising pull requests

This project uses **GitHub**. Raise PRs with the `gh` CLI (or the REST API):

- Repo: `jonnyhaynes/meliora` · Target branch: `main`.
- Push the branch (`git push -u origin <branch>`), then `gh pr create`.
- **Mark AI-assisted PRs:** prefix the title `[ai-assisted]` (or add an `ai-assisted`
  label), reference the approved plan doc (`docs/plans/<ticket>.md`) in the body, and
  end it with a `Manually reviewed by <name>` line confirming the diff was read.
- Keep the `Co-Authored-By` trailer on commits. **A human merges** once CI is green
  and the diff has been reviewed against the plan.

**Issue tracker: GitHub Issues.** One issue = one unit of work; acceptance criteria
are the test contract. Reference the issue in the branch name and PR, and close it from
the PR (`Closes #NN`) once merged.
