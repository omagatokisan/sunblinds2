"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { SunBlindsLogo } from "@/components/layout/SunBlindsLogo";
import { HEADER_NAV, type HeaderNavItem, type HeaderTextLink } from "@/data/header-nav";
import { company } from "@/data/company";
import type { Solution } from "@/lib/cms/types";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GlobalSearch, type GlobalSearchHandle } from "@/components/search/GlobalSearch";
import { IMG_QUALITY, imgClass, imgSizes } from "@/lib/image-presets";

type StripItem = { href: string; label: string; image: string; description?: string };

export function SiteHeader({ solutions }: { solutions: Solution[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeMenus = useCallback(() => {
    clearCloseTimer();
    setOpenMenu(null);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpenMenu(null), 200);
  }, [clearCloseTimer]);

  const openMenuItem = useCallback(
    (id: string) => {
      clearCloseTimer();
      setOpenMenu(id);
    },
    [clearCloseTimer]
  );

  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  useEffect(() => {
    setMobileOpen(false);
    closeMenus();
  }, [pathname, closeMenus]);

  const reseniItems = useMemo<StripItem[]>(
    () =>
      solutions.map((s) => ({
        href: `/reseni/${s.slug}`,
        label: s.shortTitle,
        image: s.heroImage,
        description: s.summary,
      })),
    [solutions]
  );

  const navById = useMemo(() => new Map(HEADER_NAV.map((item) => [item.id, item])), []);

  if (pathname.startsWith("/admin")) return null;

  const activeNav = openMenu ? navById.get(openMenu) : undefined;
  const showDrop =
    Boolean(activeNav) &&
    (openMenu === "reseni" ? reseniItems.length > 0 : Boolean(activeNav?.items?.length));

  return (
    <header className="site-header site-header--home">
      <div className="site-header__main">
        <div className="site-header__decor" aria-hidden>
          <span className="site-header__glow site-header__glow--brand" />
          <span className="site-header__glow site-header__glow--soft" />
          <span className="site-header__mesh" />
          <span className="site-header__accent-line" />
        </div>
        <Container width="wide" className="site-header__inner">
          <SunBlindsLogo variant="header" className="shrink-0" />

          <nav
            className="site-header__nav"
            aria-label="Hlavní navigace"
            onMouseLeave={scheduleClose}
          >
            {HEADER_NAV.map((item) => (
              <div key={item.id} onMouseEnter={() => openMenuItem(item.id)}>
                <NavLink
                  href={item.href}
                  label={item.label}
                  active={item.match(pathname)}
                  open={openMenu === item.id}
                />
              </div>
            ))}
          </nav>

          <div className="site-header__actions">
            <div className="site-header__actions-group">
              <HeaderSearchInline onOpen={closeMenus} />
              <span className="site-header__actions-divider" aria-hidden />
              <a href={company.phoneHref} className="site-header__phone site-header__phone--pill">
                <PhoneIcon />
                <span>{company.phone}</span>
              </a>
              <Button href="/poptavka" size="lg">
                Poptávka
              </Button>
            </div>
          </div>

          <div className="header-mobile-actions">
            <a
              href={company.phoneHref}
              className="header-icon-btn"
              aria-label={`Zavolat ${company.phone}`}
            >
              <PhoneIcon />
            </a>
            <HeaderSearchInline compact onOpen={closeMenus} />
            <button
              type="button"
              className="header-icon-btn header-icon-btn--menu"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Zavřít menu" : "Otevřít menu"}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </Container>
      </div>

      {showDrop && activeNav ? (
        <>
          <button
            type="button"
            className="header-drop-backdrop"
            aria-label="Zavřít menu"
            tabIndex={-1}
            onMouseEnter={closeMenus}
            onClick={closeMenus}
          />
          <div
            className="header-drop-wrap"
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
          >
            <div className={`header-drop ${openMenu !== "reseni" ? "header-drop--compact" : ""}`}>
              <div
                className={`header-drop__inner ${openMenu !== "reseni" ? "header-drop__inner--compact" : ""}`}
                role="region"
                aria-label={`Menu ${activeNav.label}`}
              >
                <Container width="wide">
                  {openMenu === "reseni" ? (
                    <HeaderReseniPanel menu={activeNav} items={reseniItems} />
                  ) : (
                    <HeaderCompactPanel menu={activeNav} />
                  )}
                </Container>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {mobileOpen ? (
        <div className="site-header-mobile site-header-mobile--dark lg:hidden">
          <Container width="wide" className="max-h-[70vh] overflow-y-auto py-4">
            <div className="mb-4 px-1">
              <GlobalSearch variant="compact" placeholder="Hledat…" />
            </div>

            {HEADER_NAV.map((item) => (
              <MobileNavSection
                key={item.id}
                item={item}
                reseniItems={item.id === "reseni" ? reseniItems : undefined}
                onClose={() => setMobileOpen(false)}
              />
            ))}

            <div className="mt-5 px-1">
              <Button href="/poptavka" className="w-full justify-center">
                Nezávazná poptávka
              </Button>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}

function HeaderSearchInline({ compact, onOpen }: { compact?: boolean; onOpen?: () => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<GlobalSearchHandle>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={[
        "header-search-inline",
        compact ? "header-search-inline--compact" : "",
        open ? "header-search-inline--open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={() => {
        if (!compact) onOpen?.();
      }}
    >
      <div className="header-search-inline__field">
        <GlobalSearch
          ref={searchRef}
          variant="header"
          placeholder="Hledat…"
          className="header-search-inline__input"
        />
      </div>
      <button
        type="button"
        className="header-search-inline__trigger header-icon-btn"
        aria-expanded={open}
        aria-label="Hledat"
        onClick={() => {
          onOpen?.();
          setOpen(true);
          searchRef.current?.focus();
        }}
      >
        <SearchIcon />
      </button>
    </div>
  );
}

function NavLink({
  href,
  label,
  active,
  open,
}: {
  href: string;
  label: string;
  active: boolean;
  open?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`nav-link nav-link--menu ${active ? "nav-link-active" : ""} ${open ? "nav-link-open" : ""}`}
      aria-expanded={open}
    >
      {label}
    </Link>
  );
}

function HeaderReseniPanel({ menu, items }: { menu: HeaderNavItem; items: StripItem[] }) {
  return (
    <div className="header-text-panel header-text-panel--reseni">
      <div className="header-text-intro">
        <p className="header-text-eyebrow">Katalog oblastí</p>
        <p className="header-text-kicker">{menu.label}</p>
        {menu.intro ? <p className="header-text-lead">{menu.intro}</p> : null}
        <Link href={menu.href} className="header-text-all link-arrow">
          Všechna řešení
        </Link>
      </div>
      <HeaderStrip items={items} />
    </div>
  );
}

function HeaderCompactPanel({ menu }: { menu: HeaderNavItem }) {
  return (
    <div className="header-compact-panel">
      <div className="header-compact-panel__intro">
        <p className="header-compact-panel__eyebrow">Rychlé odkazy</p>
        <p className="header-compact-panel__kicker">{menu.label}</p>
        {menu.intro ? <p className="header-compact-panel__lead">{menu.intro}</p> : null}
        <Link href={menu.href} className="header-text-all link-arrow">
          Přejít na stránku
        </Link>
      </div>
      <div className="header-compact-panel__links" role="list">
        {menu.items!.map((item) => (
          <HeaderCompactLink key={item.href + item.label} item={item} />
        ))}
      </div>
    </div>
  );
}

function HeaderCompactLink({ item }: { item: HeaderTextLink }) {
  const external = item.href.startsWith("tel:") || item.href.startsWith("mailto:");

  return (
    <Link
      href={item.href}
      className="header-compact-link"
      role="listitem"
      {...(external ? { rel: "noopener noreferrer" } : {})}
    >
      <span className="header-compact-link__title">{item.label}</span>
      {item.description ? (
        <span className="header-compact-link__desc">{item.description}</span>
      ) : null}
    </Link>
  );
}

function HeaderStrip({ items }: { items: StripItem[] }) {
  return (
    <div
      className="header-strip min-w-0 flex-1"
      style={{ "--header-strip-cols": items.length } as CSSProperties}
      role="list"
    >
      {items.map((item) => (
        <Link
          key={item.href + item.label}
          href={item.href}
          className="header-strip-item group"
          role="listitem"
        >
          <div className="header-strip-thumb">
            <Image
              src={item.image}
              alt=""
              fill
              quality={IMG_QUALITY}
              className={`${imgClass.photo} transition duration-500 group-hover:scale-[1.03]`}
              sizes={imgSizes.productTile}
            />
          </div>
          <span className="header-strip-label">{item.label}</span>
          {item.description ? (
            <span className="header-strip-desc">{item.description}</span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

function MobileNavSection({
  item,
  reseniItems,
  onClose,
}: {
  item: HeaderNavItem;
  reseniItems?: StripItem[];
  onClose: () => void;
}) {
  const subs: HeaderTextLink[] =
    item.id === "reseni"
      ? (reseniItems?.map((s) => ({ href: s.href, label: s.label })) ?? [])
      : (item.items ?? []);

  return (
    <div className="site-header-mobile__group">
      <Link href={item.href} className="site-header-mobile__link" onClick={onClose}>
        {item.label}
      </Link>
      {item.intro && item.id !== "reseni" ? (
        <p className="site-header-mobile__intro">{item.intro}</p>
      ) : null}
      {subs.length ? (
        <div className="site-header-mobile__subs site-header-mobile__subs--compact">
          {subs.map((sub) => (
            <Link key={sub.href + sub.label} href={sub.href} className="site-header-mobile__sub" onClick={onClose}>
              {sub.label}
              {sub.description ? (
                <span className="site-header-mobile__sub-desc">{sub.description}</span>
              ) : null}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.6 10.8a15.9 15.9 0 006.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.3.4 2.7.7 4.1.7.7 0 1.3.6 1.3 1.3V21c0 .7-.6 1.3-1.3 1.3C10.3 22.3 1.7 13.7 1.7 3.3 1.7 2.6 2.3 2 3 2h3.5c.7 0 1.3.6 1.3 1.3 0 1.4.2 2.8.7 4.1.1.4 0 .9-.3 1.2L6.6 10.8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
