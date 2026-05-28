import Image from "next/image";
import Link from "next/link";
import type { Solution } from "@/lib/cms/types";
import { SolutionExtraMedia } from "@/components/solutions/SolutionExtraMedia";
import { IMG_QUALITY, imgClass, imgSizes } from "@/lib/image-presets";

const EXTRA_TILE = {
  href: "/poptavka",
  title: "Nezávazná poptávka",
  summary: "Vyberte produkty, rozměry a odešlete poptávku online — rychlá cesta k nabídce.",
  meta: "Online formulář",
};

export function SolutionsCatalog({ solutions }: { solutions: Solution[] }) {
  return (
    <ul className="hd-solutions__grid hd-solutions__grid--hub">
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
      <li key="solution-extra">
        <Link href={EXTRA_TILE.href} className="hd-solution-card hd-solution-card--extra hd-solution-card--icon">
          <SolutionExtraMedia variant="inquiry" />
          <div className="hd-solution-card__copy">
            <span className="hd-solution-card__index">{String(solutions.length + 1).padStart(2, "0")}</span>
            <h2 className="hd-solution-card__title">{EXTRA_TILE.title}</h2>
            <p className="hd-solution-card__summary">{EXTRA_TILE.summary}</p>
            <p className="hd-solution-card__meta">{EXTRA_TILE.meta}</p>
            <span className="hd-solution-card__arrow" aria-hidden>
              →
            </span>
          </div>
        </Link>
      </li>
    </ul>
  );
}
