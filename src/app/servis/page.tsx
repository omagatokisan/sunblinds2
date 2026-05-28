import { buildPageMetadata } from "@/lib/seo";
import { SubpageContent } from "@/components/layout/SubpageContent";
import { SubpageLayout } from "@/components/layout/SubpageLayout";
import { CallButton } from "@/components/call/CallButton";
import { TechnicianCard } from "@/components/servis/TechnicianCard";
import { ServisCategoryCard } from "@/components/servis/ServisCategoryCard";
import { ServisPricingTable } from "@/components/servis/ServisPricingTable";
import { loadSiteContent } from "@/lib/content";
import { Button } from "@/components/ui/Button";

export const metadata = buildPageMetadata({
  title: "Servis",
  description: "Záruční i pozáruční servis stínění, oken, pergol a garážových vrat.",
  path: "/servis",
});

export default async function ServicePage() {
  const { technicians, servisPage } = await loadSiteContent();

  return (
    <SubpageLayout
      toolbar={
        <div className="page-toolbar-actions">
          <CallButton departmentId="servis">Volat servis</CallButton>
          <Button href="/poptavka" variant="secondary">
            Napsat požadavek
          </Button>
        </div>
      }
      cta={{ title: "Objednejte si servisní zásah od profesionálů" }}
    >
      <SubpageContent>
        <p className="label-caps label-caps--plain">Servisujeme</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {servisPage.servicedTags.map((tag) => (
            <span key={tag} className="hd-tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-10 subpage-card-grid subpage-card-grid--2">
          {servisPage.categories.map((cat) => (
            <ServisCategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </SubpageContent>

      <SubpageContent tone="inset">
        <ServisPricingTable
          title={servisPage.pricingTitle}
          note={servisPage.pricingNote}
          rows={servisPage.pricingRows}
        />
      </SubpageContent>

      <SubpageContent>
        <p className="label-caps label-caps--plain">Servisní technici</p>
        <div className="mt-6 subpage-card-grid subpage-card-grid--2">
          {technicians.map((t) => (
            <TechnicianCard key={t.id} technician={t} />
          ))}
        </div>
      </SubpageContent>
    </SubpageLayout>
  );
}
