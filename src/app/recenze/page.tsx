import { buildPageMetadata } from "@/lib/seo";
import { SubpageContent } from "@/components/layout/SubpageContent";
import { SubpageLayout } from "@/components/layout/SubpageLayout";
import { ReviewsLiveSection } from "@/components/reviews/ReviewsLiveSection";
import { loadSiteContent } from "@/lib/content";

export const metadata = buildPageMetadata({
  title: "Recenze",
  description: "Hodnocení zákazníků SunBlinds.",
  path: "/recenze",
});

export default async function ReviewsPage() {
  const { reviews, reviewsEnabled, gdprConsent } = await loadSiteContent();
  const approved = reviews.filter((r) => r.status === "approved");

  return (
    <SubpageLayout cta>
      {reviewsEnabled ? (
        <SubpageContent tone="inset" narrow containerClassName="max-w-5xl">
          <ReviewsLiveSection initialReviews={approved} gdprConsent={gdprConsent} />
        </SubpageContent>
      ) : (
        <SubpageContent>
          <p className="text-center text-muted">Recenze jsou dočasně vypnuté. Děkujeme za pochopení.</p>
        </SubpageContent>
      )}
    </SubpageLayout>
  );
}
