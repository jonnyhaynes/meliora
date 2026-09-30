/**
 * TEMPORARY PLACEHOLDER PHOTOGRAPHY.
 *
 * These are stock photographs from Pexels, used only so the site can be
 * designed and reviewed before the real shoot happens. They are NOT Meliora's
 * work and MUST be replaced before launch — presenting another photographer's
 * kitchens as your own would be misrepresentation.
 *
 * See docs/placeholder-manifest.md for the swap-out checklist.
 *
 * Pexels licence: free for commercial use, no attribution required. Credits are
 * recorded anyway, and written into the Media collection's `credit` field.
 */

export type PlaceholderRoom = 'kitchen' | 'bathroom' | 'bedroom'

export type PlaceholderImage = {
  /** Pexels photo id. */
  id: string
  alt: string
  credit: string
  room: PlaceholderRoom
}

export const placeholderImages: PlaceholderImage[] = [
  // ---------------------------------------------------------------- kitchens
  {
    id: '18285887',
    alt: 'Dark wood kitchen with marble worktops and a large central island',
    credit: 'edithub pro / Pexels',
    room: 'kitchen',
  },
  {
    id: '8142046',
    alt: 'Contemporary kitchen with a black marble worktop and handleless cabinets',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'kitchen',
  },
  {
    id: '35021550',
    alt: 'Minimalist kitchen with wood panelling and black marble counters',
    credit: 'Ajit Singh / Pexels',
    room: 'kitchen',
  },
  {
    id: '6903160',
    alt: 'Kitchen with marble surfaces, green velvet chairs and pendant lighting',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'kitchen',
  },
  {
    id: '7031879',
    alt: 'Modern kitchen with a marble-topped dining table and leather chairs',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'kitchen',
  },
  {
    id: '6587896',
    alt: 'Spacious light-filled kitchen with marble flooring and a central island',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'kitchen',
  },
  {
    id: '36777559',
    alt: 'Kitchen with a marble island, wooden cabinetry and stainless steel appliances',
    credit: 'Curtis Adams / Pexels',
    room: 'kitchen',
  },
  {
    id: '14615701',
    alt: 'Kitchen with wooden cabinetry and a marble island',
    credit: 'SCENE DESIGN / Pexels',
    room: 'kitchen',
  },
  {
    id: '36511374',
    alt: 'Bright open-plan kitchen with hardwood floors and pendant lights',
    credit: 'Lee Salem / Pexels',
    room: 'kitchen',
  },
  {
    id: '7587864',
    alt: 'Modern kitchen with a granite island and muted blue cabinetry',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'kitchen',
  },
  {
    id: '6538939',
    alt: 'Black marble kitchen with minimalist cabinetry and white chairs',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'kitchen',
  },
  {
    id: '7214450',
    alt: 'Sleek kitchen interior with wooden panelling and bar stools',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'kitchen',
  },
  {
    id: '7166645',
    alt: 'Kitchen with a round dining table beside tall white cabinetry',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'kitchen',
  },
  {
    id: '26886878',
    alt: 'Contemporary kitchen with open shelving and under-cabinet lighting',
    credit: 'Rana Matloob Hussain / Pexels',
    room: 'kitchen',
  },
  {
    id: '17301027',
    alt: 'Tall portrait view of a bright kitchen with polished surfaces and large windows',
    credit: 'Elizabeth Tamara / Pexels',
    room: 'kitchen',
  },
  {
    id: '13722854',
    alt: 'Detail of white flowers on a marble island in a dark-cabinet kitchen',
    credit: 'Bilal Mansuri / Pexels',
    room: 'kitchen',
  },

  // --------------------------------------------------------------- bathrooms
  {
    id: '7045908',
    alt: 'Bathroom with a freestanding white bath, twin sinks and a mirrored cabinet',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'bathroom',
  },
  {
    id: '6957081',
    alt: 'Contemporary bathroom with a round ceramic bath and wooden vanity unit',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'bathroom',
  },
  {
    id: '7045352',
    alt: 'Bathroom with wood panelling, marble accents and a white basin',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'bathroom',
  },
  {
    id: '6492399',
    alt: 'Bathroom with a walk-in shower, marble tiling and a large window',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'bathroom',
  },
  {
    id: '6394530',
    alt: 'Dark tiled bathroom with a glass shower enclosure and twin basins',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'bathroom',
  },
  {
    id: '35189677',
    alt: 'Marble bathroom with a walk-in shower and brushed brass fittings',
    credit: 'Rana Matloob Hussain / Pexels',
    room: 'bathroom',
  },
  {
    id: '31525748',
    alt: 'Bathroom with marble walls, an illuminated mirror and elegant lighting',
    credit: 'Adryan / Pexels',
    room: 'bathroom',
  },
  {
    id: '8142047',
    alt: 'Basin with a round mirror and marble splashback',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'bathroom',
  },
  {
    id: '17715137',
    alt: 'Close-up of a brass tap above a white basin',
    credit: 'Ivan Drazic / Pexels',
    room: 'bathroom',
  },
  {
    id: '19916748',
    alt: 'Gold shower head against dark marble tiling',
    credit: 'Lisa Anna / Pexels',
    room: 'bathroom',
  },
  {
    id: '7587484',
    alt: 'Bathroom with a white vanity, freestanding bath and green walls',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'bathroom',
  },
  {
    id: '30615188',
    alt: 'Freestanding white bath in a wood-lined, spa-like bathroom',
    credit: 'Vinicius Vieira Fotografia / Pexels',
    room: 'bathroom',
  },

  // ---------------------------------------------------------------- bedrooms
  {
    id: '6585757',
    alt: 'Bedroom with a low bed, bedside tables and pendant lamps',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'bedroom',
  },
  {
    id: '6782568',
    alt: 'Light bedroom with a round table, flowers and soft lighting',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'bedroom',
  },
  {
    id: '8135118',
    alt: 'Spacious bedroom with a dressed bed, chandelier and chest of drawers',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'bedroom',
  },
  {
    id: '8135502',
    alt: 'Bright bedroom with soft neutral furnishings and modern decor',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'bedroom',
  },
  {
    id: '8135289',
    alt: 'Classic bedroom with a large headboard and luxury furnishings',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'bedroom',
  },
  {
    id: '8135505',
    alt: 'Bedroom with deep green bedding and warm low lighting',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'bedroom',
  },
  {
    id: '7535063',
    alt: 'Fitted bedroom in beige with a crystal chandelier and full-height wardrobe',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'bedroom',
  },
  {
    id: '36740614',
    alt: 'Bedroom with an upholstered headboard and textured cushions',
    credit: 'Waqas Ilyas / Pexels',
    room: 'bedroom',
  },
  {
    id: '35203563',
    alt: 'Bedroom with gold accents and dramatic lighting',
    credit: 'Rana Matloob Hussain / Pexels',
    room: 'bedroom',
  },
  {
    id: '18285944',
    alt: 'Sumptuous bedroom with a wide bed and plush furnishings',
    credit: 'edithub pro / Pexels',
    room: 'bedroom',
  },
  {
    id: '20705876',
    alt: 'Bedroom with warm wooden flooring and elegant decor',
    credit: 'albeg / Pexels',
    room: 'bedroom',
  },
  {
    id: '7598138',
    alt: 'Bright modern bedroom with contemporary furniture',
    credit: 'Max Vakhtbovych / Pexels',
    room: 'bedroom',
  },
]

/** Largest sensible rendition the CDN will serve us. */
export const pexelsUrl = (id: string, extension = 'jpeg', width = 2400): string =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${extension}?auto=compress&cs=tinysrgb&w=${width}`

export const imagesFor = (room: PlaceholderRoom): PlaceholderImage[] =>
  placeholderImages.filter((image) => image.room === room)
