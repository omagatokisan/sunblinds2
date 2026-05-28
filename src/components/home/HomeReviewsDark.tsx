"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Review } from "@/lib/cms/types";
import { apiEndpoint } from "@/lib/static-hosting";
import { HomeReveal } from "@/components/home/HomeReveal";
import { HomeSectionHead } from "@/components/home/HomeSectionHead";

function stars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export function HomeReviewsDark({ reviews: initialReviews }: { reviews: Review[] }) {
  const [reviews, setReviews] = useState(() =>
    initialReviews.filter((review) => review.status === "approved")
  );

  const syncReviews = useCallback(async () => {
    try {
      const res = await fetch(apiEndpoint("/api/reviews"));
      if (!res.ok) return;
      const data = (await res.json()) as { reviews?: Review[] };
      if (Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      }
    } catch {
      /* offline */
    }
  }, []);

  useEffect(() => {
    setReviews(initialReviews.filter((review) => review.status === "approved"));
  }, [initialReviews]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void syncReviews();
    }, 45_000);
    return () => window.clearInterval(timer);
  }, [syncReviews]);

  const featured = useMemo(() => reviews.slice(0, 3), [reviews]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active >= featured.length) {
      setActive(0);
    }
  }, [active, featured.length]);

  useEffect(() => {
    if (featured.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % featured.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [featured.length]);

  if (!featured.length) return null;

  return (
    <section className="hd-block hd-reviews" aria-labelledby="hd-reviews-title">
      <div className="hd-shell">
        <HomeSectionHead
          id="hd-reviews-title"
          eyebrow="Recenze"
          title="Co říkají zákazníci"
          align="left"
        />

        <ul className="hd-reviews__grid">
          {featured.map((review, index) => (
            <li key={review.id}>
              <HomeReveal
                className={`hd-review ${active === index ? "is-active" : ""}`}
                delay={index * 90}
              >
                <button
                  type="button"
                  className="block w-full text-left"
                  onClick={() => setActive(index)}
                  aria-pressed={active === index}
                >
                  <p className="hd-review__stars" aria-label={`Hodnocení ${review.rating} z 5`}>
                    {stars(review.rating)}
                  </p>
                  <blockquote className="hd-review__text">&ldquo;{review.text}&rdquo;</blockquote>
                  <footer className="hd-review__meta">
                    <span>{review.author}</span>
                    {review.location ? <span>{review.location}</span> : null}
                  </footer>
                </button>
              </HomeReveal>
            </li>
          ))}
        </ul>

        <HomeReveal delay={120} className="hd-reviews__actions">
          <Link href="/recenze#napsat-recenzi" className="hd-btn hd-btn--primary">
            Napsat recenzi
          </Link>
        </HomeReveal>
      </div>
    </section>
  );
}
