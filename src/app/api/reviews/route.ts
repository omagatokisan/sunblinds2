import { NextResponse } from "next/server";
import { z } from "zod";
import { getReviewsStore, addReview, getApprovedReviews } from "@/lib/cms/reviews-store";
import { newId } from "@/lib/cms/types";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { REVIEW_TEXT_MAX, REVIEW_TEXT_MIN } from "@/lib/reviews/constants";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(200).optional()
);

const schema = z.object({
  author: z.string().trim().min(2, "Jméno musí mít alespoň 2 znaky.").max(120),
  rating: z.coerce.number().int().min(1).max(5),
  text: z
    .string()
    .trim()
    .min(REVIEW_TEXT_MIN, "Napište krátkou zkušenost (alespoň 3 znaky).")
    .max(REVIEW_TEXT_MAX, `Text recenze může mít nejvýše ${REVIEW_TEXT_MAX} znaků.`),
  location: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(120).optional()
  ),
  productHint: optionalText,
});
function validationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Zkontrolujte prosím vyplněné údaje.";
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = await checkRateLimit(`review:${ip}`, 3, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Příliš mnoho pokusů. Zkuste znovu za ${limit.retryAfterSec} s.` },
      { status: 429 }
    );
  }

  const store = await getReviewsStore();
  if (!store.enabled) {
    return NextResponse.json({ error: "Recenze jsou dočasně vypnuté." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatná data." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: validationMessage(parsed.error) }, { status: 400 });
  }

  const review = {
    id: newId("rev"),
    ...parsed.data,
    source: "customer" as const,
    status: "approved" as const,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  await addReview(review);
  return NextResponse.json({ ok: true, review });
}

export async function GET() {
  const store = await getReviewsStore();
  if (!store.enabled) {
    return NextResponse.json({ reviews: [], enabled: false });
  }
  return NextResponse.json({ reviews: getApprovedReviews(store), enabled: true });
}
