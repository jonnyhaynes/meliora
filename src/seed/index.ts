import 'dotenv/config'

import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { getPayload, type Payload } from 'payload'
import { fileURLToPath } from 'url'

import config from '../payload.config'
import { imagesFor, pexelsUrl, placeholderImages, type PlaceholderImage } from './placeholder-images'
import { richText } from './richText'

const cacheDir = path.join(os.tmpdir(), 'meliora-seed-media')

// Committed brand artwork, uploaded as-is rather than downloaded.
const dirname = path.dirname(fileURLToPath(import.meta.url))
const assetDir = path.join(dirname, 'assets')

const payload: Payload = await getPayload({ config })

// ---------------------------------------------------------------- media

async function download(image: PlaceholderImage): Promise<string> {
  await fs.mkdir(cacheDir, { recursive: true })
  const file = path.join(cacheDir, `${image.id}.jpg`)

  const cached = await fs.stat(file).catch(() => null)
  if (cached && cached.size > 10_000) return file

  // Pexels serves a mix of jpeg and png originals behind the same id.
  for (const extension of ['jpeg', 'png']) {
    const response = await fetch(pexelsUrl(image.id, extension))
    if (!response.ok) continue
    await fs.writeFile(file, Buffer.from(await response.arrayBuffer()))
    return file
  }

  throw new Error(`Could not download placeholder ${image.id} as jpeg or png`)
}

/** Media is matched on its alt text, so re-running the seed does not duplicate it. */
async function ensureMedia(image: PlaceholderImage) {
  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: image.alt } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) return existing.docs[0].id

  return (
    await payload.create({
      collection: 'media',
      data: { alt: image.alt, credit: image.credit },
      filePath: await download(image),
      overrideAccess: true,
    })
  ).id
}

// ------------------------------------------------------------- utilities

/** Create-or-update keyed on slug, so the seed is safe to run repeatedly. */
async function upsert(
  collection: Parameters<Payload['find']>[0]['collection'],
  slug: string,
  data: Record<string, unknown>,
) {
  const existing = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    return payload.update({
      collection,
      id: existing.docs[0].id,
      data: data as never,
      overrideAccess: true,
    })
  }

  return payload.create({
    collection,
    data: { ...data, slug } as never,
    overrideAccess: true,
  })
}

const log = (message: string) => console.log(`  ${message}`)

// ------------------------------------------------------------------ run

console.log('\nSeeding Meliora\n')

// --- Photography -----------------------------------------------------------
console.log('Photography')
const media = new Map<string, number>()
for (const image of placeholderImages) {
  media.set(image.id, await ensureMedia(image))
}
log(`${placeholderImages.length} placeholder images ready`)

const shot = (id: string) => media.get(id)!

const galleryFor = (room: 'kitchen' | 'bathroom' | 'bedroom', skip = 1) =>
  imagesFor(room)
    .slice(skip, skip + 3)
    .map((image) => ({ image: shot(image.id), caption: image.alt }))

const heroFor = (room: 'kitchen' | 'bathroom' | 'bedroom', index = 0) =>
  shot(imagesFor(room)[index].id)

// --- Brand artwork ---------------------------------------------------------
console.log('Brand artwork')

/**
 * The real logo, recovered from the previous Wix site. The background was flat
 * white, so it is keyed to transparency before it gets here — see
 * docs/brand/ for the source artwork and how it was processed.
 */
const brandAsset = async (file: string, alt: string) => {
  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: alt } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) return existing.docs[0].id

  return (
    await payload.create({
      collection: 'media',
      data: { alt, credit: 'Meliora brand artwork' },
      filePath: path.join(assetDir, file),
      overrideAccess: true,
    })
  ).id
}

const logoWordmark = await brandAsset('logo-wordmark.png', 'Meliora wordmark')

// Uploaded to the library for the owners to use (print, social, stationery) but
// not referenced by a field — the wordmark is what the site itself renders.
await brandAsset('logo-lockup.png', 'Meliora logo lockup with the INTERIORS descriptor and ESTD.2017')

const ogImage = await brandAsset(
  'og-default.png',
  'Meliora social sharing card — the lockup on a bone background',
)
log('wordmark, lockup and social card')

// --- Brands ----------------------------------------------------------------
console.log('Brands')
const brandNames = [
  { name: 'Miele', url: 'https://www.miele.co.uk/' },
  { name: 'Neff', url: 'https://www.neff-home.com/uk' },
  { name: 'Quooker', url: 'https://www.quooker.co.uk/' },
  { name: 'Bora', url: 'https://www.bora.com/uk/' },
  { name: 'Sub-Zero & Wolf', url: 'https://www.subzero-wolf.com/' },
  { name: 'Silestone', url: 'https://www.cosentino.com/en-gb/silestone/' },
]

const brands: number[] = []
for (const [index, brand] of brandNames.entries()) {
  const existing = await payload.find({
    collection: 'brands',
    where: { name: { equals: brand.name } },
    limit: 1,
    overrideAccess: true,
  })
  const doc =
    existing.docs[0] ??
    (await payload.create({
      collection: 'brands',
      data: { ...brand, order: index },
      overrideAccess: true,
    }))
  brands.push(doc.id)
}
log(`${brandNames.length} brands`)

// --- Testimonials ----------------------------------------------------------
console.log('Testimonials')

// These are written as obvious samples. Replace them with real reviews (or let
// the Google reviews feed fill the homepage) before launch.
const testimonialSeeds = [
  {
    quote:
      'They took the time to understand how we actually use the room, and the design shows it. Nothing was too much trouble.',
    author: 'Sample review — replace before launch',
    location: 'Bawtry',
    rating: 5,
  },
  {
    quote:
      'The whole process felt personal from start to finish. We were involved at every stage and it shows in the finished kitchen.',
    author: 'Sample review — replace before launch',
    location: 'Retford',
    rating: 5,
  },
  {
    quote:
      'Being able to see and feel every sample in the showroom made the decisions so much easier.',
    author: 'Sample review — replace before launch',
    location: 'Doncaster',
    rating: 5,
  },
  {
    quote:
      'They worked closely with our builder and the finish is exactly what we pictured.',
    author: 'Sample review — replace before launch',
    location: 'Worksop',
    rating: 5,
  },
]

const testimonials: number[] = []
for (const [index, testimonial] of testimonialSeeds.entries()) {
  const existing = await payload.find({
    collection: 'testimonials',
    where: { author: { equals: testimonial.author }, location: { equals: testimonial.location } },
    limit: 1,
    overrideAccess: true,
  })
  const doc =
    existing.docs[0] ??
    (await payload.create({
      collection: 'testimonials',
      data: { ...testimonial, source: 'manual', featured: index < 3 },
      overrideAccess: true,
    }))
  testimonials.push(doc.id)
}
log(`${testimonialSeeds.length} sample testimonials`)

// --- Ranges ----------------------------------------------------------------
console.log('Ranges')
const rangeSeeds = [
  {
    title: 'In-Frame',
    styleType: 'in-frame',
    description:
      'Hand-built cabinetry with a visible frame around every door and drawer. The most traditional of our ranges, and the one that ages most gracefully.',
  },
  {
    title: 'Shaker',
    styleType: 'shaker',
    description:
      'The classic shaker door, at home in both period and modern properties. Simple, honest and endlessly adaptable.',
  },
  {
    title: 'Handleless',
    styleType: 'handleless',
    description:
      'Clean, uninterrupted lines with integrated finger pulls or push-to-open mechanisms. A calm, contemporary look.',
  },
  {
    title: 'Modern',
    styleType: 'modern',
    description:
      'Sleek surfaces, sharp detailing and a restrained palette. Designed around the way a working kitchen actually flows.',
  },
  {
    title: 'Traditional',
    styleType: 'traditional',
    description:
      'Cornicing, pilasters and detailing drawn from period joinery, for homes where the architecture asks for it.',
  },
]

const ranges: number[] = []
for (const [index, range] of rangeSeeds.entries()) {
  const room: 'kitchen' | 'bathroom' = index % 2 === 0 ? 'kitchen' : 'bathroom'
  const doc = await upsert('ranges', range.title.toLowerCase().replace(/[^a-z]+/g, '-'), {
    ...range,
    heroImage: heroFor(room, index),
    gallery: galleryFor(room, index + 2),
    featured: index < 3,
    order: index,
    _status: 'published',
  })
  ranges.push(doc.id)
}
log(`${rangeSeeds.length} ranges`)

// --- Services --------------------------------------------------------------
console.log('Services')
const serviceSeeds = [
  {
    slug: 'kitchens',
    title: 'Kitchens',
    intro:
      'Designed around how you cook, eat and live — then built to last. We handle the design, the supply and the fitting.',
    room: 'kitchen' as const,
    steps: [
      ['Design consultation', 'We visit you, measure up and talk through how you use the space.'],
      ['Design and samples', 'You see the layout drawn up alongside real doors, worktops and handles.'],
      ['Detailed specification', 'Appliances, storage and finishes agreed and costed before anything is ordered.'],
      ['Fitting', 'Our recommended fitters install to the design, with us on hand throughout.'],
    ],
  },
  {
    slug: 'bedrooms',
    title: 'Bedrooms',
    intro:
      'Fitted wardrobes and bedroom furniture that make the most of awkward spaces and leave the room feeling calmer.',
    room: 'bedroom' as const,
    steps: [
      ['Survey', 'We measure the room and identify the dead space worth reclaiming.'],
      ['Interior planning', 'Hanging, shelving and drawers planned around what you actually own.'],
      ['Finishes', 'Door styles, colours and handles chosen from the showroom.'],
      ['Installation', 'Fitted cleanly and levelled, with the room left tidy.'],
    ],
  },
  {
    slug: 'bathrooms',
    title: 'Bathrooms',
    intro:
      'Bathrooms planned properly — sanitaryware, storage and lighting considered together rather than one at a time.',
    room: 'bathroom' as const,
    steps: [
      ['Design visit', 'Measuring up and talking through how the bathroom needs to work.'],
      ['Layout and specification', 'Sanitaryware, tiling and storage resolved as one scheme.'],
      ['Sourcing', 'Independent, so we source what suits the design rather than what is in stock.'],
      ['Fitting', 'Coordinated with trusted fitters and trades.'],
    ],
  },
  {
    slug: 'design',
    title: 'Design Service',
    intro:
      'The design is the part we care most about. You are involved throughout, and nothing is ordered until it is right.',
    room: 'kitchen' as const,
    steps: [
      ['Listen', 'Understanding the brief, the budget and the constraints.'],
      ['Draw', 'Plans, elevations and sketches you can actually read and react to.'],
      ['Refine', 'Changing things until the design is genuinely right.'],
      ['Deliver', 'Staying involved until the finished room matches the drawing.'],
    ],
  },
]

for (const [index, service] of serviceSeeds.entries()) {
  await upsert('services', service.slug, {
    title: service.title,
    heroImage: heroFor(service.room, index + 1),
    intro: service.intro,
    body: richText(
      service.intro,
      'We are a husband and wife team based in Bawtry. There is no call centre and no aftersales department — the people who design your room are the people you speak to.',
      'Being independent means we can source whatever the design calls for, rather than steering you towards a particular manufacturer.',
    ),
    processSteps: service.steps.map(([title, description]) => ({ title, description })),
    gallery: galleryFor(service.room, index + 3),
    order: index,
  })
}
log(`${serviceSeeds.length} services`)

// --- Projects --------------------------------------------------------------
console.log('Projects')
type ProjectSeed = {
  title: string
  location: string
  roomType: 'kitchen' | 'bedroom' | 'bathroom' | 'multiple'
  room: 'kitchen' | 'bedroom' | 'bathroom'
  summary: string
  specs: [string, string][]
  testimonial?: number
}

const projectSeeds: ProjectSeed[] = [
  {
    title: 'In-frame kitchen in a converted barn',
    location: 'Bawtry',
    roomType: 'kitchen',
    room: 'kitchen',
    summary:
      'A large open-plan space in a converted barn, where the kitchen had to sit comfortably alongside original beams.',
    specs: [
      ['Cabinetry', 'Hand-painted in-frame'],
      ['Worktop', 'Roma quartz'],
      ['Appliances', 'Miele and Quooker'],
    ],
    testimonial: 0,
  },
  {
    title: 'Handleless kitchen for a family home',
    location: 'Retford',
    roomType: 'kitchen',
    room: 'kitchen',
    summary:
      'A busy family kitchen designed so that everyday clutter has somewhere to go, without the room feeling like storage.',
    specs: [
      ['Cabinetry', 'Handleless, matt finish'],
      ['Worktop', 'Silestone'],
      ['Appliances', 'Neff and Bora'],
    ],
    testimonial: 1,
  },
  {
    title: 'Galley kitchen reworked for a Victorian terrace',
    location: 'Doncaster',
    roomType: 'kitchen',
    room: 'kitchen',
    summary:
      'A narrow galley opened up by taking the cabinetry full height and moving the cooking zone to the garden end.',
    specs: [
      ['Cabinetry', 'Shaker, two-tone'],
      ['Worktop', 'Solid oak'],
      ['Appliances', 'Neff'],
    ],
    testimonial: 2,
  },
  {
    title: 'Fitted bedroom in a period cottage',
    location: 'Bawtry',
    roomType: 'bedroom',
    room: 'bedroom',
    summary:
      'Sloping ceilings and an awkward chimney breast turned into an advantage with fully fitted wardrobes.',
    specs: [
      ['Cabinetry', 'Fitted wardrobes, in-frame'],
      ['Interiors', 'Oak veneer'],
      ['Lighting', 'Integrated LED'],
    ],
    testimonial: 3,
  },
  {
    title: 'Principal bedroom with a walk-in dressing area',
    location: 'Worksop',
    roomType: 'bedroom',
    room: 'bedroom',
    summary:
      'A spare room sacrificed to give the principal bedroom a proper dressing area and somewhere for everything to live.',
    specs: [
      ['Cabinetry', 'Walk-in wardrobe'],
      ['Interiors', 'Mirrored and glass-fronted'],
      ['Lighting', 'Motion-sensing'],
    ],
  },
  {
    title: 'Family bathroom with walk-in shower',
    location: 'Gainsborough',
    roomType: 'bathroom',
    room: 'bathroom',
    summary:
      'A bathroom reworked around a large walk-in shower, with storage built in rather than added afterwards.',
    specs: [
      ['Sanitaryware', 'Freestanding bath, wall-hung WC'],
      ['Tiling', 'Large-format porcelain'],
      ['Fittings', 'Brushed brass'],
    ],
  },
  {
    title: 'En-suite in a new build',
    location: 'Scunthorpe',
    roomType: 'bathroom',
    room: 'bathroom',
    summary:
      'Making a standard new-build en-suite feel considered, with a vanity sized to the room rather than the catalogue.',
    specs: [
      ['Sanitaryware', 'Wall-hung basin and WC'],
      ['Tiling', 'Marble-effect porcelain'],
      ['Storage', 'Bespoke mirrored cabinet'],
    ],
  },
  {
    title: 'Whole-house renovation with three fitted rooms',
    location: 'Sheffield',
    roomType: 'multiple',
    room: 'kitchen',
    summary:
      'Kitchen, utility and principal bedroom designed together so that the same palette runs through the whole house.',
    specs: [
      ['Cabinetry', 'Shaker throughout'],
      ['Worktop', 'Quartz and oak'],
      ['Appliances', 'Miele and Sub-Zero'],
    ],
  },
]

const projects: number[] = []

for (const [index, project] of projectSeeds.entries()) {
  const doc = await upsert(
    'projects',
    project.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
    {
    title: project.title,
    location: project.location,
    roomType: project.roomType,
    styles: [ranges[index % ranges.length]],
    summary: project.summary,
    heroImage: heroFor(project.room, index),
    narrative: richText(
      project.summary,
      'The brief was set out during a design visit, and the layout went through several rounds before anything was ordered. That is usually where the value is added — the finished room is the easy part to photograph.',
      'Every finish was chosen from physical samples in the Bawtry showroom, so there were no surprises on delivery.',
    ),
    gallery: galleryFor(project.room, index + 1),
    specs: project.specs.map(([label, value]) => ({ label, value })),
    appliances: brands.slice(0, 3),
    testimonial: project.testimonial === undefined ? undefined : testimonials[project.testimonial],
    featured: index < 3,
    publishedAt: new Date(Date.now() - index * 86_400_000 * 14).toISOString(),
    _status: 'published',
    },
  )
  projects.push(doc.id)
}
log(`${projectSeeds.length} projects`)

// --- Service areas ---------------------------------------------------------
console.log('Service areas')
const areaNames = [
  'Bawtry',
  'Doncaster',
  'Retford',
  'Worksop',
  'Gainsborough',
  'Scunthorpe',
  'Sheffield',
  'Rotherham',
  'Lincoln',
  'Barnsley',
]

for (const [index, name] of areaNames.entries()) {
  await upsert('service-areas', name.toLowerCase(), {
    name,
    intro: `We design, supply and fit kitchens, bedrooms and bathrooms for homes in and around ${name}.`,
    body: richText(
      `Most of our work in ${name} starts with a design visit at your home, followed by an appointment at the Bawtry showroom to choose finishes.`,
      `We are an independent studio, which means we source what the design needs rather than what a particular manufacturer would prefer us to sell.`,
    ),
    featuredProjects: [],
    order: index,
  })
}
log(`${areaNames.length} service areas`)

// --- Journal ---------------------------------------------------------------
console.log('Journal')
const postSeeds = [
  {
    title: 'How much does a new kitchen cost in South Yorkshire?',
    category: 'advice',
    excerpt:
      'A straight answer to the question everyone asks first, including what actually moves the number.',
  },
  {
    title: 'In-frame or shaker: what is the difference?',
    category: 'inspiration',
    excerpt:
      'Two terms that get used interchangeably, and the practical differences that matter when you are choosing.',
  },
  {
    title: 'Five storage ideas that make a small kitchen work harder',
    category: 'inspiration',
    excerpt:
      'The details worth designing in from the start, rather than trying to add afterwards.',
  },
  {
    title: 'What happens at a showroom design appointment?',
    category: 'behind-the-scenes',
    excerpt:
      'What to bring, what we will ask you, and how long it usually takes.',
  },
]

for (const [index, post] of postSeeds.entries()) {
  const room = index % 2 === 0 ? 'kitchen' : 'bathroom'
  await upsert('posts', post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), {
    title: post.title,
    heroImage: heroFor(room, index + 4),
    excerpt: post.excerpt,
    category: post.category,
    body: richText(
      post.excerpt,
      'This article is placeholder copy, written so the journal layout can be reviewed. It will be replaced with real editorial before launch.',
      'A good journal post answers one question properly. It should be written by the person who actually does the work, not by a marketing agency.',
    ),
    publishedAt: new Date(Date.now() - index * 86_400_000 * 21).toISOString(),
    _status: 'published',
  })
}
log(`${postSeeds.length} journal posts`)

// --- Standalone pages ------------------------------------------------------
console.log('Pages')

await upsert('pages', 'about', {
  title: 'A husband and wife team in Bawtry',
  heroImage: heroFor('kitchen', 8),
  intro:
    'We founded Meliora to create beautiful spaces within each client’s home. We design to reflect you and how you want to live.',
  body: richText(
    'We are a husband and wife team. We started the business because we wanted to design rooms properly — taking the time to understand how a family actually uses a kitchen, rather than selling whatever happens to be in a catalogue.',
    'We encourage you to be fully involved in the design process. It is your home, and the best results come from a proper conversation about how you cook, where the light falls, and what has annoyed you about the current room for the last ten years.',
    'Based in Bawtry, we have a boutique showroom in the town. The business is just the two of us — no call centres, no aftersales department, no handover to somebody you have never met. The people who design your room are the people you speak to.',
  ),
  sections: [
    {
      heading: 'We are genuinely independent',
      body: 'Being independent means we can source anything you can think of, rather than steering you towards one manufacturer’s range. If a particular door, worktop or appliance is right for the design, we will find it.',
      image: heroFor('kitchen', 2),
    },
    {
      heading: 'The design is the part we care about most',
      body: 'You will see the layout drawn up, and real doors, worktops and handles in the showroom, before anything is ordered. Changing your mind at that stage costs nothing. Changing it after the units are built costs a great deal.',
      image: heroFor('bathroom', 4),
    },
  ],
  gallery: galleryFor('kitchen', 5),
  _status: 'published',
})

await upsert('pages', 'showroom', {
  title: 'The showroom',
  heroImage: heroFor('kitchen', 10),
  intro:
    'A small showroom in Bawtry where you can see and feel the finishes before you commit to anything.',
  body: richText(
    'Photographs only get you so far. The difference between two similar-looking doors, or two worktops that photograph identically, is obvious the moment you open a drawer or run your hand across the surface.',
    'We keep a range of doors, worktops, handles and samples in the showroom, and we will talk you through the trade-offs honestly — including where it is worth spending and where it genuinely is not.',
    'Visits are by appointment, so you get our full attention and the room to yourself.',
  ),
  gallery: galleryFor('bathroom', 2),
  _status: 'published',
})

log('about and showroom pages')

// --- Globals ---------------------------------------------------------------
console.log('Business details and menus')

await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    businessName: 'Meliora Kitchens, Bedrooms & Bathrooms',
    logo: logoWordmark,
    ogImage,
    tagline:
      'A husband and wife team designing kitchens, bedrooms and bathrooms across Bawtry, Doncaster and South Yorkshire.',
    phone: '01302 711007',
    email: 'info@meliora.uk',
    address: {
      street: '11 Swan Street',
      town: 'Bawtry',
      county: 'Doncaster',
      postcode: 'DN10 6JQ',
    },
    mapUrl: 'https://maps.google.com/?cid=13638127095150046780',
    openingHours: [
      { days: 'Monday – Friday', hours: '9:00am – 5:00pm' },
      { days: 'Saturday', hours: 'By appointment' },
      { days: 'Sunday', hours: 'Closed' },
    ],
    socials: {
      instagram: 'https://www.instagram.com/meliorakbb/',
      facebook: 'https://www.facebook.com/MelioraKBB/',
    },
  },
  overrideAccess: true,
})

const nav = [
  { label: 'Kitchens', url: '/kitchens' },
  { label: 'Bedrooms', url: '/bedrooms' },
  { label: 'Bathrooms', url: '/bathrooms' },
  { label: 'Projects', url: '/projects' },
  { label: 'Ranges', url: '/ranges' },
  { label: 'Journal', url: '/journal' },
  { label: 'About', url: '/about' },
]

await payload.updateGlobal({
  slug: 'navigation',
  data: {
    header: [...nav, { label: 'Contact', url: '/contact' }],
    footerColumns: [
      {
        title: 'Rooms',
        links: [
          { label: 'Kitchens', url: '/kitchens' },
          { label: 'Bedrooms', url: '/bedrooms' },
          { label: 'Bathrooms', url: '/bathrooms' },
          { label: 'Design service', url: '/design' },
        ],
      },
      {
        title: 'Explore',
        links: [
          { label: 'Projects', url: '/projects' },
          { label: 'Ranges', url: '/ranges' },
          { label: 'Journal', url: '/journal' },
          { label: 'About us', url: '/about' },
        ],
      },
      {
        title: 'Visit',
        links: [
          { label: 'The showroom', url: '/showroom' },
          { label: 'Book an appointment', url: '/book-an-appointment' },
          { label: 'Contact', url: '/contact' },
        ],
      },
    ],
  },
  overrideAccess: true,
})

await payload.updateGlobal({
  slug: 'homepage',
  data: {
    heroSlides: [
      {
        image: heroFor('kitchen', 0),
        headline: 'Kitchens designed around how you live',
        subhead: 'A husband and wife team in Bawtry, designing, supplying and fitting across South Yorkshire.',
        ctaLabel: 'View our kitchens',
        ctaHref: '/kitchens',
      },
      {
        image: heroFor('kitchen', 6),
        headline: 'Independent, so the design leads',
        subhead: 'No call centres and no aftersales department — just the two of us, from first sketch to finished room.',
        ctaLabel: 'See our projects',
        ctaHref: '/projects',
      },
      {
        image: heroFor('bathroom', 0),
        headline: 'Bathrooms planned properly',
        subhead: 'Sanitaryware, storage and lighting considered together rather than one at a time.',
        ctaLabel: 'Book a design visit',
        ctaHref: '/book-an-appointment',
      },
    ],
    introHeading: 'Designed around how you live',
    introBody: richText(
      'We founded Meliora to create beautiful spaces within each client’s home. We design to reflect you and how you want to live, and we encourage you to be fully involved in the design process.',
      'Based in Bawtry, we have a boutique showroom in the town and the business is just the two of us.',
    ),
    introImage: heroFor('kitchen', 4),
    featuredProjects: projects.slice(0, 3),
    featuredRanges: ranges.slice(0, 3),
    testimonials: testimonials.slice(0, 3),
    brands,
    ctaHeading: 'Start your project',
    ctaBody:
      'Book a design visit and we will come to you, measure up and talk through what is possible.',
    ctaLabel: 'Book a showroom visit',
    ctaHref: '/book-an-appointment',
  },
  overrideAccess: true,
})

log('site settings, menus and homepage')

console.log('\nSeed complete.\n')
console.log('Reminder: all photography and testimonials are placeholders.')
console.log('See docs/placeholder-manifest.md before this goes anywhere near production.\n')

process.exit(0)
