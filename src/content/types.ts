import { z } from 'zod';

export const ProjectMetaSchema = z.object({
  slug: z.string(),
  title: z.string(),
  year: z.number(),
  location: z.string(),
  category: z.enum(['residencial', 'comercial', 'corporativo', 'interiores']),
  team: z.array(z.string()).optional(),
  photographer: z.string().optional(),
  description: z.string().optional(),
});

/** Shared image fields inside gallery cards. */
export const GalleryImageSchema = z.object({
  slug: z.string(),
  src: z.string(),
  alt: z.string().min(1),
  isPlaceholder: z.boolean().optional(),
  project: ProjectMetaSchema.optional(),
});

/**
 * Gallery track cards (storyboard):
 * - single — full-height portrait
 * - stack  — two stacked landscapes
 * - quote  — manifesto text + reduced portrait/landscape
 */
export const GalleryItemSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('single'),
    image: GalleryImageSchema,
  }),
  z.object({
    kind: z.literal('stack'),
    images: z.tuple([GalleryImageSchema, GalleryImageSchema]),
  }),
  z.object({
    kind: z.literal('quote'),
    text: z.string().min(1),
    image: GalleryImageSchema.extend({
      aspect: z.enum(['portrait', 'landscape']),
    }),
  }),
]);

export const TestimonialSchema = z.object({
  id: z.string(),
  quote: z.string(),
  authorName: z.string(),
  projectType: z.string(),
  avatar: z.string(),
  isPlaceholder: z.boolean().optional(),
});

export const ProcessActSchema = z.object({
  index: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]),
  title: z.string(),
  body: z.string(),
});

export type ProjectMeta = z.infer<typeof ProjectMetaSchema>;
export type GalleryImage = z.infer<typeof GalleryImageSchema>;
export type GalleryItem = z.infer<typeof GalleryItemSchema>;
export type Testimonial = z.infer<typeof TestimonialSchema>;
export type ProcessAct = z.infer<typeof ProcessActSchema>;
