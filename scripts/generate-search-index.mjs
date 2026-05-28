import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

async function main() {
  const { buildSearchIndex } = require("../src/lib/search-index.ts");
  const contentRaw = await readFile(path.join(root, "data", "cms", "content.json"), "utf8");
  const content = JSON.parse(contentRaw);
  const index = buildSearchIndex(content);
  const outPath = path.join(root, "public", "search-index.json");
  await writeFile(outPath, JSON.stringify(index), "utf8");
  console.log(`search-index.json → ${index.length} položek`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
