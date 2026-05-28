"use client";

import Image from "next/image";
import Link from "next/link";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { SearchPageHit, SearchProductHit } from "@/lib/search-index";
import { searchIndex, type SearchHit } from "@/lib/search-index";
import { isStaticHosting } from "@/lib/static-hosting";
import { IMG_QUALITY, imgClass, imgSizes } from "@/lib/image-presets";
import { isValidProductImage } from "@/lib/product-images";

type Props = {
  variant?: "compact" | "hero" | "header";
  placeholder?: string;
  className?: string;
};

export type GlobalSearchHandle = {
  focus: () => void;
};

export const GlobalSearch = forwardRef<GlobalSearchHandle, Props>(function GlobalSearch(
  { variant = "compact", placeholder = "Hledat produkty a stránky…", className = "" },
  ref
) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pages, setPages] = useState<SearchPageHit[]>([]);
  const [products, setProducts] = useState<SearchProductHit[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const staticIndexRef = useRef<SearchHit[] | null>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      setOpen(true);
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    },
  }));

  const flatResults = [
    ...pages.map((p) => ({ kind: "page" as const, hit: p })),
    ...products.map((p) => ({ kind: "product" as const, hit: p })),
  ];

  const fetchResults = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setPages([]);
      setProducts([]);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (isStaticHosting()) {
        if (!staticIndexRef.current) {
          const res = await fetch("/search-index.json");
          if (!res.ok) throw new Error("Chybí soubor search-index.json");
          staticIndexRef.current = (await res.json()) as SearchHit[];
        }
        const result = searchIndex(staticIndexRef.current, q.trim());
        setPages(result.pages);
        setProducts(result.products);
        return;
      }

      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      if (!res.ok) throw new Error("Vyhledávání není dostupné");
      const data = (await res.json()) as { pages: SearchPageHit[]; products: SearchProductHit[] };
      setPages(data.pages ?? []);
      setProducts(data.products ?? []);
    } catch (err) {
      setPages([]);
      setProducts([]);
      setError(err instanceof Error ? err.message : "Vyhledávání selhalo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchResults(query);
    }, 200);
    return () => window.clearTimeout(t);
  }, [query, fetchResults]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const hasResults = pages.length > 0 || products.length > 0;
  const showPanel = open && query.trim().length >= 2;

  const isHero = variant === "hero";
  const isHeader = variant === "header";

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <div
        className={`search-field ${isHeader ? "search-field--header" : ""} ${isHero ? "px-5 py-3.5 text-white" : isHeader ? "" : "px-4 py-2.5"}`}
      >
        <svg
          className={`h-4 w-4 shrink-0 ${
            isHero ? "text-white/70" : isHeader ? "text-muted-light" : "text-muted"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!flatResults.length) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && activeIndex >= 0) {
              e.preventDefault();
              window.location.href = flatResults[activeIndex].hit.href;
            } else if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={placeholder}
          aria-label="Vyhledávání"
          aria-expanded={showPanel}
          aria-controls={listId}
          className={`min-w-0 flex-1 bg-transparent outline-none placeholder:opacity-60 ${
            isHero
              ? "text-sm text-white placeholder:text-white/60"
              : isHeader
                ? "text-sm placeholder:text-muted-light"
                : "text-sm"
          }`}
        />
        {isHeader ? (
          <kbd className="search-field__hint" aria-hidden>
            Ctrl K
          </kbd>
        ) : (
          <kbd
            className={`hidden rounded-md px-2 py-0.5 text-[10px] font-medium sm:inline ${
              isHero ? "bg-white/10 text-white/60" : "bg-canvas text-muted"
            }`}
          >
            Ctrl K
          </kbd>
        )}
      </div>

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          className={`search-panel ${isHeader ? "search-panel--header" : ""}`}
        >
          {loading ? (
            <p className="search-panel__empty">Hledám…</p>
          ) : error ? (
            <p className="search-panel__empty">{error}</p>
          ) : !hasResults ? (
            <p className="search-panel__empty">Nic nenalezeno pro „{query}"</p>
          ) : (
            <>
              {pages.length > 0 ? (
                <section className="mb-1">
                  <p className="search-panel__section-title">Stránky</p>
                  <ul>
                    {pages.map((page, i) => {
                      const idx = i;
                      return (
                        <li key={page.href}>
                          <Link
                            href={page.href}
                            role="option"
                            aria-selected={activeIndex === idx}
                            onClick={() => setOpen(false)}
                            className={`search-panel__item ${activeIndex === idx ? "is-active" : ""}`}
                          >
                            <span className="search-panel__icon" aria-hidden>
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </span>
                            <span className="min-w-0">
                              <span className="search-panel__title">{page.title}</span>
                              <span className="search-panel__meta line-clamp-1">{page.excerpt}</span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}

              {pages.length > 0 && products.length > 0 ? (
                <div className="search-panel__divider" />
              ) : null}

              {products.length > 0 ? (
                <section>
                  <p className="search-panel__section-title">Produkty</p>
                  <ul>
                    {products.map((product, i) => {
                      const idx = pages.length + i;
                      return (
                        <li key={product.href}>
                          <Link
                            href={product.href}
                            role="option"
                            aria-selected={activeIndex === idx}
                            onClick={() => setOpen(false)}
                            className={`search-panel__item search-panel__item--row ${activeIndex === idx ? "is-active" : ""}`}
                          >
                            <div className="search-panel__thumb">
                              {isValidProductImage(product.image) ? (
                                <Image
                                  src={product.image}
                                  alt=""
                                  fill
                                  quality={IMG_QUALITY}
                                  className={imgClass.product}
                                  sizes={imgSizes.searchThumb}
                                />
                              ) : null}
                            </div>
                            <span className="min-w-0 flex-1">
                              <span className="search-panel__title truncate">{product.title}</span>
                              <span className="search-panel__meta search-panel__meta--brand">{product.category}</span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
});
