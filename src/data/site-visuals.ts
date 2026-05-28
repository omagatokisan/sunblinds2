/** Vysoké rozlišení — optimalizace přes next/image (1920px srcset) */
export const SITE_BANNER_IMAGE =
  "https://sunblinds.cz/images/slider_2/slide4/okna-a-dvere-okna.webp";

export const HERO_POSTER_IMAGE = SITE_BANNER_IMAGE;

/** Hero videa pro homepage banner (public/videos/hero) — bez garážového klipu */
export const HERO_VIDEOS = [
  "/videos/hero/hero-02.mp4",
  "/videos/hero/hero-03.mp4",
  "/videos/hero/hero-04.mp4",
] as const;

/** Videa pro bannery vybraných podstránek (public/videos/pages) — jen ověřené mp42 klipy */
export const PAGE_BANNER_VIDEOS = {
  servis: [
    "/videos/pages/servis/03.mp4",
    "/videos/pages/servis/02.mp4",
  ],
  kontakt: [
    "/videos/pages/kontakt/02.mp4",
    "/videos/pages/kontakt/03.mp4",
  ],
  "o-nas": [
    "/videos/pages/o-nas/03.mp4",
    "/videos/pages/o-nas/02.mp4",
  ],
  showroom: [
    "/videos/pages/showroom/02.mp4",
    "/videos/pages/showroom/01.mp4",
  ],
  reseni: [
    "/videos/pages/reseni/01.mp4",
    "/videos/pages/reseni/02.mp4",
    "/videos/pages/reseni/03.mp4",
  ],
  recenze: [
    "/videos/pages/recenze/01.mp4",
    "/videos/pages/recenze/02.mp4",
  ],
} as const;

export type PageBannerVideoKey = keyof typeof PAGE_BANNER_VIDEOS;

export const SITE_BANNER_WIDTH = 1920;
export const SITE_BANNER_HEIGHT = 1280;

/** Obrázky pro sekci „Co dál?“ / Související témata na detailu produktu */
export const RELATED_TOPIC_IMAGES = {
  showroom: "https://sunblinds.cz/images/slider_2/slide2/textilni_roletky.webp",
  poptavka: "https://sunblinds.cz/images/slider_2/slide4/okna-a-dvere-okna.webp",
  servis: "https://sunblinds.cz/images/slider_2/slide3/hlinikove_pergoly.webp",
} as const;
