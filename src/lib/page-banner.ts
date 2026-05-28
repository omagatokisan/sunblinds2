import type {
  AboutPageContent,
  ContactPageContent,
  HomeContent,
  ServisPageContent,
  ShowroomContent,
  Solution,
  PrivacyContent,
} from "@/lib/cms/types";
import { SITE_BANNER_IMAGE, PAGE_BANNER_VIDEOS } from "@/data/site-visuals";
import { company } from "@/data/company";

export type BannerBreadcrumb = { label: string; href?: string };

export type PageBannerContent = {
  title: string;
  lead?: string;
  eyebrow?: string;
  image: string;
  videos?: readonly string[];
  variant: "default" | "dark";
  size: "home" | "page";
  breadcrumbs: BannerBreadcrumb[];
};

export type PageBannerContext = {
  home: HomeContent;
  contact: ContactPageContent;
  aboutPage: AboutPageContent;
  servisPage: ServisPageContent;
  showroom: ShowroomContent;
  solutions: Solution[];
  privacy: PrivacyContent;
};

function matchProductDetail(pathname: string) {
  return /^\/reseni\/[^/]+\/[^/]+\/[^/]+$/.test(pathname);
}

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function resolvePageBanner(pathname: string, ctx: PageBannerContext): PageBannerContent | null {
  pathname = normalizePathname(pathname);
  if (pathname.startsWith("/admin") || matchProductDetail(pathname)) return null;

  const parts = pathname.split("/").filter(Boolean);

  if (pathname === "/") {
    return null;
  }

  if (parts[0] === "reseni") {
    if (parts.length === 1) {
      return {
        title: "Všechny oblasti na jednom místě",
        lead: "Vyberte oblast podle vašeho projektu nebo rovnou odešlete nezávaznou poptávku. U každé kategorie najdete produkty s parametry montáže.",
        eyebrow: "Řešení",
        image: SITE_BANNER_IMAGE,
        videos: PAGE_BANNER_VIDEOS.reseni,
        variant: "default",
        size: "page",
        breadcrumbs: [
          { label: "Úvod", href: "/" },
          { label: "Řešení" },
        ],
      };
    }

    const solution = ctx.solutions.find((s) => s.slug === parts[1]);
    if (!solution) return null;

    if (parts.length === 2) {
      return {
        title: solution.title,
        lead: solution.intro,
        eyebrow: solution.shortTitle,
        image: solution.heroImage,
        variant: "default",
        size: "page",
        breadcrumbs: [
          { label: "Úvod", href: "/" },
          { label: "Řešení", href: "/reseni" },
          { label: solution.title },
        ],
      };
    }

    const group = solution.productGroups.find((g) => g.slug === parts[2]);
    if (parts.length === 3 && group) {
      return {
        title: group.name,
        lead: group.summary,
        eyebrow: solution.title,
        image: group.image,
        videos: PAGE_BANNER_VIDEOS.reseni,
        variant: "default",
        size: "page",
        breadcrumbs: [
          { label: "Úvod", href: "/" },
          { label: "Řešení", href: "/reseni" },
          { label: solution.title, href: `/reseni/${solution.slug}` },
          { label: group.name },
        ],
      };
    }
  }

  const staticPages: Record<string, Omit<PageBannerContent, "breadcrumbs"> & { crumbs: BannerBreadcrumb[] }> = {
    "/kontakt": {
      title: ctx.contact.heroTitle,
      lead: ctx.contact.heroLead,
      eyebrow: "Kontakt",
      image: SITE_BANNER_IMAGE,
      videos: PAGE_BANNER_VIDEOS.kontakt,
      variant: "default",
      size: "page",
      crumbs: [{ label: "Úvod", href: "/" }, { label: "Kontakt" }],
    },
    "/showroom": {
      title: ctx.showroom.title,
      lead: ctx.showroom.intro,
      eyebrow: "Showroom",
      image: ctx.showroom.heroImage,
      videos: PAGE_BANNER_VIDEOS.showroom,
      variant: "default",
      size: "page",
      crumbs: [{ label: "Úvod", href: "/" }, { label: "Showroom" }],
    },
    "/servis": {
      title: ctx.servisPage.heroTitle,
      lead: ctx.servisPage.heroLead,
      eyebrow: "Servis",
      image: "https://sunblinds.cz/images/slider_2/slide2/textilni_roletky.webp",
      videos: PAGE_BANNER_VIDEOS.servis,
      variant: "dark",
      size: "page",
      crumbs: [{ label: "Úvod", href: "/" }, { label: "Servis" }],
    },
    "/o-nas": {
      title: company.name,
      lead: ctx.aboutPage.heroLead,
      eyebrow: "O nás",
      image: ctx.showroom.heroImage,
      videos: PAGE_BANNER_VIDEOS["o-nas"],
      variant: "default",
      size: "page",
      crumbs: [{ label: "Úvod", href: "/" }, { label: "O nás" }],
    },
    "/recenze": {
      title: "Co říkají naši zákazníci",
      lead: "Reference od lidí, kteří u nás řešili stínění, okna nebo servis.",
      eyebrow: "Recenze",
      image: "https://sunblinds.cz/images/slider_2/slide3/hlinikove_pergoly.webp",
      videos: PAGE_BANNER_VIDEOS.recenze,
      variant: "default",
      size: "page",
      crumbs: [{ label: "Úvod", href: "/" }, { label: "Recenze" }],
    },
    "/poptavka": {
      title: "Nezávazná online poptávka",
      lead: "Vyberte produkty, doplňte rozměry v milimetrech a počet kusů.",
      eyebrow: "Poptávka",
      image: SITE_BANNER_IMAGE,
      variant: "default",
      size: "page",
      crumbs: [{ label: "Úvod", href: "/" }, { label: "Poptávka" }],
    },
    "/ochrana-osobnich-udaju": {
      title: ctx.privacy.title,
      lead: ctx.privacy.intro,
      eyebrow: "Právní informace",
      image: SITE_BANNER_IMAGE,
      variant: "default",
      size: "page",
      crumbs: [{ label: "Úvod", href: "/" }, { label: "Ochrana údajů" }],
    },
  };

  const page = staticPages[pathname];
  if (page) {
    const { crumbs, ...rest } = page;
    return { ...rest, breadcrumbs: crumbs };
  }

  return {
    title: company.name,
    lead: company.tagline,
    image: SITE_BANNER_IMAGE,
    variant: "default",
    size: "page",
    breadcrumbs: [{ label: "Úvod", href: "/" }],
  };
}
