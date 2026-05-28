import type { SiteContent } from "@/lib/cms/types";

export type SearchPageHit = {
  type: "page";
  title: string;
  href: string;
  excerpt: string;
};

export type SearchProductHit = {
  type: "product";
  title: string;
  href: string;
  excerpt: string;
  image: string;
  category: string;
};

export type SearchHit = SearchPageHit | SearchProductHit;

const staticPages: SearchPageHit[] = [
  { type: "page", title: "Úvod", href: "/", excerpt: "Stínění, okna a servis na jednom místě." },
  { type: "page", title: "Řešení", href: "/reseni", excerpt: "Přehled všech oblastí a produktů." },
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

export function buildSearchIndex(content: SiteContent): SearchHit[] {
  const hits: SearchHit[] = [...staticPages];

  for (const solution of content.solutions) {
    hits.push({
      type: "page",
      title: solution.title,
      href: `/reseni/${solution.slug}`,
      excerpt: solution.summary,
    });

    for (const group of solution.productGroups) {
      hits.push({
        type: "page",
        title: `${group.name} — ${solution.title}`,
        href: `/reseni/${solution.slug}/${group.slug}`,
        excerpt: group.summary,
      });

      for (const product of group.products) {
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

export function searchIndex(hits: SearchHit[], query: string, limit = 12) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return { pages: [] as SearchPageHit[], products: [] as SearchProductHit[] };

  const terms = q.split(/\s+/).filter(Boolean);

  const scored = hits
    .map((hit) => {
      const hay = `${hit.title} ${hit.excerpt} ${hit.type === "product" ? hit.category : ""}`.toLowerCase();
      if (!terms.every((term) => hay.includes(term))) return null;
      const score = hay.indexOf(terms[0]);
      return { hit, score: score === -1 ? 999 : score };
    })
    .filter(Boolean) as { hit: SearchHit; score: number }[];

  scored.sort((a, b) => a.score - b.score || a.hit.title.localeCompare(b.hit.title, "cs"));

  const pages = scored.filter((s) => s.hit.type === "page").slice(0, limit).map((s) => s.hit as SearchPageHit);
  const products = scored
    .filter((s) => s.hit.type === "product")
    .slice(0, limit)
    .map((s) => s.hit as SearchProductHit);

  return { pages, products };
}
