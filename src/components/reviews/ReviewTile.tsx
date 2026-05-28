"use client";

import { useId, useState } from "react";
import type { Review } from "@/lib/cms/types";
import { formatReviewStars } from "@/lib/reviews-display";
import { REVIEW_PREVIEW_CHAR_LIMIT } from "@/lib/reviews/constants";

export function ReviewTile({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const detailId = useId();
  const isLong = review.text.length > REVIEW_PREVIEW_CHAR_LIMIT;

  return (
    <article className={`reviews-tile ${expanded ? "reviews-tile--expanded" : ""}`}>
      <div className="reviews-tile__main">
        <p className="reviews-tile__stars" aria-label={`Hodnocení ${review.rating} z 5`}>
          {formatReviewStars(review.rating)}
        </p>
        <blockquote className="reviews-tile__quote">
          <p className={`reviews-tile__text ${isLong ? "reviews-tile__text--faded" : ""}`}>
            &ldquo;{review.text}&rdquo;
          </p>
        </blockquote>
        <footer className="reviews-tile__meta">
          <span>{review.author}</span>
          {review.location ? <span>{review.location}</span> : null}
          {review.productHint ? <span className="reviews-tile__hint">{review.productHint}</span> : null}
        </footer>
      </div>

      {isLong ? (
        <button
          type="button"
          className="reviews-tile__toggle"
          aria-expanded={expanded}
          aria-controls={detailId}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? "Skrýt celý text" : "Zobrazit celý text"}
        </button>
      ) : null}

      {expanded && isLong ? (
        <div id={detailId} className="reviews-tile__detail">
          <p className="reviews-tile__detail-text">&ldquo;{review.text}&rdquo;</p>
        </div>
      ) : null}
    </article>
  );
}
