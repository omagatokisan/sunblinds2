import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageSection } from "@/components/layout/PageSection";
import { CtaBand } from "@/components/sections/CtaBand";
import { UniformProductCatalog } from "@/components/reseni/UniformProductCatalog";
import { getProductGroup, getSolutions } from "@/lib/content";

type Props = { params: Promise<{ slug: string; groupSlug: string }> };

export async function generateStaticParams() {
  const solutions = await getSolutions();
  return solutions.flatMap((s) => s.productGroups.map((g) => ({ slug: s.slug, groupSlug: g.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, groupSlug } = await params;
  const data = await getProductGroup(slug, groupSlug);
  if (!data) return {};
  return { title: `${data.group.name} | ${data.solution.title}`, description: data.group.summary };
}

export default async function ProductGroupPage({ params }: Props) {
  const { slug, groupSlug } = await params;
  const data = await getProductGroup(slug, groupSlug);
  if (!data) notFound();

  const { solution, group } = data;

  return (
    <>
      <PageSection className="page-section--flush">
        <div className="hd-subpage-catalog">
          <div className="hd-subpage-catalog__mesh" aria-hidden />
          <Container width="wide" className="hd-shell reseni-page">
            <SectionHeading
              eyebrow={solution.title}
              title={group.name}
              description={group.summary}
              align="left"
            />
            <div className="solution-catalog-wrap">
              <UniformProductCatalog
                solution={solution}
                group={group}
                layout="category"
                nameFormat="category"
              />
            </div>
          </Container>
        </div>
      </PageSection>

      <CtaBand title={`Potřebujete poradit s výběrem — ${group.name}?`} />
    </>
  );
}
