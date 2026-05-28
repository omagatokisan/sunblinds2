"use client";

import { useEffect, useMemo, useState } from "react";
import type { Solution } from "@/lib/cms/types";
import { getSolutionCatalogGroups, productCountLabel } from "@/lib/solution-catalog";
import { UniformProductCatalog } from "@/components/reseni/UniformProductCatalog";

type FilterValue = "all" | string;

function readHashFilter(validSlugs: string[]): FilterValue {
  if (typeof window === "undefined") return "all";
  const slug = window.location.hash.replace(/^#/, "");
  return validSlugs.includes(slug) ? slug : "all";
}

export function SolutionCatalogPanel({ solution }: { solution: Solution }) {
  const groups = useMemo(() => getSolutionCatalogGroups(solution), [solution]);
  const slugs = useMemo(() => groups.map(({ group }) => group.slug), [groups]);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  useEffect(() => {
    setActiveFilter(readHashFilter(slugs));

    const onHashChange = () => setActiveFilter(readHashFilter(slugs));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [slugs]);

  const visibleGroups =
    activeFilter === "all" ? groups : groups.filter(({ group }) => group.slug === activeFilter);

  const setFilter = (value: FilterValue) => {
    setActiveFilter(value);
    const nextHash = value === "all" ? "" : `#${value}`;
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
  };

  return (
    <div className="solution-catalog-panel">
      <nav className="solution-catalog-filter" aria-label="Filtrovat podle kategorie">
        <ul className="solution-catalog-filter__list">
          <li>
            <button
              type="button"
              className="solution-catalog-filter__btn"
              aria-pressed={activeFilter === "all"}
              onClick={() => setFilter("all")}
            >
              Vše
              <span className="solution-catalog-filter__count">{groups.reduce((sum, g) => sum + g.count, 0)}</span>
            </button>
          </li>
          {groups.map(({ group, count }) => (
            <li key={group.slug}>
              <button
                type="button"
                className="solution-catalog-filter__btn"
                aria-pressed={activeFilter === group.slug}
                onClick={() => setFilter(group.slug)}
              >
                {group.name}
                <span className="solution-catalog-filter__count">{count}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="solution-catalog">
        {visibleGroups.map(({ group, count }) => (
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
    </div>
  );
}
