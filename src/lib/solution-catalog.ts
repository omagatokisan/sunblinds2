import type { ProductGroup, Solution } from "@/lib/cms/types";
import { filterCatalogProducts } from "@/lib/product-images";

export function catalogProductCount(group: ProductGroup) {
  return filterCatalogProducts(group.products).length;
}

export function productCountLabel(count: number) {
  if (count === 1) return "1 produkt";
  if (count >= 2 && count <= 4) return `${count} produkty`;
  return `${count} produktů`;
}

export function getSolutionCatalogGroups(solution: Solution) {
  return solution.productGroups
    .map((group) => ({ group, count: catalogProductCount(group) }))
    .filter(({ count }) => count > 0);
}
