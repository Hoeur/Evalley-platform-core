import { z } from "zod";

const optionalSlug = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]*$/, "Use letters, numbers, dashes, or underscores.")
  .nullable()
  .transform((value) => value || null);

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(255),
  description: z.string().trim().max(5000).optional(),
  nameKm: z.string().trim().max(255).optional(),
  descriptionKm: z.string().trim().max(5000).optional(),
  parentId: z.string().nullable(),
  slug: optionalSlug,
  status: z.enum(["draft", "published"]),
  order: z.number().int().min(0),
  featured: z.boolean(),
});

export const brandFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(255),
  description: z.string().trim().max(5000).optional(),
  nameKm: z.string().trim().max(255).optional(),
  descriptionKm: z.string().trim().max(5000).optional(),
  slug: optionalSlug,
  website: z
    .union([z.url("Enter a valid URL."), z.literal("")])
    .nullable()
    .transform((value) => value || null),
  status: z.enum(["draft", "published"]),
  order: z.number().int().min(0),
  featured: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
export type BrandFormValues = z.infer<typeof brandFormSchema>;
