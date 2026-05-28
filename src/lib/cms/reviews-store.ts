import { readFile, writeFile, mkdir, copyFile, access } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { defaultContent } from "./default-content";
import { SAMPLE_REVIEWS } from "./sample-reviews";
import { REVIEW_TEXT_MAX } from "@/lib/reviews/constants";
import type { Review } from "./types";

const cmsDir = path.join(process.cwd(), "data", "cms");
const reviewsPath = path.join(cmsDir, "reviews.json");
const contentPath = path.join(cmsDir, "content.json");

const reviewSchema = z.object({
  id: z.string(),
  author: z.string().max(120),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(REVIEW_TEXT_MAX),
  location: z.string().max(120).optional(),
  productHint: z.string().max(200).optional(),
  source: z.enum(["customer", "manual"]),
  status: z.enum(["pending", "approved", "rejected"]),
  createdAt: z.string().max(40),
});

const reviewsStoreSchema = z.object({
  version: z.literal(1),
  enabled: z.boolean(),
  reviews: z.array(reviewSchema).max(200),
});

export type ReviewsStore = z.infer<typeof reviewsStoreSchema>;

const defaultStore: ReviewsStore = {
  version: 1,
  enabled: defaultContent.reviewsEnabled,
  reviews: SAMPLE_REVIEWS,
};

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function migrateFromContentJson(): Promise<ReviewsStore> {
  try {
    const raw = await readFile(contentPath, "utf8");
    const parsed = JSON.parse(raw) as { reviews?: Review[]; reviewsEnabled?: boolean };
    return {
      version: 1,
      enabled: parsed.reviewsEnabled ?? defaultStore.enabled,
      reviews: parsed.reviews?.length ? parsed.reviews : defaultStore.reviews,
    };
  } catch {
    return defaultStore;
  }
}

export async function ensureReviewsStore() {
  await mkdir(cmsDir, { recursive: true });
  if (await fileExists(reviewsPath)) return;

  const migrated = await migrateFromContentJson();
  await writeFile(reviewsPath, JSON.stringify(migrated, null, 2), "utf8");
}

export async function getReviewsStore(): Promise<ReviewsStore> {
  await ensureReviewsStore();
  const raw = await readFile(reviewsPath, "utf8");
  const parsed = reviewsStoreSchema.safeParse(JSON.parse(raw));
  if (parsed.success) return parsed.data;

  const migrated = await migrateFromContentJson();
  await saveReviewsStore(migrated);
  return migrated;
}

export async function saveReviewsStore(store: ReviewsStore) {
  const parsed = reviewsStoreSchema.parse(store);
  await ensureReviewsStore();
  const tmp = `${reviewsPath}.tmp`;
  await writeFile(tmp, JSON.stringify(parsed, null, 2), "utf8");
  await copyFile(tmp, reviewsPath);
}

export async function addReview(review: Review) {
  const store = await getReviewsStore();
  store.reviews.unshift(review);
  await saveReviewsStore(store);
  return review;
}

export function getApprovedReviews(store: ReviewsStore): Review[] {
  if (!store.enabled) return [];
  return store.reviews.filter((review) => review.status === "approved");
}

/** Pro FTP export — synchronizace do deploy/data */
export async function exportReviewsForDeploy(): Promise<ReviewsStore> {
  return getReviewsStore();
}
