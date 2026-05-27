import Link from "next/link";
import { SectionHead } from "@/components/sections/SectionHead";
import type { Product, ProductHotspot } from "@/lib/cms/types";
import { ProductImage } from "@/components/ui/ProductImage";
import { imgSizes } from "@/lib/image-presets";

type Props = {
  product: Pick<Product, "name" | "image" | "slug">;
  groupSlug?: string;
  solutionSlug?: string;
  details: ProductHotspot[];
};

export function ProductTechnicalOverview({ product, groupSlug, solutionSlug, details }: Props) {
  if (!details.length) return null;

  return (
    <section className="pd-section" id="technika">
      <div className="hd-shell">
        <SectionHead eyebrow="Technika" title="Parametry a konstrukce" align="left" />

        <div className="pd-tech">
          <div className="pd-tech__visual">
            <ProductImage
              product={product}
              groupSlug={groupSlug}
              solutionSlug={solutionSlug}
              sizes={imgSizes.half}
            />
          </div>

          <div className="pd-tech__accordion" role="list">
            {details.map((item, index) => (
              <details
                key={item.id}
                className="pd-tech__row"
                open={index === 0}
                role="listitem"
              >
                <summary className="pd-tech__row-head">
                  <span>{item.title}</span>
                  <span className="pd-tech__chevron" aria-hidden />
                </summary>
                <div className="pd-tech__row-body">
                  <p>{item.text}</p>
                  {item.link ? (
                    <Link href={item.link.href} className="hd-link mt-3 inline-block">
                      {item.link.label} →
                    </Link>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
