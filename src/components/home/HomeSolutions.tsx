import Image from "next/image";
import Link from "next/link";
import type { Solution } from "@/lib/cms/types";
import { HomeReveal } from "@/components/home/HomeReveal";
import { HomeSectionHead } from "@/components/home/HomeSectionHead";
import { SolutionExtraMedia } from "@/components/solutions/SolutionExtraMedia";
import { IMG_QUALITY, imgClass, imgSizes } from "@/lib/image-presets";

const CATALOG_OVERVIEW = {
  href: "/reseni",
  title: "Všechna řešení",
  summary: "Kompletní přehled oblastí, produktových skupin a parametrů montáže.",
};

export function HomeSolutions({
  title,
  description,
  solutions,
}: {
  title: string;
  description: string;
  solutions: Solution[];
}) {
  return (
    <section className="hd-block hd-solutions" aria-labelledby="hd-solutions-title">
      <div className="hd-solutions__mesh" aria-hidden />
      <div className="hd-shell">
        <HomeSectionHead
          id="hd-solutions-title"
          index="01"
          eyebrow="Katalog"
          title={title}
          lead={description}
          align="center"
        />

        <ul className="hd-solutions__grid">
          {solutions.map((solution, index) => (
            <li key={solution.slug}>
              <HomeReveal delay={index * 70}>
                <Link href={`/reseni/${solution.slug}`} className="hd-solution-card">
                  <div className="hd-solution-card__media">
                    <Image
                      src={solution.heroImage}
                      alt=""
                      fill
                      priority={index < 2}
                      quality={IMG_QUALITY}
                      className={imgClass.photo}
                      sizes={imgSizes.catalogThird}
                    />
                    <div className="hd-solution-card__shade" aria-hidden />
                  </div>
                  <div className="hd-solution-card__copy">
                    <span className="hd-solution-card__index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="hd-solution-card__title">{solution.title}</h3>
                    <p className="hd-solution-card__summary">{solution.summary}</p>
                    <span className="hd-solution-card__arrow" aria-hidden>
                      →
                    </span>
                  </div>
                </Link>
              </HomeReveal>
            </li>
          ))}
          <li key="catalog-overview">
            <HomeReveal delay={solutions.length * 70}>
              <Link href={CATALOG_OVERVIEW.href} className="hd-solution-card hd-solution-card--icon">
                <SolutionExtraMedia variant="catalog" />
                <div className="hd-solution-card__copy">
                  <span className="hd-solution-card__index">
                    {String(solutions.length + 1).padStart(2, "0")}
                  </span>
                  <h3 className="hd-solution-card__title">{CATALOG_OVERVIEW.title}</h3>
                  <p className="hd-solution-card__summary">{CATALOG_OVERVIEW.summary}</p>
                  <span className="hd-solution-card__arrow" aria-hidden>
                    →
                  </span>
                </div>
              </Link>
            </HomeReveal>
          </li>
        </ul>
      </div>
    </section>
  );
}
