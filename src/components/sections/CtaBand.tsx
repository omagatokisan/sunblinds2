import Link from "next/link";
import { SectionHead } from "@/components/sections/SectionHead";

export function CtaBand({
  title = "Nevíte, které řešení je pro váš dům?",
  description = "Napište typ stavby a co řešíte — orientačně poradíme po telefonu, u větších zakázek přijedeme zaměřit.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="hd-block hd-page-cta" aria-label="Výzva k akci">
      <div className="hd-page-cta__mesh" aria-hidden />
      <div className="hd-shell hd-page-cta__shell">
        <div className="hd-page-cta__grid">
          <SectionHead eyebrow="Další krok" title={title} lead={description} align="left" />
          <div className="hd-page-cta__actions">
            <Link href="/poptavka" className="hd-btn hd-btn--primary">
              Nezávazná poptávka
            </Link>
            <Link href="/kontakt" className="hd-link">
              Kontakt a telefon →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
