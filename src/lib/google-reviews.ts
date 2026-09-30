/**
 * Live Google reviews, via the Places API (New).
 *
 * Two deliberate constraints:
 *
 * 1. **Nothing is persisted.** Google's terms do not permit caching review
 *    content beyond 30 days, so reviews are fetched and held in Next's fetch
 *    cache for 24 hours and never written to the database. Refresh by
 *    revalidating the `google-reviews` tag.
 * 2. **Failure is silent.** If the key is missing, the quota is exhausted, or
 *    Google is unreachable, this returns null and the site falls back to the
 *    testimonials an editor has entered by hand. A marketing page must never
 *    break because a third party is down.
 */

export type GoogleReview = {
  id: string
  author: string
  authorUrl?: string
  photoUrl?: string
  rating: number
  relativeTime: string
  text: string
}

export type GoogleReviews = {
  mapsUrl?: string
  rating: number
  reviews: GoogleReview[]
  total: number
}

const CACHE_SECONDS = 60 * 60 * 24

type PlacesResponse = {
  googleMapsUri?: string
  rating?: number
  userRatingCount?: number
  reviews?: {
    authorAttribution?: { displayName?: string; photoUri?: string; uri?: string }
    name?: string
    publishTime?: string
    relativePublishTimeDescription?: string
    rating?: number
    text?: { text?: string }
  }[]
}

export const getGoogleReviews = async (): Promise<GoogleReviews | null> => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID

  if (!apiKey || !placeId) return null

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'googleMapsUri,rating,userRatingCount,reviews',
        },
        next: { revalidate: CACHE_SECONDS, tags: ['google-reviews'] },
      },
    )

    if (!response.ok) return null

    const data = (await response.json()) as PlacesResponse

    const reviews = (data.reviews ?? [])
      // Google returns reviews in several languages; this is a UK business, so
      // showing a review the owner cannot read or respond to would be worse
      // than showing fewer.
      .filter((review) => Boolean(review.text?.text))
      .map((review, index) => ({
        author: review.authorAttribution?.displayName ?? 'Google user',
        authorUrl: review.authorAttribution?.uri,
        id: review.name ?? `review-${index}`,
        photoUrl: review.authorAttribution?.photoUri,
        rating: review.rating ?? 0,
        relativeTime: review.relativePublishTimeDescription ?? '',
        text: review.text?.text ?? '',
      }))

    if (reviews.length === 0) return null

    return {
      mapsUrl: data.googleMapsUri,
      rating: data.rating ?? 0,
      reviews,
      total: data.userRatingCount ?? reviews.length,
    }
  } catch {
    return null
  }
}
