import type { ProductGroup, Solution } from "@/lib/cms/types";
import { getSolutionCatalogGroups, productCountLabel } from "@/lib/solution-catalog";
import { UniformProductCatalog } from "@/components/reseni/UniformProductCatalog";

/** Statický katalog bez filtru — pro případné reuse mimo solution page. */
export function SolutionCategoryCatalog({ solution }: { solution: Solution }) {
  const groups = getSolutionCatalogGroups(solution);

  return (
    <div className="solution-catalog">
      {groups.map(({ group, count }) => (
        <section
          key={group.slug}
          id={group.slug}
          className="solution-catalog-section"
          aria-labelledby={`catalog-${group.slug}`}
        >
          <header className="solution-catalog-section-head">
            <p className="label-caps label-caps--plain">{productCountLabel(count)}</p>
            <h2 id={`catalog-${group.slug}`} className="solution-catalog-section-title">
              {group.name}
            </h2>
            {group.summary ? (
              <p className="solution-catalog-section-lead">{group.summary}</p>
            ) : null}
          </header>
          <UniformProductCatalog solution={solution} group={group} layout="category" nameFormat="category" />
        </section>
      ))}
    </div>
  );
}
