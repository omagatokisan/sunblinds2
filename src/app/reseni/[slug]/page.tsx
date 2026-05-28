import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageSection } from "@/components/layout/PageSection";
import { CtaBand } from "@/components/sections/CtaBand";
import { SolutionCatalogPanel } from "@/components/reseni/SolutionCatalogPanel";
import { TextBlocks } from "@/components/ui/TextBlocks";
import { getSolution, getSolutions } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const solutions = await getSolutions();
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const solution = await getSolution(slug);
  if (!solution) return {};
  return { title: solution.title, description: solution.summary };
}

export default async function SolutionDetailPage({ params }: Props) {
  const { slug } = await params;
  const solution = await getSolution(slug);
  if (!solution) notFound();

  const hasHighlights = solution.benefits.length > 0 || solution.idealFor.length > 0;

  return (
    <>
      <PageSection className="page-section--flush">
        <div className="hd-subpage-catalog">
          <div className="hd-subpage-catalog__mesh" aria-hidden />
          <Container width="wide" className="hd-shell reseni-page">
            <SectionHeading
              eyebrow="Katalog"
              title="Produkty podle kategorie"
              description="Podkategorie pod sebou — u každé najdete modely v přehledné mřížce, bez horizontálního posuvníku."
              align="left"
            />
            <div className="solution-catalog-wrap">
              <SolutionCatalogPanel solution={solution} />
            </div>

          {hasHighlights ? (
            <div className="solution-highlights">
              {solution.benefits.length ? (
                <div className="solution-highlights__block">
                  <h3 className="solution-highlights__title">Proč toto řešení</h3>
                  <ul className="solution-highlights__list">
                    {solution.benefits.map((benefit) => (
                      <li key={benefit}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {solution.idealFor.length ? (
                <div className="solution-highlights__block">
                  <h3 className="solution-highlights__title">Vhodné pro</h3>
                  <ul className="solution-highlights__tags">
                    {solution.idealFor.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {solution.textBlocks.length ? (
            <div className="solution-catalog-notes">
              <TextBlocks blocks={solution.textBlocks} />
            </div>
          ) : null}
          </Container>
        </div>
      </PageSection>

      <CtaBand title={`Chcete poradit s ${solution.title.toLowerCase()}?`} />
    </>
  );
}
