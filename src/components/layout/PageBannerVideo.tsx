"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { IMG_QUALITY, imgClass, imgSizes } from "@/lib/image-presets";

const CROSSFADE_MS = 1200;

function shuffleVideos(videos: readonly string[]) {
  const list = [...videos];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function canAutoplayVideo() {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return false;
  return true;
}

type PageBannerVideoProps = {
  videos: readonly string[];
  /** Pouze fallback pro reduced-motion / selhání videa — nezobrazuje se při normálním přehrávání */
  poster: string;
  layout?: "home" | "page";
  onActiveChange?: (index: number) => void;
};

export function PageBannerVideo({
  videos,
  poster,
  layout = "page",
  onActiveChange,
}: PageBannerVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<[HTMLVideoElement | null, HTMLVideoElement | null]>([null, null]);
  const playlistIndex = useRef(0);
  const visibleLayer = useRef<0 | 1>(0);
  const switching = useRef(false);
  const inView = useRef(true);
  const playlistRef = useRef<string[]>([...videos]);
  const videosKey = videos.join("\0");

  const [useStaticFallback, setUseStaticFallback] = useState(false);
  const [activeVideo, setActiveVideo] = useState(0);
  const [frontLayer, setFrontLayer] = useState<0 | 1>(0);
  const [videoReady, setVideoReady] = useState(false);
  const [playlist, setPlaylist] = useState<string[]>(() => [...videos]);

  const pauseLayer = useCallback((layer: 0 | 1) => {
    const video = videoRefs.current[layer];
    if (!video) return;
    video.pause();
    video.removeAttribute("src");
    video.load();
    delete video.dataset.src;
  }, []);

  const playClip = useCallback(async (layer: 0 | 1, index: number, force = false) => {
    const video = videoRefs.current[layer];
    const list = playlistRef.current;
    if (!video || !list.length) return;

    const src = list[index];
    if (video.dataset.src !== src) {
      video.src = src;
      video.dataset.src = src;
      video.load();
    }

    video.currentTime = 0;

    if (!force && !inView.current) return;

    try {
      await video.play();
      setVideoReady(true);
    } catch {
      /* autoplay blocked */
    }
  }, []);

  const advance = useCallback(async () => {
    const list = playlistRef.current;
    if (switching.current || list.length <= 1) return;
    switching.current = true;

    const nextIndex = (playlistIndex.current + 1) % list.length;
    const currentLayer = visibleLayer.current;
    const nextLayer = currentLayer === 0 ? 1 : 0;

    await playClip(nextLayer, nextIndex, true);

    playlistIndex.current = nextIndex;
    visibleLayer.current = nextLayer;
    setActiveVideo(nextIndex);
    setFrontLayer(nextLayer);
    onActiveChange?.(nextIndex);

    window.setTimeout(() => {
      pauseLayer(currentLayer);
      switching.current = false;
    }, CROSSFADE_MS);
  }, [onActiveChange, pauseLayer, playClip]);

  useLayoutEffect(() => {
    const next =
      layout === "page" && videos.length > 1 ? shuffleVideos(videos) : [...videos];
    playlistRef.current = next;
    setPlaylist(next);

    const fallback = !canAutoplayVideo() || next.length === 0;
    setUseStaticFallback(fallback);
    setVideoReady(false);

    if (fallback) return;

    playlistIndex.current = 0;
    visibleLayer.current = 0;
    setActiveVideo(0);
    setFrontLayer(0);

    const frame = window.requestAnimationFrame(() => {
      void playClip(0, 0, true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [layout, videosKey, playClip, videos.length]);

  useEffect(() => {
    if (useStaticFallback || !rootRef.current) return;

    const root = rootRef.current;

    const syncPlayback = () => {
      const layer = visibleLayer.current;
      const video = videoRefs.current[layer];
      if (!video?.dataset.src) return;

      if (inView.current && document.visibilityState === "visible") {
        void video.play()
          .then(() => setVideoReady(true))
          .catch(() => undefined);
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.05 }
    );

    observer.observe(root);

    const onVisibility = () => syncPlayback();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [useStaticFallback]);

  const mediaClass = [
    "site-page-banner-media",
    layout === "page" ? "site-page-banner-media--page-video" : "",
    useStaticFallback ? "site-page-banner-media--poster" : "site-page-banner-media--video",
    !useStaticFallback && !videoReady ? "site-page-banner-media--loading" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (useStaticFallback) {
    return (
      <div className={mediaClass}>
        <Image
          src={poster}
          alt=""
          fill
          priority
          quality={IMG_QUALITY}
          className={imgClass.photo}
          sizes={imgSizes.siteBanner}
        />
      </div>
    );
  }

  return (
    <div ref={rootRef} className={mediaClass}>
      <div className="site-page-banner-video-backdrop" aria-hidden />
      {([0, 1] as const).map((layer) => (
        <video
          key={layer}
          ref={(node) => {
            videoRefs.current[layer] = node;
          }}
          className={`site-page-banner-video ${frontLayer === layer ? "is-active" : ""}`}
          muted
          playsInline
          autoPlay={layer === 0}
          loop={false}
          preload={layer === 0 ? "auto" : "metadata"}
          disablePictureInPicture
          aria-hidden
          onPlaying={() => setVideoReady(true)}
          onLoadedData={() => {
            if (layer === frontLayer) setVideoReady(true);
          }}
          onError={() => {
            if (playlistRef.current.length > 1 && visibleLayer.current === layer) {
              void advance();
              return;
            }
            setUseStaticFallback(true);
          }}
          onEnded={() => {
            if (visibleLayer.current === layer) void advance();
          }}
        />
      ))}
      {playlist.length > 1 ? (
        <div
          className={`site-page-banner-video-progress ${layout === "page" ? "site-page-banner-video-progress--page" : ""}`}
          aria-hidden
        >
          {playlist.map((src, index) => (
            <span
              key={src}
              className={`site-page-banner-video-dot ${index === activeVideo ? "is-active" : ""}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
