import { readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const cmsDir = path.join(root, "data", "cms");
const reviewsPath = path.join(cmsDir, "reviews.json");
const seedPath = path.join(cmsDir, "reviews.seed.json");
const contentPath = path.join(cmsDir, "content.json");

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (await fileExists(reviewsPath)) {
    console.log("reviews.json already exists");
    return;
  }

  if (await fileExists(seedPath)) {
    const seed = await readFile(seedPath, "utf8");
    await writeFile(reviewsPath, seed, "utf8");
    const parsed = JSON.parse(seed);
    console.log(`reviews.json → ${parsed.reviews?.length ?? 0} recenzí (seed)`);
    return;
  }

  let store = { version: 1, enabled: true, reviews: [] };

  try {
    const raw = await readFile(contentPath, "utf8");
    const content = JSON.parse(raw);
    store = {
      version: 1,
      enabled: content.reviewsEnabled ?? true,
      reviews: content.reviews ?? [],
    };
  } catch {
    /* keep defaults */
  }

  await writeFile(reviewsPath, JSON.stringify(store, null, 2), "utf8");
  console.log(`reviews.json → ${store.reviews.length} recenzí`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
