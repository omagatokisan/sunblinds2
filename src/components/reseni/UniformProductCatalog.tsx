import type { ProductGroup, Solution } from "@/lib/cms/types";
import { filterCatalogProducts } from "@/lib/product-images";
import { ProductCatalogTile } from "@/components/reseni/ProductCatalogTile";

export function UniformProductCatalog({
  solution,
  group,
  layout = "uniform",
  nameFormat = "default",
}: {
  solution: Solution;
  group: ProductGroup;
  layout?: "uniform" | "category";
  nameFormat?: "default" | "category";
}) {
  const products = filterCatalogProducts(group.products);
  if (!products.length) return null;

  const gridClass =
    layout === "category" ? "hd-product-grid hd-product-grid--category" : "hd-product-grid hd-product-grid--uniform";

  return (
    <ul className={gridClass}>
      {products.map((product, productIndex) => (
        <li key={product.slug}>
          <ProductCatalogTile
            solution={solution}
            group={group}
            product={product}
            index={productIndex + 1}
            nameFormat={nameFormat}
          />
        </li>
      ))}
    </ul>
  );
}
