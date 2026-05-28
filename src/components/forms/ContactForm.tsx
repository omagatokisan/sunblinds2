"use client";

import { useState } from "react";
import type { GdprConsent } from "@/lib/cms/types";
import { apiEndpoint } from "@/lib/static-hosting";
import { GdprConsentField } from "./GdprConsent";

export function ContactForm({ gdprConsent }: { gdprConsent: GdprConsent }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gdpr, setGdpr] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!gdpr) return;
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch(apiEndpoint("/api/contact"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone") || undefined,
        subject: fd.get("subject") || undefined,
        message: fd.get("message"),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Odeslání se nezdařilo.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="reviews-form-success">
        <p className="text-lg font-semibold text-ink">Zpráva odeslána</p>
        <p className="mt-2 text-sm text-muted">Děkujeme — ozveme se co nejdříve.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Jméno *</span>
          <input required name="name" className="field-input mt-1.5" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">E-mail *</span>
          <input required name="email" type="email" className="field-input mt-1.5" />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Telefon</span>
          <input name="phone" type="tel" className="field-input mt-1.5" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Předmět</span>
          <input name="subject" className="field-input mt-1.5" />
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-medium text-ink">Zpráva *</span>
        <textarea required name="message" rows={5} className="field-input mt-1.5 resize-y" />
      </label>
      <GdprConsentField consent={gdprConsent} checked={gdpr} onChange={setGdpr} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading || !gdpr}
        className="btn-base bg-brand text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {loading ? "Odesílám…" : "Odeslat zprávu"}
      </button>
    </form>
  );
}
