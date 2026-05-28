import Image from "next/image";
import Link from "next/link";
import type { Solution } from "@/lib/cms/types";
import { IMG_QUALITY, imgClass, imgSizes } from "@/lib/image-presets";

export function SolutionsCatalog({ solutions }: { solutions: Solution[] }) {
  return (
    <ul className="hd-solutions__grid">
      {solutions.map((solution, index) => {
        const count = solution.productGroups.reduce(
          (total, group) => total + group.products.length,
          0
        );

        return (
          <li key={solution.slug}>
            <Link href={`/reseni/${solution.slug}`} className="hd-solution-card">
              <div className="hd-solution-card__media">
                <Image
                  src={solution.heroImage}
                  alt=""
                  fill
                  quality={IMG_QUALITY}
                  className={imgClass.photo}
                  sizes={imgSizes.catalogThird}
                />
                <div className="hd-solution-card__shade" aria-hidden />
              </div>
              <div className="hd-solution-card__copy">
                <span className="hd-solution-card__index">{String(index + 1).padStart(2, "0")}</span>
                <h2 className="hd-solution-card__title">{solution.title}</h2>
                <p className="hd-solution-card__summary">{solution.summary}</p>
                <p className="hd-solution-card__meta">{count} produktů</p>
                <span className="hd-solution-card__arrow" aria-hidden>
                  →
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
