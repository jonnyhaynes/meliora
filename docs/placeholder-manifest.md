# Placeholder manifest

**Everything in this document is temporary.** Nothing here is Meliora's work, and none
of it should be live on the public site.

The point of the placeholders is to let the design be reviewed at realistic proportions
with real photographs, rather than grey boxes. Replacing them is a content job, not a
code change — every image is a document in the CMS.

---

## 1. Photography

**Status:** stock photographs from [Pexels](https://www.pexels.com/license/), seeded by
`src/seed/placeholder-images.ts`.

**Why this matters:** a kitchen company's website is a portfolio. Presenting another
photographer's kitchens as Meliora's own work would be misrepresentation to customers.
These must be gone before launch.

**How to replace:**

1. In the admin, go to **Content → Photography**.
2. Upload the real image and give it a description in the *Alt text* field (required —
   it is what screen readers and Google read).
3. Open each Project / Range / Service / Journal post and swap the hero image and gallery
   entries for the real ones, then delete the placeholder.

**What to shoot** (brief for the photographer):

| Priority | Shot | Used for |
|---|---|---|
| 1 | Wide landscape of each finished room, shot towards the window | Heroes, project pages |
| 1 | 3–6 supporting angles per project | Project galleries |
| 2 | Detail shots — handles, worktop edges, tap, open drawers | Galleries, spacing between sections |
| 2 | Portrait (vertical) crops of the strongest rooms | Mobile heroes, range cards |
| 3 | The two of them in the showroom | About page — no competitor site has this |
| 3 | Design sketches next to the finished room | The design service story |
| 3 | Exterior of the Bawtry showroom | Showroom page, local search |

**Technical:** shoot as large as possible. The CMS generates 480×480, 900×1200,
1920×1080, 2400px-wide and 1200×630 renditions automatically, so supply the originals
rather than pre-resizing. Set the focal point on each image so portrait crops land on
the interesting part.

---

## 2. Testimonials

**Status:** four sample reviews in **Content → Testimonials**, each with the author
literally set to `Sample review — replace before launch`.

**Why this matters:** inventing client quotes and attributing them to real-sounding
people is dishonest, and would be a problem the moment a customer compared them to the
Google listing.

**How to replace:** delete all four, then either add genuine quotes the client has
permission to publish, or connect the Google reviews feed (see §4) which pulls real
reviews automatically.

**Before publishing a quote, confirm:** the client agreed to it, they are happy with how
they are credited, and the wording is theirs rather than paraphrased.

---

## 3. Written content

**Status:** written to be plausible in shape and length, but not real.

| Where | What is placeholder |
|---|---|
| Projects | All eight case studies. The narratives, specifications and locations are invented. |
| Ranges | The five range descriptions. |
| Services | The four service pages and their process steps. |
| Journal | All four articles, each containing an explicit note that it is placeholder copy. |
| Opening hours | Monday–Friday 9–5, Saturday by appointment — **verify against reality**. |
| Service areas | Ten area pages with generic intro copy. |

**How to replace:** the Projects, Ranges and Services copy should be rewritten by the
client — she knows what she actually fitted. It will also read far better than anything
generated.

---

## 4. Not placeholder, and safe to keep

- **Brand artwork** — the "meliora INTERIORS / ESTD.2017" logo was recovered from the
  previous Wix site and is genuine. The background was flat white, so it was keyed to
  transparency. Originals and derivatives are in `docs/brand/` and `src/seed/assets/`.
- **Business details** — phone, email, address and social links came from the existing
  meliora.uk site and are real. Opening hours are the exception (see §3).
- **Google reviews feed** — when wired up, pulls live reviews and caches them for 24
  hours, so it can never go stale.

---

## Pre-launch checklist

- [ ] **Prototype noindex removed** — the `X-Robots-Tag` header, the `robots` metadata and
      `Disallow: /`. See [deploy.md](./deploy.md) §7; leaving the header in place keeps the site
      invisible to Google.
- [ ] **Prototype banner removed** from the frontend layout
- [ ] Every image in **Content → Photography** is Meliora's own, with alt text written
- [ ] Zero documents containing `Sample review — replace before launch`
- [ ] No project represents a job the business did not do
- [ ] Opening hours confirmed against the showroom door
- [ ] Every published project has a hero image and at least three gallery images
- [ ] Google reviews feed live, or testimonials added by hand
- [ ] Search the built HTML for `pexels` and confirm nothing matches
