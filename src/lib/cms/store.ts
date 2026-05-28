import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { defaultContent } from "./default-content";
import type { SiteContent } from "./types";
import { siteContentSchema } from "./schema";
import { getReviewsStore, saveReviewsStore } from "./reviews-store";

const cmsDir = path.join(process.cwd(), "data", "cms");
const contentPath = path.join(cmsDir, "content.json");

function mergeV3(existing: SiteContent): SiteContent {
  return {
    ...defaultContent,
    ...existing,
    version: 3,
    reviewsEnabled: existing.reviewsEnabled ?? defaultContent.reviewsEnabled,
    contact: { ...defaultContent.contact, ...(existing as Partial<SiteContent>).contact },
    aboutPage: { ...defaultContent.aboutPage, ...(existing as Partial<SiteContent>).aboutPage },
    servisPage: { ...defaultContent.servisPage, ...(existing as Partial<SiteContent>).servisPage },
    reviews: (existing as Partial<SiteContent>).reviews?.length
      ? (existing as Partial<SiteContent>).reviews!
      : defaultContent.reviews,
    faq: (existing as Partial<SiteContent>).faq?.length
      ? (existing as Partial<SiteContent>).faq!
      : defaultContent.faq,
    references: (existing as Partial<SiteContent>).references?.length
      ? (existing as Partial<SiteContent>).references!
      : defaultContent.references,
    home: { ...defaultContent.home, ...(existing as Partial<SiteContent>).home },
    solutions: existing.solutions?.length ? existing.solutions : defaultContent.solutions,
  };
}

export async function ensureCmsFiles() {
  await mkdir(cmsDir, { recursive: true });
  await mkdir(path.join(process.cwd(), "public", "uploads"), { recursive: true });
  await mkdir(path.join(cmsDir, "submissions"), { recursive: true });
  try {
    const raw = await readFile(contentPath, "utf8");
    const parsed = JSON.parse(raw) as SiteContent;
    if (parsed.version >= 3) return;
    const merged = parsed.version >= 2 ? mergeV3(parsed) : defaultContent;
    await writeFile(contentPath, JSON.stringify(merged, null, 2), "utf8");
  } catch {
    await writeFile(contentPath, JSON.stringify(defaultContent, null, 2), "utf8");
  }
}

export async function getContent(): Promise<SiteContent> {
  await ensureCmsFiles();
  const raw = await readFile(contentPath, "utf8");
  if (!raw.trim()) {
    await writeFile(contentPath, JSON.stringify(defaultContent, null, 2), "utf8");
    return defaultContent;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    await writeFile(contentPath, JSON.stringify(defaultContent, null, 2), "utf8");
    return defaultContent;
  }
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "version" in parsed &&
    (parsed as { version: number }).version < 3
  ) {
    const merged =
      (parsed as { version: number }).version >= 2
        ? mergeV3(parsed as SiteContent)
        : defaultContent;
    await writeFile(contentPath, JSON.stringify(merged, null, 2), "utf8");
    return merged;
  }
  const result = siteContentSchema.safeParse({
    ...defaultContent,
    ...(parsed as SiteContent),
    home: { ...defaultContent.home, ...(parsed as Partial<SiteContent>).home },
    aboutPage: { ...defaultContent.aboutPage, ...(parsed as Partial<SiteContent>).aboutPage },
    faq: (parsed as Partial<SiteContent>).faq?.length
      ? (parsed as Partial<SiteContent>).faq
      : defaultContent.faq,
    references: (parsed as Partial<SiteContent>).references?.length
      ? (parsed as Partial<SiteContent>).references
      : defaultContent.references,
  });
  if (result.success) {
    const reviewsStore = await getReviewsStore();
    return {
      ...result.data,
      reviewsEnabled: reviewsStore.enabled,
      reviews: reviewsStore.reviews,
    };
  }
  await writeFile(contentPath, JSON.stringify(defaultContent, null, 2), "utf8");
  return defaultContent;
}

export async function saveContent(content: SiteContent) {
  const parsed = siteContentSchema.parse(content);
  await ensureCmsFiles();
  await saveReviewsStore({
    version: 1,
    enabled: parsed.reviewsEnabled,
    reviews: parsed.reviews,
  });
  const tmp = `${contentPath}.tmp`;
  await writeFile(tmp, JSON.stringify(parsed, null, 2), "utf8");
  await copyFile(tmp, contentPath);
}
