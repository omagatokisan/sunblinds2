"use client";

import { useState } from "react";
import type { GdprConsent, Review } from "@/lib/cms/types";
import { apiEndpoint } from "@/lib/static-hosting";
import { REVIEW_TEXT_MAX, REVIEW_TEXT_MIN } from "@/lib/reviews/constants";
import { GdprConsentField } from "./GdprConsent";

function fieldValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function validateReviewInput(input: {
  author: string;
  text: string;
  rating: number;
  gdpr: boolean;
}) {
  if (!input.gdpr) {
    return "Potvrďte souhlas se zpracováním údajů.";
  }
  if (input.author.length < 2) {
    return "Napište prosím jméno (alespoň 2 znaky).";
  }
  if (input.text.length < REVIEW_TEXT_MIN) {
    return "Napište krátkou zkušenost (alespoň 3 znaky).";
  }
  if (input.text.length > REVIEW_TEXT_MAX) {
    return `Text recenze může mít nejvýše ${REVIEW_TEXT_MAX} znaků.`;
  }
  if (input.rating < 1 || input.rating > 5) {
    return "Vyberte hodnocení hvězdičkami.";
  }
  return "";
}

export function ReviewForm({ gdprConsent, onSubmitted }: { gdprConsent: GdprConsent; onSubmitted?: (review: Review) => void }) {
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gdpr, setGdpr] = useState(false);
  const [text, setText] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const fd = new FormData(e.currentTarget);
    const author = fieldValue(fd.get("author"));
    const text = fieldValue(fd.get("text"));
    const location = fieldValue(fd.get("location"));
    const productHint = fieldValue(fd.get("productHint"));

    const validationError = validateReviewInput({ author, text, rating, gdpr });
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const payload = {
      author,
      rating,
      text,
      ...(location ? { location } : {}),
      ...(productHint ? { productHint } : {}),
    };

    try {
      const res = await fetch(apiEndpoint("/api/reviews"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { error?: string; review?: Review };

      if (!res.ok) {
        setError(data.error ?? "Odeslání se nezdařilo.");
        return;
      }

      if (data.review) {
        onSubmitted?.(data.review);
      }
      setSent(true);
    } catch {
      setError("Odeslání se nezdařilo. Zkuste to prosím znovu.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="reviews-form-success">
        <p className="text-lg font-semibold text-ink">Děkujeme za recenzi</p>
        <p className="mt-2 text-sm text-muted">Vaše hodnocení je nyní viditelné na stránce.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <p className="text-sm font-medium text-ink">Hodnocení</p>
        <div className="mt-2 flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              className={`rounded-lg p-1 transition hover:scale-110 ${i < rating ? "text-brand" : "text-line"}`}
              aria-label={`${i + 1} hvězdiček`}
            >
              <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Jméno</span>
          <input name="author" autoComplete="name" className="field-input mt-1.5" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Lokalita</span>
          <input name="location" placeholder="např. Praha" className="field-input mt-1.5" />
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-medium text-ink">Produkt / služba</span>
        <input name="productHint" placeholder="např. Venkovní rolety" className="field-input mt-1.5" />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-ink">Vaše zkušenost</span>
        <textarea
          name="text"
          rows={4}
          value={text}
          maxLength={REVIEW_TEXT_MAX}
          onChange={(e) => setText(e.target.value)}
          className="field-input mt-1.5 resize-y"
          placeholder="Jak probíhala spolupráce…"
        />
        <span className="mt-1 block text-right text-xs text-muted">
          {text.length} / {REVIEW_TEXT_MAX}
        </span>
      </label>
      <GdprConsentField consent={gdprConsent} checked={gdpr} onChange={setGdpr} required={false} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="btn-base bg-brand text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {loading ? "Odesílám…" : "Odeslat recenzi"}
      </button>
    </form>
  );
}
