import type {
  Product,
  ProductDesignOption,
  ProductDownload,
  ProductGroup,
  ProductHotspot,
  ProductRelatedTopic,
  Solution,
} from "@/lib/cms/types";
import { filterCatalogProducts, isValidProductImage, resolveProductImage } from "@/lib/product-images";
import { RELATED_TOPIC_IMAGES } from "@/data/site-visuals";

/** VEKAMOTION-style anchor positions on technical diagram */
const HOTSPOT_LAYOUT: { x: number; y: number }[] = [
  { x: 42, y: 48 },
  { x: 58, y: 82 },
  { x: 75, y: 45 },
  { x: 79, y: 81 },
  { x: 41, y: 34 },
  { x: 68, y: 62 },
  { x: 52, y: 22 },
  { x: 88, y: 58 },
];

export type ProductSibling = {
  slug: string;
  name: string;
  href: string;
  current: boolean;
};

export type ProductDetailView = {
  product: Product;
  eyebrow: string;
  displayName: string;
  diagramImage: string;
  hotspots: ProductHotspot[];
  designOptions: ProductDesignOption[];
  downloads: ProductDownload[];
  relatedTopics: ProductRelatedTopic[];
  siblings: ProductSibling[];
};

function shortProductName(name: string) {
  const parts = name.split(/\s+/);
  const brand = parts.find((p) => /^[A-Z][a-z0-9]+$/.test(p) && p.length <= 12);
  if (brand) return brand;
  return parts.slice(-2).join(" ") || name;
}

function buildHotspots(product: Product): ProductHotspot[] {
  if (product.hotspots?.length) return product.hotspots;

  return product.specs.slice(0, HOTSPOT_LAYOUT.length).map((spec, i) => ({
    id: `hs-${i}`,
    x: HOTSPOT_LAYOUT[i].x,
    y: HOTSPOT_LAYOUT[i].y,
    title: spec.label,
    text: `${spec.label}: ${spec.value}.`,
  }));
}

function buildDesignOptions(
  product: Product,
  group: ProductGroup,
  solution: Solution,
  solutionSlug: string,
  groupSlug: string
): ProductDesignOption[] {
  if (product.designOptions?.length) return product.designOptions;

  const siblings = filterCatalogProducts(group.products)
    .filter((p) => p.slug !== product.slug)
    .slice(0, 2)
    .map((p) => ({
      id: `sib-${p.slug}`,
      title: shortProductName(p.name),
      description: p.summary.slice(0, 140) + (p.summary.length > 140 ? "…" : ""),
      image: isValidProductImage(p.image) ? p.image : product.image,
      href: `/reseni/${solutionSlug}/${groupSlug}/${p.slug}`,
    }));

  const mounting: ProductDesignOption = {
    id: "mounting",
    title: "Montáž",
    description: "Zabudování, předsazení nebo dodatečná montáž podle typu stavby.",
    image: product.image,
    href: "/poptavka",
  };

  const control: ProductDesignOption = {
    id: "control",
    title: "Ovládání",
    description: "Manuální ovládání, motor nebo napojení na chytrou domácnost.",
    image: product.image,
    href: "/poptavka",
  };

  return [...siblings, mounting, control].slice(0, 3);
}

function buildDownloads(product: Product, _displayName: string): ProductDownload[] {
  return product.downloads?.length ? product.downloads : [];
}

function enrichRelatedTopicImages(topics: ProductRelatedTopic[]): ProductRelatedTopic[] {
  const imageById: Record<string, string> = {
    showroom: RELATED_TOPIC_IMAGES.showroom,
    servis: RELATED_TOPIC_IMAGES.servis,
    poptavka: RELATED_TOPIC_IMAGES.poptavka,
  };

  return topics.map((topic) => ({
    ...topic,
    image: topic.image ?? imageById[topic.id],
  }));
}

function buildRelatedTopics(
  product: Product,
  solution: Solution,
  solutionSlug: string,
  groupSlug: string
): ProductRelatedTopic[] {
  if (product.relatedTopics?.length) return enrichRelatedTopicImages(product.relatedTopics);

  const group = solution.productGroups.find((g) => g.slug === groupSlug);
  const groupImage = group?.image;

  return [
    {
      id: "poptavka",
      title: "Nezávazná poptávka",
      description: "Rozměry, typ objektu a termín — připravíme nabídku.",
      href: `/poptavka?produkt=${encodeURIComponent(product.name)}`,
      image: RELATED_TOPIC_IMAGES.poptavka,
    },
    {
      id: "group",
      title: group?.name ?? "Skupina produktů",
      description: "Další modely ve stejné kategorii.",
      href: `/reseni/${solutionSlug}/${groupSlug}`,
      ...(isValidProductImage(groupImage) ? { image: groupImage } : {}),
    },
    {
      id: "servis",
      title: "Servis",
      description: "Seřízení, výměny dílů a následná péče.",
      href: "/servis",
      image: RELATED_TOPIC_IMAGES.servis,
    },
  ];
}

export function buildProductDetailView(
  product: Product,
  group: ProductGroup,
  solution: Solution,
  solutionSlug: string,
  groupSlug: string
): ProductDetailView {
  const displayName = shortProductName(product.name);

  return {
    product,
    eyebrow: product.eyebrow ?? group.name,
    displayName,
    diagramImage: product.diagramImage ?? product.image,
    hotspots: buildHotspots(product),
    designOptions: buildDesignOptions(product, group, solution, solutionSlug, groupSlug),
    downloads: buildDownloads(product, displayName),
    relatedTopics: buildRelatedTopics(product, solution, solutionSlug, groupSlug),
    siblings: group.products.map((p) => ({
      slug: p.slug,
      name: shortProductName(p.name),
      href: `/reseni/${solutionSlug}/${groupSlug}/${p.slug}`,
      current: p.slug === product.slug,
    })),
  };
}
