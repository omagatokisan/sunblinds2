/**
 * Statický export pro Webglobe FTP → sun.coolgui.cz
 * Výstup: ~/Desktop/web/sun.coolgui.cz-YYYY-MM-DD.zip
 */
import { spawnSync } from "node:child_process";
import {
  copyFile,
  cp,
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "out");
const deployDir = path.join(root, "deploy");

const siteConfig = JSON.parse(
  await readFile(path.join(deployDir, "site.config.json"), "utf8")
);

const middlewarePath = path.join(root, "src", "middleware.ts");
const middlewareBackup = path.join(root, "src", "middleware.static-export.bak");
const apiDir = path.join(root, "src", "app", "api");
const apiBackup = path.join(root, "src", "app", "_api_static_export_bak");
const adminDir = path.join(root, "src", "app", "admin");
const adminBackup = path.join(root, "src", "app", "_admin_static_export_bak");

const staticPages = [
  { type: "page", title: "Úvod", href: "/", excerpt: "Stínění, okna a servis na jednom místě." },
  { type: "page", title: "Řešení", href: "/reseni", excerpt: "Přehled všech oblastí a produktů." },
  { type: "page", title: "O nás", href: "/o-nas", excerpt: "Příběh firmy, showroom a servis." },
  { type: "page", title: "Nezávazná poptávka", href: "/poptavka", excerpt: "Online formulář poptávky." },
  { type: "page", title: "Showroom", href: "/showroom", excerpt: "Showroom Praha – Libuš, mapa a ukázky." },
  { type: "page", title: "Servis", href: "/servis", excerpt: "Záruční i pozáruční servis a ceník." },
  { type: "page", title: "Kontakt", href: "/kontakt", excerpt: "Kontaktujte SunBlinds." },
  { type: "page", title: "Recenze", href: "/recenze", excerpt: "Hodnocení zákazníků." },
  {
    type: "page",
    title: "Ochrana osobních údajů",
    href: "/ochrana-osobnich-udaju",
    excerpt: "Zásady zpracování osobních údajů.",
  },
];

function buildSearchIndex(content) {
  const hits = [...staticPages];
  for (const solution of content.solutions ?? []) {
    hits.push({
      type: "page",
      title: solution.title,
      href: `/reseni/${solution.slug}`,
      excerpt: solution.summary,
    });
    for (const group of solution.productGroups ?? []) {
      hits.push({
        type: "page",
        title: `${group.name} — ${solution.title}`,
        href: `/reseni/${solution.slug}/${group.slug}`,
        excerpt: group.summary,
      });
      for (const product of group.products ?? []) {
        hits.push({
          type: "product",
          title: product.name,
          href: `/reseni/${solution.slug}/${group.slug}/${product.slug}`,
          excerpt: product.summary,
          image: product.image,
          category: `${solution.title} · ${group.name}`,
        });
      }
    }
  }
  return hits;
}

function buildSitemapXml(baseUrl, hits) {
  const urls = hits.map((h) => {
    const loc = h.href === "/" ? baseUrl + "/" : `${baseUrl}${h.href}/`;
    return `  <url><loc>${loc}</loc></url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}

function buildRobotsTxt(baseUrl) {
  return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
}

async function writePhpConfig() {
  const php = `<?php
/**
 * Nastavení pro PHP formuláře na Webglobe.
 * Vygenerováno build:ftp — lze upravit přímo na FTP.
 */
return [
    'mail_to' => '${siteConfig.mailTo}',
    'mail_from' => '${siteConfig.mailFrom}',
    'site_name' => '${siteConfig.siteName.replace(/'/g, "\\'")}',
];
`;
  await writeFile(path.join(deployDir, "api", "config.php"), php, "utf8");
}

function run(cmd, args, env = {}) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, ...env },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

async function swapDir(from, backup) {
  try {
    await rename(from, backup);
    return true;
  } catch {
    return false;
  }
}

async function restoreDir(backup, to) {
  try {
    await rename(backup, to);
  } catch {
    /* ignore */
  }
}

async function zipOut(targetZip) {
  if (process.platform === "win32") {
    run("powershell", [
      "-NoProfile",
      "-Command",
      `Compress-Archive -Path '${outDir.replace(/'/g, "''")}\\*' -DestinationPath '${targetZip.replace(/'/g, "''")}' -Force`,
    ]);
    return;
  }
  run("zip", ["-r", targetZip, "."], { cwd: outDir });
}

async function main() {
  const stamp = new Date().toISOString().slice(0, 10);
  const desktopWeb = path.join(homedir(), "Desktop", "web");
  await mkdir(desktopWeb, { recursive: true });
  const zipPath = path.join(desktopWeb, `${siteConfig.domain}-${stamp}.zip`);
  const baseUrl = siteConfig.baseUrl.replace(/\/$/, "");

  console.log(`→ Cílová doména: ${baseUrl}`);

  console.log("→ Generuji search-index.json …");
  const contentRaw = await readFile(path.join(root, "data", "cms", "content.json"), "utf8");
  const content = JSON.parse(contentRaw);
  const searchIndex = buildSearchIndex(content);
  await writeFile(
    path.join(root, "public", "search-index.json"),
    JSON.stringify(searchIndex),
    "utf8"
  );

  console.log("→ Synchronizuji reviews.json …");
  run("node", ["scripts/ensure-reviews-store.mjs"]);

  console.log("→ Připravuji PHP config …");
  await writePhpConfig();

  console.log("→ Build statického exportu (Next.js) …");
  const mwOff = await swapDir(middlewarePath, middlewareBackup);
  const apiOff = await swapDir(apiDir, apiBackup);
  const adminOff = await swapDir(adminDir, adminBackup);
  try {
    run("npm", ["run", "build"], {
      STATIC_EXPORT: "1",
      NEXT_PUBLIC_STATIC_HOSTING: "1",
      NEXT_PUBLIC_SITE_URL: baseUrl,
    });
  } finally {
    await restoreDir(adminBackup, adminDir);
    await restoreDir(apiBackup, apiDir);
    await restoreDir(middlewareBackup, middlewarePath);
  }

  try {
    await stat(outDir);
  } catch {
    console.error("Chybí složka out/ — build exportu selhal.");
    process.exit(1);
  }

  console.log("→ Kopíruji .htaccess, PHP, sitemap, robots …");
  await copyFile(path.join(deployDir, ".htaccess"), path.join(outDir, ".htaccess"));
  await cp(path.join(deployDir, "api"), path.join(outDir, "api"), { recursive: true });
  await cp(path.join(deployDir, "data"), path.join(outDir, "data"), { recursive: true });
  await copyFile(
    path.join(root, "data", "cms", "reviews.json"),
    path.join(outDir, "data", "reviews.json")
  );
  await copyFile(
    path.join(root, "public", "search-index.json"),
    path.join(outDir, "search-index.json")
  );
  await writeFile(path.join(outDir, "robots.txt"), buildRobotsTxt(baseUrl), "utf8");
  await writeFile(path.join(outDir, "sitemap.xml"), buildSitemapXml(baseUrl, searchIndex), "utf8");
  await copyFile(path.join(deployDir, "NAVOD-WEBGLOBE.md"), path.join(outDir, "NAVOD-WEBGLOBE.md"));

  console.log("→ Odstraňuji nefunkční /admin z exportu …");
  await rm(path.join(outDir, "admin"), { recursive: true, force: true });

  console.log("→ Balím ZIP …");
  await rm(zipPath, { force: true });
  await zipOut(zipPath);

  const fileStat = await stat(zipPath);
  const mb = (fileStat.size / (1024 * 1024)).toFixed(2);

  console.log("");
  console.log("Hotovo — připraveno pro FTP upload.");
  console.log(`Doména: ${baseUrl}`);
  console.log(`ZIP: ${zipPath}`);
  console.log(`Velikost: ${mb} MB`);
  console.log("");
  console.log("Postup:");
  console.log("  1. Rozbalte ZIP do kořene subdomény sun.coolgui.cz (musí tam být index.html + .htaccess)");
  console.log("  2. Upravte api/config.php pokud potřebujete jiný e-mail");
  console.log("  3. Nastavte oprávnění zápisu pro složku data/ (chmod 755 nebo 775)");
  console.log("  4. Otevřete https://sun.coolgui.cz/");
  console.log("");
  console.log("Návod: deploy/NAVOD-WEBGLOBE.md");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
