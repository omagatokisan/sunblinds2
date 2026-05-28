"use client";

import type { TextBlock } from "@/lib/cms/types";
import { newId } from "@/lib/cms/types";

export function Field({
  label,
  value,
  onChange,
  multiline,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          rows={3}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2"
        />
      ) : (
        <input
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2"
        />
      )}
      {maxLength ? (
        <span className="mt-1 block text-right text-xs text-muted">
          {value.length} / {maxLength}
        </span>
      ) : null}
    </label>
  );
}

export function RemoveRow({ onClick, label = "Odebrat" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="text-xs font-medium text-red-600 hover:underline">
      {label}
    </button>
  );
}

export function AddRow({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-canvas px-4 py-2 text-sm font-semibold ring-1 ring-line hover:bg-surface"
    >
      + {label}
    </button>
  );
}

export function TextBlocksEditor({
  blocks,
  onChange,
}: {
  blocks: TextBlock[];
  onChange: (blocks: TextBlock[]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Textové bloky</p>
        <AddRow
          label="Přidat blok"
          onClick={() => onChange([...blocks, { id: newId("tb"), title: "", content: "" }])}
        />
      </div>
      {blocks.map((block, i) => (
        <div key={block.id} className="rounded-lg border border-line bg-canvas p-3">
          <div className="mb-2 flex justify-end">
            <RemoveRow onClick={() => onChange(blocks.filter((_, j) => j !== i))} />
          </div>
          <Field
            label="Nadpis (volitelný)"
            value={block.title ?? ""}
            onChange={(v) => {
              const next = [...blocks];
              next[i] = { ...block, title: v };
              onChange(next);
            }}
          />
          <div className="mt-2">
            <Field
              label="Obsah"
              value={block.content}
              multiline
              onChange={(v) => {
                const next = [...blocks];
                next[i] = { ...block, content: v };
                onChange(next);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export async function uploadImage(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  if (!res.ok) return null;
  const data = (await res.json()) as { url: string };
  return data.url;
}
