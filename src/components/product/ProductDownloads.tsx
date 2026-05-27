import Link from "next/link";
import { SectionHead } from "@/components/sections/SectionHead";
import { Button } from "@/components/ui/Button";
import type { ProductDownload } from "@/lib/cms/types";

type Props = {
  downloads: ProductDownload[];
  productName?: string;
  inquiryHref?: string;
};

export function ProductDownloads({ downloads, productName, inquiryHref }: Props) {
  const hasFiles = downloads.length > 0;

  return (
    <section className="pd-section pd-section--soft" id="ke-stazeni">
      <div className="hd-shell">
        <SectionHead
          eyebrow="Dokumentace"
          title="Ke stažení"
          lead={hasFiles ? undefined : "Technické listy doplníme nebo zašleme na vyžádání."}
          align="left"
        />

        {hasFiles ? (
          <div className="pd-downloads">
            {downloads.map((doc) => (
              <Link key={doc.id} href={doc.url} className="pd-download group">
                <div className="pd-download__icon" aria-hidden>
                  {doc.format.slice(0, 3).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink group-hover:text-brand">{doc.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{doc.subtitle}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-muted">
                    {doc.format}
                    {doc.sizeLabel ? ` · ${doc.sizeLabel}` : ""}
                  </p>
                </div>
                <span className="text-brand opacity-60 transition-opacity group-hover:opacity-100">
                  ↓
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="pd-download-empty">
            <p className="font-display text-lg font-semibold text-ink">
              {productName ? `Dokumentace k ${productName}` : "Dokumentace k produktu"}
            </p>
            {inquiryHref ? (
              <div className="mt-5">
                <Button href={inquiryHref} className="hd-btn hd-btn--primary">
                  Požádat o podklady
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
