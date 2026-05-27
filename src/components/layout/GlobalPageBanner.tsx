"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumb } from "@/components/sections/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { IMG_QUALITY, imgClass, imgSizes } from "@/lib/image-presets";
import { HomeHeroVideo } from "@/components/layout/HomeHeroVideo";
import { resolvePageBanner, type PageBannerContext } from "@/lib/page-banner";

export function GlobalPageBanner(ctx: PageBannerContext) {
  const pathname = usePathname();
  const content = resolvePageBanner(pathname, ctx);

  if (!content) return null;

  const isHome = content.size === "home";

  return (
    <section
      className={`site-page-banner ${content.variant === "dark" ? "site-page-banner--dark" : ""} ${isHome ? "site-page-banner--home" : ""}`}
      aria-label={isHome ? "Úvodní banner" : undefined}
    >
      <div className="site-page-banner-inner">
        {isHome ? (
          <HomeHeroVideo />
        ) : (
          <div className="site-page-banner-media">
            <Image
              src={content.image}
              alt=""
              fill
              priority
              quality={IMG_QUALITY}
              className={imgClass.photo}
              sizes={imgSizes.siteBanner}
            />
          </div>
        )}
        <div className="site-page-banner-overlay" aria-hidden />
        <Container width="wide" className="site-page-banner-content">
          {content.breadcrumbs.length ? (
            <Breadcrumb light items={content.breadcrumbs} />
          ) : null}
          {content.eyebrow ? (
            <p className="site-page-banner-eyebrow">{content.eyebrow}</p>
          ) : null}
          <h1 className={`site-page-banner-title ${isHome ? "site-page-banner-title--home" : ""}`}>
            {content.title}
          </h1>
          {content.lead ? <p className="site-page-banner-lead">{content.lead}</p> : null}
          {isHome ? (
            <div className="site-page-banner-actions">
              <Button href="/reseni" size="lg">
                Prohlédnout řešení
              </Button>
              <Link href="/kontakt" className="site-page-banner-link">
                Zavolat nebo napsat
              </Link>
            </div>
          ) : null}
        </Container>
      </div>
    </section>
  );
}
