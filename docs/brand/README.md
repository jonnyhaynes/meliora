# Brand artwork

The Meliora logo, recovered from the previous Wix site (meliora.uk) and prepared for
the new site.

## What was there

The old site served the logo as a PNG on a **flat white background with no alpha
channel**, which cannot be placed over the photography the new design is built around.

| Old asset | Detail |
|---|---|
| `6c80e0_e6bc1d2d14784607ad6c1f0e3cfee6a7~mv2.png` | The wordmark. 1430 × 597, white background |
| `6c80e0_36b3d35701ad479ea7fd6c6e5d569cfe~mv2.png` | The "business logo" — a generic grey Wix placeholder "M". Not used |
| `6c80e0_e57bf6f449104d9898aa900d5defebe8~mv2.png` | The favicon — the same grey placeholder "M". Not used |

Note the wordmark reads **"meliora INTERIORS — ESTD.2017"**, not "Kitchens, Bedrooms &
Bathrooms". That is the actual brand mark, so it is what the header now shows, while
the full business name stays in the page titles, footer and structured data.

## What is here

| File | Purpose |
|---|---|
| `logo-original-white-background.png` | The unmodified original, kept for reference |
| `prepare-logo.mjs` | Produces everything below from the original |
| `../../src/seed/assets/logo-wordmark.png` | "meliora" alone — header, footer. 1062 × 297 |
| `../../src/seed/assets/logo-lockup.png` | The full lockup with INTERIORS and ESTD.2017 — 1348 × 514 |
| `../../src/seed/assets/og-default.png` | 1200 × 630 social sharing card |
| `../../src/app/icon.png` | Favicon: the "m" on a bone tile, 512 × 512 |

The three `src/seed/assets` files are uploaded to the CMS by `pnpm seed`, and the
wordmark is referenced by **Business details → Logo**.

## How the white background was removed

Two passes with sharp:

1. **Alpha from luminance, ramped.** `alpha = clamp((1 - luminance/255) / 0.25, 0, 1)`.
   Taking alpha from the *lowest channel* instead would have made the gold rules
   semi-transparent — they are mid-tone, not dark — and a hard threshold would have
   left jagged edges. The ramp keeps solid ink solid and only softens genuine
   anti-aliasing.
2. **Colour preserved.** The original RGB is kept rather than unpremultiplied, which
   keeps the navy and gold exactly as the designer specified.

The lockup was then split into bands by row: the wordmark, "INTERIORS", "ESTD.2017".
The header uses the wordmark alone, because the descriptor is illegible at header size.

## Regenerating

If the client supplies better artwork, drop it in and run the script:

```bash
node docs/brand/prepare-logo.mjs path/to/new-logo.png
NODE_ENV=development pnpm seed     # uploads the result to the CMS
```

It writes `logo-lockup.png`, `logo-wordmark.png`, `og-default.png` into
`src/seed/assets/` and the favicon to `src/app/icon.png`. Running it against the
current source reproduces the committed files exactly.

The script assumes the lockup has three stacked bands — the wordmark, "INTERIORS",
"ESTD.2017" — and will refuse to run if it finds anything else, so a reordered or
single-line logo needs the band logic revisiting rather than silent misbehaviour.

**If vector artwork can be obtained, use it instead.** Everything here is raster,
recovered from a web export; an SVG or EPS original would be sharper on high-DPI
screens and would not need any of this.

## Still missing

- **A proper icon.** The client has no dedicated icon or monogram; the favicon is
  derived from the "m" in the wordmark. It reads acceptably from 32px up, but a
  designed icon would be better.
- **Vector originals.** Everything here is raster, recovered from a web export.
