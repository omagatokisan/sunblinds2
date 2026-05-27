import Link from "next/link";
import { Breadcrumb } from "@/components/sections/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/ProductImage";
import { ProductSpecStrip } from "@/components/product/ProductSpecStrip";
import type { ProductDetailView } from "@/lib/product-detail";
import { imgSizes } from "@/lib/image-presets";

type Props = {
  detail: ProductDetailView;
  groupHref: string;
  inquiryHref: string;
  breadcrumbs: { label: string; href?: string }[];
};

export function ProductDetailHero({ detail, groupHref, inquiryHref, breadcrumbs }: Props) {
  const { product, eyebrow, displayName, siblings } = detail;
  const siblingItems = siblings.filter((s) => siblings.length > 1);

  return (
    <section className="pd-hero" aria-labelledby="pd-hero-title">
      <div className="pd-hero__mesh" aria-hidden />
      <div className="hd-shell pd-hero__shell">
        <div className="pd-hero__crumb">
          <Breadcrumb items={breadcrumbs} />
        </div>

        <div className="pd-hero__grid">
          <div className="pd-hero__visual">
            <ProductImage
              product={product}
              alt={product.name}
              sizes={imgSizes.hero}
              priority
              allowFallback
            />
          </div>

          <div className="pd-hero__panel">
            <p className="hd-eyebrow">
              <span className="hd-eyebrow__mark" aria-hidden />
              {eyebrow}
            </p>
            <h1 id="pd-hero-title" className="pd-hero__title">
              {displayName}
            </h1>
            <ProductSpecStrip specs={product.specs} />
            <p className="pd-hero__lead">{product.summary}</p>

            <div className="pd-hero__actions">
              <Button href={inquiryHref} size="lg" className="hd-btn hd-btn--primary">
                Nezávazně poptat
              </Button>
              <Button href={groupHref} variant="secondary" className="hd-btn">
                Skupina produktů
              </Button>
            </div>

            {siblingItems.length ? (
              <div className="pd-siblings">
                <p className="pd-siblings__label">Modely</p>
                <ul className="pd-siblings__list">
                  {siblingItems.map((sib) => (
                    <li key={sib.slug}>
                      {sib.current ? (
                        <span className="pd-siblings__link is-current" aria-current="page">
                          {sib.name}
                        </span>
                      ) : (
                        <Link href={sib.href} className="pd-siblings__link">
                          {sib.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
