import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageSection } from "@/components/layout/PageSection";
import { CtaBand } from "@/components/sections/CtaBand";
import { SolutionsCatalog } from "@/components/reseni/SolutionsCatalog";
import { getSolutions } from "@/lib/content";

export const metadata: Metadata = {
  title: "Řešení",
  description:
    "Přehled venkovního a interiérového stínění, oken, sítí, samonosných systémů a garážových vrat.",
};

export default async function SolutionsHubPage() {
  const solutions = await getSolutions();

  return (
    <>
      <PageSection className="page-section--flush">
        <div className="hd-subpage-catalog">
          <div className="hd-subpage-catalog__mesh" aria-hidden />
          <Container width="wide" className="hd-shell reseni-page">
            <SectionHeading
              eyebrow="Katalog"
              title="Všechny oblasti"
              description="Vyberte oblast podle projektu — u každé najdete produkty s parametry montáže."
              align="left"
            />
            <div className="solution-catalog-wrap">
              <SolutionsCatalog solutions={solutions} />
            </div>
          </Container>
        </div>
      </PageSection>

      <CtaBand />
    </>
  );
}
