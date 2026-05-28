"use client";

import { useEffect, useState } from "react";
import type { Product, ProductGroup, Review, SiteContent, Solution, TextBlock } from "@/lib/cms/types";
import { newId } from "@/lib/cms/types";
import { REVIEW_TEXT_MAX } from "@/lib/reviews/constants";
import { AddRow, Field, RemoveRow, TextBlocksEditor, uploadImage } from "./admin-ui";

type Tab =
  | "home"
  | "gdpr"
  | "showroom"
  | "privacy"
  | "inquiry"
  | "technicians"
  | "departments"
  | "servis"
  | "reviews"
  | "solutions"
  | "site"
  | "contact";

const tabs: { id: Tab; label: string }[] = [
  { id: "home", label: "Úvod" },
  { id: "gdpr", label: "GDPR souhlas" },
  { id: "showroom", label: "Showroom" },
  { id: "privacy", label: "Ochrana údajů" },
  { id: "contact", label: "Kontakt" },
  { id: "inquiry", label: "Poptávka" },
  { id: "technicians", label: "Technici" },
  { id: "departments", label: "Telefony" },
  { id: "servis", label: "Servis" },
  { id: "reviews", label: "Recenze" },
  { id: "solutions", label: "Produkty" },
  { id: "site", label: "Proces & proč my" },
];

export function AdminDashboard() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [tab, setTab] = useState<Tab>("solutions");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => {
        if (!r.ok) throw new Error("auth");
        return r.json();
      })
      .then((data) => setContent(data as SiteContent))
      .catch(() => {
        window.location.href = "/admin/login";
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    if (!content) return;
    setStatus("Ukládám…");
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    setStatus(res.ok ? "Uloženo." : "Chyba při ukládání.");
    if (res.ok) setTimeout(() => setStatus(""), 3000);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  function patch(partial: Partial<SiteContent>) {
    setContent((c) => (c ? { ...c, ...partial } : c));
  }

  function updateSolution(si: number, solution: Solution) {
    if (!content) return;
    const solutions = [...content.solutions];
    solutions[si] = solution;
    patch({ solutions });
  }

  if (loading || !content) return <p className="p-8 text-muted">Načítám administraci…</p>;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">Admin</p>
            <h1 className="text-lg font-semibold">Správa obsahu webu</h1>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={save} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white">
              Uložit změny
            </button>
            <button type="button" onClick={logout} className="rounded-full px-5 py-2 text-sm ring-1 ring-line">
              Odhlásit
            </button>
          </div>
        </div>
        {status ? <p className="border-t border-line bg-brand/5 py-2 text-center text-sm text-brand">{status}</p> : null}
        <nav className="mx-auto flex max-w-7xl flex-wrap gap-2 px-5 pb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium sm:text-sm ${
                tab === t.id ? "bg-ink text-white" : "bg-canvas ring-1 ring-line"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-6">
        {tab === "home" && (
          <Panel title="Texty úvodní stránky">
            <Field label="Hero nadpis" value={content.home.heroTitle} onChange={(v) => patch({ home: { ...content.home, heroTitle: v } })} />
            <Field label="Hero popis" value={content.home.heroLead} multiline onChange={(v) => patch({ home: { ...content.home, heroLead: v } })} />
            <Field label="Nadpis oblastí" value={content.home.solutionsTitle} onChange={(v) => patch({ home: { ...content.home, solutionsTitle: v } })} />
            <Field label="Popis oblastí" value={content.home.solutionsDescription} multiline onChange={(v) => patch({ home: { ...content.home, solutionsDescription: v } })} />
            <Field label="Nadpis Proč SunBlinds" value={content.home.whyTitle} onChange={(v) => patch({ home: { ...content.home, whyTitle: v } })} />
          </Panel>
        )}

        {tab === "gdpr" && (
          <Panel title="Souhlas ve formulářích">
            <Field label="Text před odkazem" value={content.gdprConsent.textBeforeLink} multiline onChange={(v) => patch({ gdprConsent: { ...content.gdprConsent, textBeforeLink: v } })} />
            <Field label="Text odkazu" value={content.gdprConsent.linkLabel} onChange={(v) => patch({ gdprConsent: { ...content.gdprConsent, linkLabel: v } })} />
            <Field label="URL stránky" value={content.gdprConsent.linkHref} onChange={(v) => patch({ gdprConsent: { ...content.gdprConsent, linkHref: v } })} />
          </Panel>
        )}

        {tab === "showroom" && (
          <Panel title="Showroom">
            <Field label="Nadpis" value={content.showroom.title} onChange={(v) => patch({ showroom: { ...content.showroom, title: v } })} />
            <Field label="Úvod" value={content.showroom.intro} multiline onChange={(v) => patch({ showroom: { ...content.showroom, intro: v } })} />
            <Field label="Hero obrázek URL" value={content.showroom.heroImage} onChange={(v) => patch({ showroom: { ...content.showroom, heroImage: v } })} />
            <Field label="Adresa řádek 1" value={content.showroom.addressLine1} onChange={(v) => patch({ showroom: { ...content.showroom, addressLine1: v } })} />
            <Field label="Adresa řádek 2" value={content.showroom.addressLine2} onChange={(v) => patch({ showroom: { ...content.showroom, addressLine2: v } })} />
            <Field label="Provoz" value={content.showroom.hours} onChange={(v) => patch({ showroom: { ...content.showroom, hours: v } })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Telefon" value={content.showroom.phone} onChange={(v) => patch({ showroom: { ...content.showroom, phone: v } })} />
              <Field label="E-mail" value={content.showroom.email} onChange={(v) => patch({ showroom: { ...content.showroom, email: v } })} />
              <Field label="GPS lat" value={String(content.showroom.lat)} onChange={(v) => patch({ showroom: { ...content.showroom, lat: Number(v) || 0 } })} />
              <Field label="GPS lng" value={String(content.showroom.lng)} onChange={(v) => patch({ showroom: { ...content.showroom, lng: Number(v) || 0 } })} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-sm font-semibold">Highlight boxy</p>
                <AddRow label="Přidat box" onClick={() => patch({ showroom: { ...content.showroom, highlights: [...content.showroom.highlights, { id: newId("hl"), title: "", text: "" }] } })} />
              </div>
              {content.showroom.highlights.map((h, i) => (
                <div key={h.id} className="rounded-lg border border-line p-3">
                  <RemoveRow onClick={() => patch({ showroom: { ...content.showroom, highlights: content.showroom.highlights.filter((_, j) => j !== i) } })} />
                  <Field label="Nadpis" value={h.title} onChange={(v) => { const hls = [...content.showroom.highlights]; hls[i] = { ...h, title: v }; patch({ showroom: { ...content.showroom, highlights: hls } }); }} />
                  <Field label="Text" value={h.text} multiline onChange={(v) => { const hls = [...content.showroom.highlights]; hls[i] = { ...h, text: v }; patch({ showroom: { ...content.showroom, highlights: hls } }); }} />
                </div>
              ))}
            </div>
            <TextBlocksEditor blocks={content.showroom.textBlocks} onChange={(blocks) => patch({ showroom: { ...content.showroom, textBlocks: blocks } })} />
          </Panel>
        )}

        {tab === "privacy" && (
          <Panel title="Stránka ochrany osobních údajů">
            <Field label="Nadpis" value={content.privacy.title} onChange={(v) => patch({ privacy: { ...content.privacy, title: v } })} />
            <Field label="Úvod" value={content.privacy.intro} multiline onChange={(v) => patch({ privacy: { ...content.privacy, intro: v } })} />
            <Field label="Datum aktualizace" value={content.privacy.updatedLabel} onChange={(v) => patch({ privacy: { ...content.privacy, updatedLabel: v } })} />
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-sm font-semibold">Sekce</p>
                <AddRow label="Přidat sekci" onClick={() => patch({ privacy: { ...content.privacy, sections: [...content.privacy.sections, { id: newId("priv"), title: "", content: "" }] } })} />
              </div>
              {content.privacy.sections.map((s, i) => (
                <div key={s.id} className="rounded-lg border border-line p-3">
                  <RemoveRow onClick={() => patch({ privacy: { ...content.privacy, sections: content.privacy.sections.filter((_, j) => j !== i) } })} />
                  <Field label="Nadpis sekce" value={s.title ?? ""} onChange={(v) => { const sec = [...content.privacy.sections]; sec[i] = { ...s, title: v }; patch({ privacy: { ...content.privacy, sections: sec } }); }} />
                  <Field label="Obsah" value={s.content} multiline onChange={(v) => { const sec = [...content.privacy.sections]; sec[i] = { ...s, content: v }; patch({ privacy: { ...content.privacy, sections: sec } }); }} />
                </div>
              ))}
            </div>
          </Panel>
        )}

        {tab === "contact" && (
          <Panel title="Stránka Kontakt">
            <Field label="Hero nadpis" value={content.contact.heroTitle} onChange={(v) => patch({ contact: { ...content.contact, heroTitle: v } })} />
            <Field label="Hero popis" value={content.contact.heroLead} multiline onChange={(v) => patch({ contact: { ...content.contact, heroLead: v } })} />
            <Field label="Nadpis formuláře" value={content.contact.formTitle} onChange={(v) => patch({ contact: { ...content.contact, formTitle: v } })} />
            <Field label="Popis formuláře" value={content.contact.formLead} multiline onChange={(v) => patch({ contact: { ...content.contact, formLead: v } })} />
          </Panel>
        )}

        {tab === "inquiry" && (
          <Panel title="Možnosti poptávkového formuláře">
            {(["mountingTypes", "controlTypes", "locationTypes"] as const).map((key) => (
              <ListEditor
                key={key}
                title={key === "mountingTypes" ? "Typ montáže" : key === "controlTypes" ? "Ovládání" : "Místnost"}
                items={content.inquiryOptions[key]}
                onChange={(items) => patch({ inquiryOptions: { ...content.inquiryOptions, [key]: items } })}
              />
            ))}
          </Panel>
        )}

        {tab === "technicians" && (
          <Panel title="Servisní technici">
            <AddRow label="Přidat technika" onClick={() => patch({ technicians: [...content.technicians, { id: newId("tech"), name: "", role: "", photo: "", shortBio: "", fullBio: "" }] })} />
            {content.technicians.map((tech, ti) => (
              <div key={tech.id} className="rounded-xl border border-line bg-surface p-4">
                <RemoveRow label="Odebrat technika" onClick={() => patch({ technicians: content.technicians.filter((_, j) => j !== ti) })} />
                <Field label="Jméno" value={tech.name} onChange={(v) => { const t = [...content.technicians]; t[ti] = { ...tech, name: v }; patch({ technicians: t }); }} />
                <Field label="Role" value={tech.role} onChange={(v) => { const t = [...content.technicians]; t[ti] = { ...tech, role: v }; patch({ technicians: t }); }} />
                <Field label="Foto URL" value={tech.photo} onChange={(v) => { const t = [...content.technicians]; t[ti] = { ...tech, photo: v }; patch({ technicians: t }); }} />
                <input type="file" accept="image/*" className="mt-2 text-xs" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const url = await uploadImage(f); if (url) { const t = [...content.technicians]; t[ti] = { ...tech, photo: url }; patch({ technicians: t }); } }} />
                <Field label="Krátký popis" value={tech.shortBio} onChange={(v) => { const t = [...content.technicians]; t[ti] = { ...tech, shortBio: v }; patch({ technicians: t }); }} />
                <Field label="Dlouhý popis" value={tech.fullBio} multiline onChange={(v) => { const t = [...content.technicians]; t[ti] = { ...tech, fullBio: v }; patch({ technicians: t }); }} />
              </div>
            ))}
          </Panel>
        )}

        {tab === "departments" && (
          <Panel title="Telefony oddělení (popupy Volat)">
            <AddRow label="Přidat oddělení" onClick={() => patch({ departments: [...content.departments, { id: newId("dep"), label: "", phone: "", hours: "", hint: "" }] })} />
            {content.departments.map((dept, di) => (
              <div key={dept.id} className="rounded-xl border border-line p-4">
                <RemoveRow onClick={() => patch({ departments: content.departments.filter((_, j) => j !== di) })} />
                <Field label="ID (bez mezer)" value={dept.id} onChange={(v) => { const d = [...content.departments]; d[di] = { ...dept, id: v }; patch({ departments: d }); }} />
                <Field label="Název" value={dept.label} onChange={(v) => { const d = [...content.departments]; d[di] = { ...dept, label: v }; patch({ departments: d }); }} />
                <Field label="Telefon" value={dept.phone} onChange={(v) => { const d = [...content.departments]; d[di] = { ...dept, phone: v }; patch({ departments: d }); }} />
                <Field label="Provoz" value={dept.hours} onChange={(v) => { const d = [...content.departments]; d[di] = { ...dept, hours: v }; patch({ departments: d }); }} />
                <Field label="Nápověda v popupu" value={dept.hint} multiline onChange={(v) => { const d = [...content.departments]; d[di] = { ...dept, hint: v }; patch({ departments: d }); }} />
              </div>
            ))}
          </Panel>
        )}

        {tab === "servis" && (
          <>
            <Panel title="Servis — hero a úvod">
              <Field label="Hero nadpis" value={content.servisPage.heroTitle} onChange={(v) => patch({ servisPage: { ...content.servisPage, heroTitle: v } })} />
              <Field label="Hero popis" value={content.servisPage.heroLead} multiline onChange={(v) => patch({ servisPage: { ...content.servisPage, heroLead: v } })} />
              <Field label="Úvodní text" value={content.servisPage.intro} multiline onChange={(v) => patch({ servisPage: { ...content.servisPage, intro: v } })} />
              <ListEditor title="Tagy servisovaných produktů" items={content.servisPage.servicedTags} onChange={(items) => patch({ servisPage: { ...content.servisPage, servicedTags: items } })} />
            </Panel>
            <Panel title="Kategorie servisu">
              <AddRow label="Přidat kategorii" onClick={() => patch({ servisPage: { ...content.servisPage, categories: [...content.servisPage.categories, { id: newId("sc"), title: "", shortText: "", longText: "", icon: "shading" }] } })} />
              {content.servisPage.categories.map((cat, ci) => (
                <div key={cat.id} className="rounded-xl border border-line p-4">
                  <RemoveRow onClick={() => patch({ servisPage: { ...content.servisPage, categories: content.servisPage.categories.filter((_, j) => j !== ci) } })} />
                  <Field label="Nadpis" value={cat.title} onChange={(v) => { const c = [...content.servisPage.categories]; c[ci] = { ...cat, title: v }; patch({ servisPage: { ...content.servisPage, categories: c } }); }} />
                  <Field label="Krátký popis" value={cat.shortText} multiline onChange={(v) => { const c = [...content.servisPage.categories]; c[ci] = { ...cat, shortText: v }; patch({ servisPage: { ...content.servisPage, categories: c } }); }} />
                  <Field label="Detailní popis" value={cat.longText} multiline onChange={(v) => { const c = [...content.servisPage.categories]; c[ci] = { ...cat, longText: v }; patch({ servisPage: { ...content.servisPage, categories: c } }); }} />
                </div>
              ))}
            </Panel>
            <Panel title="Ceník servisu">
              <Field label="Nadpis ceníku" value={content.servisPage.pricingTitle} onChange={(v) => patch({ servisPage: { ...content.servisPage, pricingTitle: v } })} />
              <Field label="Poznámka pod ceníkem" value={content.servisPage.pricingNote} multiline onChange={(v) => patch({ servisPage: { ...content.servisPage, pricingNote: v } })} />
              <AddRow label="Přidat položku" onClick={() => patch({ servisPage: { ...content.servisPage, pricingRows: [...content.servisPage.pricingRows, { id: newId("pr"), service: "", price: "" }] } })} />
              {content.servisPage.pricingRows.map((row, ri) => (
                <div key={row.id} className="rounded-lg border border-line p-3">
                  <RemoveRow onClick={() => patch({ servisPage: { ...content.servisPage, pricingRows: content.servisPage.pricingRows.filter((_, j) => j !== ri) } })} />
                  <Field label="Služba" value={row.service} onChange={(v) => { const r = [...content.servisPage.pricingRows]; r[ri] = { ...row, service: v }; patch({ servisPage: { ...content.servisPage, pricingRows: r } }); }} />
                  <Field label="Cena" value={row.price} onChange={(v) => { const r = [...content.servisPage.pricingRows]; r[ri] = { ...row, price: v }; patch({ servisPage: { ...content.servisPage, pricingRows: r } }); }} />
                  <Field label="Poznámka" value={row.note ?? ""} onChange={(v) => { const r = [...content.servisPage.pricingRows]; r[ri] = { ...row, note: v }; patch({ servisPage: { ...content.servisPage, pricingRows: r } }); }} />
                </div>
              ))}
            </Panel>
          </>
        )}

        {tab === "reviews" && (
          <Panel title="Recenze zákazníků">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={content.reviewsEnabled}
                onChange={(e) => patch({ reviewsEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-line text-brand"
              />
              <span>Recenze zapnuté na webu</span>
            </label>
            <AddRow
              label="Přidat vlastní recenzi"
              onClick={() =>
                patch({
                  reviews: [
                    {
                      id: newId("rev"),
                      author: "",
                      rating: 5,
                      text: "",
                      source: "manual",
                      status: "approved",
                      createdAt: new Date().toISOString().slice(0, 10),
                    },
                    ...content.reviews,
                  ],
                })
              }
            />
            {content.reviews
              .slice()
              .sort((a, b) => {
                const rank = (status: Review["status"]) =>
                  status === "pending" ? 0 : status === "approved" ? 1 : 2;
                return rank(a.status) - rank(b.status);
              })
              .map((review) => (
              <ReviewEditor
                key={review.id}
                review={review}
                onChange={(r) => {
                  const ri = content.reviews.findIndex((item) => item.id === review.id);
                  if (ri === -1) return;
                  const reviews = [...content.reviews];
                  reviews[ri] = r;
                  patch({ reviews });
                }}
                onRemove={() =>
                  patch({ reviews: content.reviews.filter((item) => item.id !== review.id) })
                }
              />
            ))}
          </Panel>
        )}

        {tab === "solutions" &&
          content.solutions.map((sol, si) => (
            <details key={sol.slug} open={si === 0} className="rounded-xl border border-line bg-surface p-4">
              <summary className="cursor-pointer text-lg font-semibold">{sol.title}</summary>
              <div className="mt-4 space-y-4">
                <Field label="Úvod kategorie" value={sol.intro} multiline onChange={(v) => updateSolution(si, { ...sol, intro: v })} />
                <Field label="Hero URL" value={sol.heroImage} onChange={(v) => updateSolution(si, { ...sol, heroImage: v })} />
                <TextBlocksEditor blocks={sol.textBlocks} onChange={(blocks) => updateSolution(si, { ...sol, textBlocks: blocks })} />
                <AddRow
                  label="Přidat skupinu produktů"
                  onClick={() =>
                    updateSolution(si, {
                      ...sol,
                      productGroups: [
                        ...sol.productGroups,
                        { slug: newId("grp"), name: "Nová skupina", summary: "", image: "", products: [] },
                      ],
                    })
                  }
                />
                {sol.productGroups.map((group, gi) => (
                  <GroupEditor
                    key={group.slug + gi}
                    group={group}
                    onChange={(g) => {
                      const groups = [...sol.productGroups];
                      groups[gi] = g;
                      updateSolution(si, { ...sol, productGroups: groups });
                    }}
                    onRemove={() => updateSolution(si, { ...sol, productGroups: sol.productGroups.filter((_, j) => j !== gi) })}
                  />
                ))}
              </div>
            </details>
          ))}

        {tab === "site" && (
          <>
            <Panel title="Proces spolupráce">
              <AddRow label="Přidat krok" onClick={() => patch({ processSteps: [...content.processSteps, { id: newId("ps"), step: "", title: "", text: "" }] })} />
              {content.processSteps.map((step, i) => (
                <div key={step.id} className="rounded-xl border border-line p-4">
                  <RemoveRow onClick={() => patch({ processSteps: content.processSteps.filter((_, j) => j !== i) })} />
                  <Field label="Číslo" value={step.step} onChange={(v) => { const s = [...content.processSteps]; s[i] = { ...step, step: v }; patch({ processSteps: s }); }} />
                  <Field label="Nadpis" value={step.title} onChange={(v) => { const s = [...content.processSteps]; s[i] = { ...step, title: v }; patch({ processSteps: s }); }} />
                  <Field label="Text" value={step.text} multiline onChange={(v) => { const s = [...content.processSteps]; s[i] = { ...step, text: v }; patch({ processSteps: s }); }} />
                </div>
              ))}
            </Panel>
            <Panel title="Proč SunBlinds">
              <AddRow label="Přidat sloupec" onClick={() => patch({ pillars: [...content.pillars, { id: newId("pl"), title: "", text: "" }] })} />
              {content.pillars.map((pillar, i) => (
                <div key={pillar.id} className="rounded-xl border border-line p-4">
                  <RemoveRow onClick={() => patch({ pillars: content.pillars.filter((_, j) => j !== i) })} />
                  <Field label="Nadpis" value={pillar.title} onChange={(v) => { const p = [...content.pillars]; p[i] = { ...pillar, title: v }; patch({ pillars: p }); }} />
                  <Field label="Text" value={pillar.text} multiline onChange={(v) => { const p = [...content.pillars]; p[i] = { ...pillar, text: v }; patch({ pillars: p }); }} />
                </div>
              ))}
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border border-line bg-surface p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function ListEditor({ title, items, onChange }: { title: string; items: string[]; onChange: (items: string[]) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <AddRow label="Přidat" onClick={() => onChange([...items, ""])} />
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input value={item} onChange={(e) => { const next = [...items]; next[i] = e.target.value; onChange(next); }} className="flex-1 rounded-lg border border-line px-3 py-2 text-sm" />
          <RemoveRow onClick={() => onChange(items.filter((_, j) => j !== i))} />
        </div>
      ))}
    </div>
  );
}

function GroupEditor({
  group,
  onChange,
  onRemove,
}: {
  group: ProductGroup;
  onChange: (g: ProductGroup) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-line bg-canvas p-4">
      <div className="mb-3 flex justify-between">
        <p className="font-semibold">{group.name || "Skupina produktů"}</p>
        <RemoveRow label="Odebrat skupinu" onClick={onRemove} />
      </div>
      <Field label="Slug skupiny" value={group.slug} onChange={(v) => onChange({ ...group, slug: v })} />
      <Field label="Název" value={group.name} onChange={(v) => onChange({ ...group, name: v })} />
      <Field label="Shrnutí" value={group.summary} multiline onChange={(v) => onChange({ ...group, summary: v })} />
      <Field label="Obrázek URL" value={group.image} onChange={(v) => onChange({ ...group, image: v })} />
      <AddRow
        label="Přidat produkt"
        onClick={() =>
          onChange({
            ...group,
            products: [
              ...group.products,
              {
                slug: newId("prod"),
                name: "",
                summary: "",
                description: "",
                image: "",
                features: [],
                textBlocks: [],
                specs: [],
              },
            ],
          })
        }
      />
      {group.products.map((product, pi) => (
        <ProductEditor
          key={product.slug + pi}
          product={product}
          onChange={(p) => {
            const products = [...group.products];
            products[pi] = p;
            onChange({ ...group, products });
          }}
          onRemove={() => onChange({ ...group, products: group.products.filter((_, j) => j !== pi) })}
        />
      ))}
    </div>
  );
}

function ProductEditor({
  product,
  onChange,
  onRemove,
}: {
  product: Product;
  onChange: (p: Product) => void;
  onRemove: () => void;
}) {
  return (
    <div className="mt-3 rounded-lg border border-line bg-surface p-3">
      <RemoveRow label="Odebrat produkt" onClick={onRemove} />
      <Field label="Slug" value={product.slug} onChange={(v) => onChange({ ...product, slug: v })} />
      <Field label="Název" value={product.name} onChange={(v) => onChange({ ...product, name: v })} />
      <Field label="Shrnutí" value={product.summary} onChange={(v) => onChange({ ...product, summary: v })} />
      <Field label="Popis" value={product.description} multiline onChange={(v) => onChange({ ...product, description: v })} />
      <Field label="Obrázek URL" value={product.image} onChange={(v) => onChange({ ...product, image: v })} />
      <input type="file" accept="image/*" className="mt-2 text-xs" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const url = await uploadImage(f); if (url) onChange({ ...product, image: url }); }} />
      <ListEditor title="Výhody / features" items={product.features} onChange={(features) => onChange({ ...product, features })} />
      <SpecsEditor specs={product.specs} onChange={(specs) => onChange({ ...product, specs })} />
      <TextBlocksEditor blocks={product.textBlocks} onChange={(textBlocks) => onChange({ ...product, textBlocks })} />
    </div>
  );
}

function ReviewEditor({
  review,
  onChange,
  onRemove,
}: {
  review: Review;
  onChange: (r: Review) => void;
  onRemove: () => void;
}) {
  return (
    <div className="mt-4 rounded-xl border border-line bg-canvas p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase text-muted">
          {review.status === "approved" ? "Schváleno" : review.status === "pending" ? "Ke schválení" : "Zamítnuto"}
          {review.source === "manual" ? " · vlastní" : " · zákazník"}
        </span>
        <RemoveRow label="Odebrat recenzi" onClick={onRemove} />
      </div>
      <div className="mb-3 rounded-lg border border-line bg-surface p-3 text-sm italic text-muted">
        Preview: &ldquo;{review.text || "…"}&rdquo; — {review.author || "Anonym"}, {review.rating}/5
      </div>
      <Field label="Autor" value={review.author} onChange={(v) => onChange({ ...review, author: v })} />
      <Field label="Hodnocení (1–5)" value={String(review.rating)} onChange={(v) => onChange({ ...review, rating: Math.min(5, Math.max(1, Number(v) || 5)) })} />
      <Field
        label="Text recenze"
        value={review.text}
        multiline
        maxLength={REVIEW_TEXT_MAX}
        onChange={(v) => onChange({ ...review, text: v })}
      />
      <Field label="Lokalita" value={review.location ?? ""} onChange={(v) => onChange({ ...review, location: v })} />
      <Field label="Produkt / služba" value={review.productHint ?? ""} onChange={(v) => onChange({ ...review, productHint: v })} />
      <label className="mt-2 block text-sm">
        <span className="font-medium">Stav</span>
        <select
          value={review.status}
          onChange={(e) => onChange({ ...review, status: e.target.value as Review["status"] })}
          className="mt-1 block w-full rounded-lg border border-line px-3 py-2 text-sm"
        >
          <option value="pending">Ke schválení</option>
          <option value="approved">Schváleno</option>
          <option value="rejected">Zamítnuto</option>
        </select>
      </label>
    </div>
  );
}

function SpecsEditor({
  specs,
  onChange,
}: {
  specs: { label: string; value: string }[];
  onChange: (specs: { label: string; value: string }[]) => void;
}) {
  return (
    <div className="mt-3 space-y-2">
      <div className="flex justify-between">
        <p className="text-xs font-semibold uppercase text-muted">Parametry</p>
        <AddRow label="Parametr" onClick={() => onChange([...specs, { label: "", value: "" }])} />
      </div>
      {specs.map((spec, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-2">
          <input value={spec.label} placeholder="Název" onChange={(e) => { const s = [...specs]; s[i] = { ...spec, label: e.target.value }; onChange(s); }} className="rounded border border-line px-2 py-1 text-sm" />
          <div className="flex gap-2">
            <input value={spec.value} placeholder="Hodnota" onChange={(e) => { const s = [...specs]; s[i] = { ...spec, value: e.target.value }; onChange(s); }} className="flex-1 rounded border border-line px-2 py-1 text-sm" />
            <RemoveRow onClick={() => onChange(specs.filter((_, j) => j !== i))} />
          </div>
        </div>
      ))}
    </div>
  );
}
