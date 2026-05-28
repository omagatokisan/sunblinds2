import type { ServisPricingRow } from "@/lib/cms/types";

export function ServisPricingTable({
  title,
  note,
  rows,
}: {
  title: string;
  note: string;
  rows: ServisPricingRow[];
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-center text-2xl font-semibold text-ink">{title}</h2>
      <p className="mt-3 text-center text-sm text-muted">{note}</p>
      <div className="hd-price-list mt-10" role="list">
        <div className="hd-price-list__head" aria-hidden>
          <span>Služba</span>
          <span>Cena</span>
        </div>
        {rows.map((row) => (
          <div key={row.id} className="hd-price-list__row" role="listitem">
            <div className="hd-price-list__service">
              <span className="font-medium text-ink">{row.service}</span>
              {row.note ? <span className="mt-1 block text-xs text-muted">{row.note}</span> : null}
            </div>
            <div className="hd-price-list__price">{row.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
