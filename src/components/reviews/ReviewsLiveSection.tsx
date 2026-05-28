"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { GdprConsent, Review } from "@/lib/cms/types";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { ReviewTile } from "@/components/reviews/ReviewTile";
import { apiEndpoint } from "@/lib/static-hosting";
import { splitReviewsForDisplay } from "@/lib/reviews-display";

type ReviewsLiveSectionProps = {
  initialReviews: Review[];
  gdprConsent: GdprConsent;
};

export function ReviewsLiveSection({ initialReviews, gdprConsent }: ReviewsLiveSectionProps) {
  const [reviews, setReviews] = useState(initialReviews);

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
    setReviews(initialReviews);
  }, [initialReviews]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void syncReviews();
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [syncReviews]);

  const orderedReviews = useMemo(() => {
    const { featured, rest } = splitReviewsForDisplay(reviews);
    return [...featured, ...rest];
  }, [reviews]);

  const avg = useMemo(() => {
    if (!reviews.length) return null;
    return (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const handleSubmitted = useCallback(
    (review: Review) => {
      setReviews((current) => {
        if (current.some((item) => item.id === review.id)) return current;
        return [review, ...current];
      });
      void syncReviews();
    },
    [syncReviews]
  );

  return (
    <div className="reviews-page">
      <section className="reviews-panel" aria-label="Hodnocení zákazníků">
        <header className="reviews-panel__head">
          {avg ? (
            <div className="reviews-panel__score">
              <p className="reviews-panel__score-value">{avg}</p>
              <p className="reviews-panel__score-label">{reviews.length} hodnocení</p>
            </div>
          ) : (
            <p className="reviews-panel__title">Recenze zákazníků</p>
          )}
          {orderedReviews.length > 3 ? (
            <p className="reviews-panel__scroll-hint">Posuňte dolů</p>
          ) : null}
        </header>

        <div className="reviews-scroll" tabIndex={0} role="region" aria-label="Seznam recenzí">
          {orderedReviews.length ? (
            <ul className="reviews-grid">
              {orderedReviews.map((review) => (
                <li key={review.id}>
                  <ReviewTile review={review} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="reviews-live-empty">Zatím žádné recenze. Buďte první, kdo napíše svou zkušenost.</p>
          )}
        </div>

        {orderedReviews.length > 3 ? <div className="reviews-panel__fade" aria-hidden /> : null}
      </section>

      <div id="napsat-recenzi" className="reviews-form-wrap">
        <h2 className="section-title">Napsat recenzi</h2>
        <p className="mt-2 text-sm text-muted">Vaše recenze se po odeslání ihned zobrazí na webu.</p>
        <div className="reviews-form-panel">
          <ReviewForm gdprConsent={gdprConsent} onSubmitted={handleSubmitted} />
        </div>
      </div>
    </div>
  );
}
