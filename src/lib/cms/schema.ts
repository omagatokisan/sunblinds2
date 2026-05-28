import { z } from "zod";
import { REVIEW_TEXT_MAX } from "@/lib/reviews/constants";

const textBlockSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().max(200).optional(),
  content: z.string().max(10000),
});

const productHotspotSchema = z.object({
  id: z.string().max(80),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  title: z.string().max(200),
  text: z.string().max(2000),
  link: z
    .object({ href: z.string().max(500), label: z.string().max(120) })
    .optional(),
});

const productDesignOptionSchema = z.object({
  id: z.string().max(80),
  title: z.string().max(200),
  description: z.string().max(500),
  image: z.string().max(2000),
  href: z.string().max(500),
});

const productDownloadSchema = z.object({
  id: z.string().max(80),
  title: z.string().max(200),
  subtitle: z.string().max(300),
  url: z.string().max(2000),
  format: z.string().max(40),
  sizeLabel: z.string().max(80).optional(),
});

const productGallerySchema = z.object({
  id: z.string().max(80),
  image: z.string().max(2000),
  caption: z.string().max(300).optional(),
});

const productRelatedSchema = z.object({
  id: z.string().max(80),
  title: z.string().max(200),
  description: z.string().max(500),
  href: z.string().max(500),
  image: z.string().max(2000).optional(),
});

const productSchema = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(200),
  summary: z.string().max(500),
  description: z.string().max(10000),
  image: z.string().max(2000),
  features: z.array(z.string().max(300)).max(30),
  textBlocks: z.array(textBlockSchema).max(30),
  specs: z.array(z.object({ label: z.string().max(120), value: z.string().max(300) })).max(30),
  eyebrow: z.string().max(200).optional(),
  diagramImage: z.string().max(2000).optional(),
  hotspots: z.array(productHotspotSchema).max(12).optional(),
  designOptions: z.array(productDesignOptionSchema).max(12).optional(),
  downloads: z.array(productDownloadSchema).max(12).optional(),
  inspirationGallery: z.array(productGallerySchema).max(8).optional(),
  relatedTopics: z.array(productRelatedSchema).max(8).optional(),
});

const productGroupSchema = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(200),
  summary: z.string().max(500),
  image: z.string().max(2000),
  products: z.array(productSchema).max(80),
});

const solutionSchema = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  shortTitle: z.string().max(80),
  summary: z.string().max(500),
  heroImage: z.string().min(1).max(2000),
  intro: z.string().max(5000),
  benefits: z.array(z.string().max(300)).max(20),
  idealFor: z.array(z.string().max(100)).max(20),
  textBlocks: z.array(textBlockSchema).max(20),
  productGroups: z.array(productGroupSchema).max(30),
  mosaicLayout: z.enum(["default", "featured"]).optional(),
});

export const siteContentSchema = z.object({
  version: z.number().int().positive(),
  reviewsEnabled: z.boolean(),
  gdprConsent: z.object({
    textBeforeLink: z.string().max(500),
    linkLabel: z.string().max(120),
    linkHref: z.string().max(200),
  }),
  showroom: z.object({
    title: z.string().max(200),
    intro: z.string().max(3000),
    heroImage: z.string().max(2000),
    addressLine1: z.string().max(200),
    addressLine2: z.string().max(200),
    hours: z.string().max(300),
    phone: z.string().max(40),
    email: z.string().max(120),
    lat: z.number(),
    lng: z.number(),
    highlights: z.array(z.object({ id: z.string(), title: z.string().max(200), text: z.string().max(500) })).max(20),
    textBlocks: z.array(textBlockSchema).max(20),
  }),
  privacy: z.object({
    title: z.string().max(200),
    intro: z.string().max(3000),
    updatedLabel: z.string().max(120),
    sections: z.array(textBlockSchema).max(50),
  }),
  inquiryOptions: z.object({
    mountingTypes: z.array(z.string().max(120)).max(20),
    controlTypes: z.array(z.string().max(120)).max(20),
    locationTypes: z.array(z.string().max(120)).max(20),
  }),
  home: z.object({
    heroTitle: z.string().max(300),
    heroLead: z.string().max(1000),
    solutionsTitle: z.string().max(200),
    solutionsDescription: z.string().max(1000),
    whyTitle: z.string().max(200),
    responseTime: z.string().max(200),
  }),
  contact: z.object({
    heroTitle: z.string().max(300),
    heroLead: z.string().max(1000),
    formTitle: z.string().max(200),
    formLead: z.string().max(500),
  }),
  aboutPage: z.object({
    heroLead: z.string().max(1000),
    introTitle: z.string().max(300),
    introLead: z.string().max(1000),
    introBody: z.string().max(3000),
    storyTitle: z.string().max(200),
    storyBody: z.string().max(3000),
    stats: z
      .array(z.object({ id: z.string(), value: z.string().max(40), label: z.string().max(120) }))
      .max(8),
    scopeTitle: z.string().max(200),
    scopeLead: z.string().max(1000),
    showroomTitle: z.string().max(300),
    showroomBody: z.string().max(2000),
    servisTitle: z.string().max(300),
    servisBody: z.string().max(2000),
  }),
  servisPage: z.object({
    heroTitle: z.string().max(300),
    heroLead: z.string().max(1000),
    intro: z.string().max(3000),
    servicedTags: z.array(z.string().max(120)).max(20),
    categories: z
      .array(
        z.object({
          id: z.string(),
          title: z.string().max(200),
          shortText: z.string().max(500),
          longText: z.string().max(3000),
          icon: z.enum(["shading", "windows", "pergola", "garage"]),
        })
      )
      .max(20),
    pricingTitle: z.string().max(200),
    pricingNote: z.string().max(1000),
    pricingRows: z
      .array(
        z.object({
          id: z.string(),
          service: z.string().max(300),
          price: z.string().max(120),
          note: z.string().max(300).optional(),
        })
      )
      .max(40),
  }),
  reviews: z
    .array(
      z.object({
        id: z.string(),
        author: z.string().max(120),
        rating: z.number().int().min(1).max(5),
        text: z.string().max(REVIEW_TEXT_MAX),
        location: z.string().max(120).optional(),
        productHint: z.string().max(200).optional(),
        source: z.enum(["customer", "manual"]),
        status: z.enum(["pending", "approved", "rejected"]),
        createdAt: z.string().max(40),
      })
    )
    .max(200),
  departments: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        label: z.string().max(120),
        phone: z.string().max(40),
        hours: z.string().max(120),
        hint: z.string().max(400),
      })
    )
    .max(30),
  technicians: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        name: z.string().max(120),
        role: z.string().max(120),
        photo: z.string().max(2000),
        shortBio: z.string().max(300),
        fullBio: z.string().max(5000),
      })
    )
    .max(50),
  servisBlocks: z
    .array(z.object({ id: z.string(), title: z.string().max(200), text: z.string().max(500) }))
    .max(30),
  solutions: z.array(solutionSchema).max(30),
  processSteps: z
    .array(z.object({ id: z.string(), step: z.string().max(10), title: z.string().max(120), text: z.string().max(500) }))
    .max(15),
  pillars: z
    .array(z.object({ id: z.string(), title: z.string().max(200), text: z.string().max(500) }))
    .max(15),
  faq: z
    .array(
      z.object({
        id: z.string(),
        question: z.string().max(300),
        answer: z.string().max(2000),
      })
    )
    .max(20),
  references: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().max(200),
        location: z.string().max(120),
        scope: z.string().max(200),
        text: z.string().max(2000),
        image: z.string().max(2000),
      })
    )
    .max(12),
});
