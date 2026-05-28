"use client";

import { HERO_POSTER_IMAGE, HERO_VIDEOS } from "@/data/site-visuals";
import { PageBannerVideo } from "@/components/layout/PageBannerVideo";

type HomeHeroVideoProps = {
  onActiveChange?: (index: number) => void;
};

export function HomeHeroVideo({ onActiveChange }: HomeHeroVideoProps) {
  return (
    <PageBannerVideo
      videos={HERO_VIDEOS}
      poster={HERO_POSTER_IMAGE}
      layout="home"
      onActiveChange={onActiveChange}
    />
  );
}
