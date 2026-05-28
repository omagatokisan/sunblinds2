import type { Review } from "@/lib/cms/types";

const FEATURED_LIMIT = 6;
const FEATURED_MIN_RATING = 4;
const FEATURED_SEED = "sunblinds-reviews-featured";

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Deterministic order — same on server and client (avoids hydration mismatch). */
function stableShuffle<T extends { id: string }>(items: T[], seed: string) {
  return [...items].sort((a, b) => {
    const diff = hashString(`${seed}:${a.id}`) - hashString(`${seed}:${b.id}`);
    return diff !== 0 ? diff : a.id.localeCompare(b.id);
  });
}

function sortReviewsChronologically(reviews: Review[]) {
  return [...reviews].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id)
  );
}

export function splitReviewsForDisplay(reviews: Review[]) {
  const approved = sortReviewsChronologically(
    reviews.filter((review) => review.status === "approved")
  );

  if (approved.length <= FEATURED_LIMIT) {
    return { featured: approved, rest: [] as Review[] };
  }

  const highRated = approved.filter((review) => review.rating >= FEATURED_MIN_RATING);
  const pool = highRated.length >= FEATURED_LIMIT ? highRated : approved;
  const featured = stableShuffle(pool, FEATURED_SEED).slice(0, FEATURED_LIMIT);
  const featuredIds = new Set(featured.map((review) => review.id));
  const rest = approved.filter((review) => !featuredIds.has(review.id));

  return { featured, rest };
}

export function formatReviewStars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}
