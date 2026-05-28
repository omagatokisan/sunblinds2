import { company } from "@/data/company";

export type HeaderTextLink = {
  href: string;
  label: string;
  description?: string;
};

export type HeaderNavItem = {
  id: string;
  href: string;
  label: string;
  match: (pathname: string) => boolean;
  intro?: string;
  items?: HeaderTextLink[];
};

export const HEADER_RESENI: HeaderNavItem = {
  id: "reseni",
  href: "/reseni",
  label: "Řešení",
  match: (p) => p.startsWith("/reseni"),
  intro: "Venkovní i interiérové stínění, okna a související systémy — přehledně podle oblasti.",
};

/** Kompaktní menu s 2–3 odkazy — méně obsahu než původní mega menu. */
export const HEADER_NAV: HeaderNavItem[] = [
  HEADER_RESENI,
  {
    id: "showroom",
    href: "/showroom",
    label: "Showroom",
    match: (p) => p.startsWith("/showroom"),
    intro: "Vzorky látek a systémů v Praze-Libuši.",
    items: [
      {
        href: "/showroom",
        label: "Showroom Praha – Libuš",
        description: "Adresa, mapa a provoz",
      },
      {
        href: "/showroom",
        label: "Vzorky látek a profilů",
        description: "Interiér i exteriér naživo",
      },
      {
        href: "/kontakt",
        label: "Domluvit návštěvu",
        description: "Doporučujeme předchozí termín",
      },
    ],
  },
  {
    id: "servis",
    href: "/servis",
    label: "Servis",
    match: (p) => p.startsWith("/servis"),
    intro: "Záruční i pozáruční servis od jednoho týmu.",
    items: [
      {
        href: "/servis",
        label: "Stínící technika",
        description: "Rolety, žaluzie, markýzy",
      },
      {
        href: "/servis",
        label: "Okna a pergoly",
        description: "Seřízení, těsnění, lamely",
      },
      {
        href: "/poptavka",
        label: "Nahlásit závadu",
        description: "Rychlá servisní poptávka",
      },
    ],
  },
  {
    id: "kontakt",
    href: "/kontakt",
    label: "Kontakt",
    match: (p) => p.startsWith("/kontakt") || p.startsWith("/poptavka"),
    intro: "Telefon, e-mail nebo formulář.",
    items: [
      {
        href: "/kontakt",
        label: "Kontaktní formulář",
        description: company.email,
      },
      {
        href: "/poptavka",
        label: "Nezávazná poptávka",
        description: "Produkt, rozměry, poznámka",
      },
      {
        href: company.phoneHref,
        label: company.phone,
        description: company.hours,
      },
    ],
  },
  {
    id: "o-nas",
    href: "/o-nas",
    label: "O nás",
    match: (p) => p.startsWith("/o-nas"),
    intro: `${company.name} — ${company.tagline}`,
  },
];

/** @deprecated Use HEADER_NAV */
export const HEADER_SIMPLE_NAV = HEADER_NAV.filter((item) => item.id !== "reseni");
