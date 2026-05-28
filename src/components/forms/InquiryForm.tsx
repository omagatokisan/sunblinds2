"use client";

import { useMemo, useState } from "react";
import type { GdprConsent, InquiryOptions, Solution } from "@/lib/cms/types";
import { showField } from "@/lib/inquiry-fields";
import { apiEndpoint } from "@/lib/static-hosting";
import { GdprConsentField } from "./GdprConsent";

type LineItem = {
  id: string;
  solutionSlug: string;
  groupSlug: string;
  productSlug: string;
  widthMm: string;
  heightMm: string;
  quantity: string;
  mounting: string;
  control: string;
  location: string;
  note: string;
};

function emptyLine(): LineItem {
  return {
    id: crypto.randomUUID(),
    solutionSlug: "",
    groupSlug: "",
    productSlug: "",
    widthMm: "",
    heightMm: "",
    quantity: "1",
    mounting: "",
    control: "",
    location: "",
    note: "",
  };
}

function ProgressiveFields({
  line,
  inquiryOptions,
  onChange,
}: {
  line: LineItem;
  inquiryOptions: InquiryOptions;
  onChange: (patch: Partial<LineItem>) => void;
}) {
  if (!line.solutionSlug || !line.productSlug) return null;
  const slug = line.solutionSlug;

  return (
    <div className="animate-slide-up grid gap-4 border-t border-line/80 pt-4 sm:grid-cols-2 lg:grid-cols-3">
      {showField(slug, "dimensions") ? (
        <>
          <label className="block text-sm">
            <span className="font-medium text-ink">Šířka (mm)</span>
            <input
              type="number"
              min={1}
              placeholder="např. 1200"
              value={line.widthMm}
              onChange={(e) => onChange({ widthMm: e.target.value })}
              className="field-input mt-1.5"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-ink">Výška (mm)</span>
            <input
              type="number"
              min={1}
              placeholder="např. 1400"
              value={line.heightMm}
              onChange={(e) => onChange({ heightMm: e.target.value })}
              className="field-input mt-1.5"
            />
          </label>
        </>
      ) : null}

      {showField(slug, "mounting") ? (
        <label className="block text-sm">
          <span className="font-medium text-ink">Montáž</span>
          <select
            value={line.mounting}
            onChange={(e) => onChange({ mounting: e.target.value })}
            className="field-input mt-1.5"
          >
            <option value="">—</option>
            {inquiryOptions.mountingTypes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {showField(slug, "control") ? (
        <label className="block text-sm">
          <span className="font-medium text-ink">Ovládání</span>
          <select
            value={line.control}
            onChange={(e) => onChange({ control: e.target.value })}
            className="field-input mt-1.5"
          >
            <option value="">—</option>
            {inquiryOptions.controlTypes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {showField(slug, "location") ? (
        <label className="block text-sm">
          <span className="font-medium text-ink">Místnost / umístění</span>
          <select
            value={line.location}
            onChange={(e) => onChange({ location: e.target.value })}
            className="field-input mt-1.5"
          >
            <option value="">—</option>
            {inquiryOptions.locationTypes.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {showField(slug, "note") ? (
        <label className="block text-sm sm:col-span-2 lg:col-span-3">
          <span className="font-medium text-ink">Poznámka k položce</span>
          <input
            value={line.note}
            onChange={(e) => onChange({ note: e.target.value })}
            placeholder="barva, speciální požadavky…"
            className="field-input mt-1.5"
          />
        </label>
      ) : null}
    </div>
  );
}

export function InquiryForm({
  solutions,
  inquiryOptions,
  gdprConsent,
}: {
  solutions: Solution[];
  inquiryOptions: InquiryOptions;
  gdprConsent: GdprConsent;
}) {
  const [step, setStep] = useState(1);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gdpr, setGdpr] = useState(false);
  const [contact, setContact] = useState({ name: "", phone: "", email: "", location: "" });
  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);
  const [generalNote, setGeneralNote] = useState("");

  const sortedSolutions = useMemo(
    () => [...solutions].sort((a, b) => a.title.localeCompare(b.title, "cs")),
    [solutions]
  );

  function updateLine(id: string, patch: Partial<LineItem>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gdpr) return;
    setLoading(true);
    setError("");
    const res = await fetch(apiEndpoint("/api/inquiry"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...contact,
        generalNote: generalNote || undefined,
        lines,
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
      <div className="rounded border border-brand/30 bg-brand/5 p-8 text-center">
        <p className="text-lg font-semibold text-ink">Děkujeme za poptávku</p>
        <p className="mt-2 text-sm text-muted">Shrnutí jsme přijali. Ozveme se co nejdříve.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => s < step && setStep(s)}
            className={`flex-1 rounded py-2 text-xs font-semibold transition sm:text-sm ${
              step === s ? "bg-brand text-white" : s < step ? "bg-brand/15 text-brand" : "bg-canvas text-muted ring-1 ring-line"
            }`}
          >
            {s === 1 ? "Kontakt" : s === 2 ? "Produkty" : "Odeslání"}
          </button>
        ))}
      </div>

      {step === 1 ? (
        <section className="animate-slide-up hd-form-panel space-y-5 p-6">
          <h2 className="text-lg font-semibold text-ink">Základní údaje</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-ink">Jméno *</span>
              <input
                required
                value={contact.name}
                onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                className="field-input mt-1.5"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-ink">Telefon *</span>
              <input
                required
                type="tel"
                value={contact.phone}
                onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                className="field-input mt-1.5"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="font-medium text-ink">E-mail</span>
            <input
              type="email"
              value={contact.email}
              onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
              className="field-input mt-1.5"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-ink">Lokalita / typ stavby *</span>
            <input
              required
              value={contact.location}
              onChange={(e) => setContact((c) => ({ ...c, location: e.target.value }))}
              placeholder="např. Praha, rodinný dům"
              className="field-input mt-1.5"
            />
          </label>
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!contact.name || !contact.phone || !contact.location}
            className="rounded bg-brand px-8 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            Pokračovat k produktům →
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="animate-slide-up space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">Položky poptávky</h2>
              <p className="mt-1 text-sm text-muted">
                Vyberte oblast, skupinu a produkt. Další specifikace se zobrazí podle výběru.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLines((p) => [...p, emptyLine()])}
              className="rounded bg-canvas px-4 py-2 text-sm font-semibold ring-1 ring-line hover:bg-surface"
            >
              + Přidat položku
            </button>
          </div>

          {lines.map((line, index) => {
            const solution = sortedSolutions.find((s) => s.slug === line.solutionSlug);
            const groups = solution
              ? [...solution.productGroups].sort((a, b) => a.name.localeCompare(b.name, "cs"))
              : [];
            const group = groups.find((g) => g.slug === line.groupSlug);
            const products = group
              ? [...group.products].sort((a, b) => a.name.localeCompare(b.name, "cs"))
              : [];

            return (
              <div key={line.id} className="hd-form-line p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">Položka {index + 1}</p>
                  {lines.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setLines((p) => p.filter((l) => l.id !== line.id))}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Odebrat
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="block text-sm">
                    <span className="font-medium text-ink">Oblast *</span>
                    <select
                      required
                      value={line.solutionSlug}
                      onChange={(e) =>
                        updateLine(line.id, {
                          solutionSlug: e.target.value,
                          groupSlug: "",
                          productSlug: "",
                        })
                      }
                      className="field-input mt-1.5"
                    >
                      <option value="">Vyberte oblast</option>
                      {sortedSolutions.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm">
                    <span className="font-medium text-ink">Skupina *</span>
                    <select
                      required
                      value={line.groupSlug}
                      disabled={!solution}
                      onChange={(e) => updateLine(line.id, { groupSlug: e.target.value, productSlug: "" })}
                      className="field-input mt-1.5 disabled:opacity-50"
                    >
                      <option value="">Vyberte skupinu</option>
                      {groups.map((g) => (
                        <option key={g.slug} value={g.slug}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm">
                    <span className="font-medium text-ink">Produkt *</span>
                    <select
                      required
                      value={line.productSlug}
                      disabled={!group}
                      onChange={(e) => updateLine(line.id, { productSlug: e.target.value })}
                      className="field-input mt-1.5 disabled:opacity-50"
                    >
                      <option value="">Vyberte produkt</option>
                      {products.map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm">
                    <span className="font-medium text-ink">Počet ks *</span>
                    <input
                      type="number"
                      min={1}
                      required
                      value={line.quantity}
                      onChange={(e) => updateLine(line.id, { quantity: e.target.value })}
                      className="field-input mt-1.5"
                    />
                  </label>
                </div>

                <ProgressiveFields
                  line={line}
                  inquiryOptions={inquiryOptions}
                  onChange={(patch) => updateLine(line.id, patch)}
                />
              </div>
            );
          })}

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setStep(1)} className="rounded px-6 py-3 text-sm font-semibold ring-1 ring-line">
              ← Zpět
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={lines.some((l) => !l.solutionSlug || !l.groupSlug || !l.productSlug)}
              className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              Pokračovat k odeslání →
            </button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="animate-slide-up hd-form-panel space-y-5 p-6">
          <h2 className="text-lg font-semibold text-ink">Shrnutí a odeslání</h2>
          <label className="block text-sm">
            <span className="font-medium text-ink">Obecná poznámka</span>
            <textarea
              rows={4}
              value={generalNote}
              onChange={(e) => setGeneralNote(e.target.value)}
              className="field-input mt-1.5 resize-y"
            />
          </label>
          <GdprConsentField consent={gdprConsent} checked={gdpr} onChange={setGdpr} />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setStep(2)} className="rounded-full px-6 py-3 text-sm font-semibold ring-1 ring-line">
              ← Zpět
            </button>
            <button
              type="submit"
              disabled={loading || !gdpr}
              className="btn-base bg-brand text-white disabled:opacity-50"
            >
              {loading ? "Odesílám…" : "Odeslat nezávaznou poptávku"}
            </button>
          </div>
        </section>
      ) : null}
    </form>
  );
}
