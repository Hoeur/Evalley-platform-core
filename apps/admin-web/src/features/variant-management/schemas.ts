import { z } from "zod";

export const variantDetailsSchema = z
  .object({
    name: z.string().trim().max(255).optional(),
    description: z.string().trim().max(10000).optional(),
    nameKm: z.string().trim().max(255).optional(),
    descriptionKm: z.string().trim().max(10000).optional(),
    sku: z.string().trim().max(255).optional(),
    barcode: z.string().trim().max(255).optional(),
    price: z.number().min(0),
    salePrice: z.number().min(0).nullable(),
    saleStartsAt: z.string().nullable(),
    saleEndsAt: z.string().nullable(),
    weight: z.number().min(0).nullable(),
    length: z.number().min(0).nullable(),
    width: z.number().min(0).nullable(),
    height: z.number().min(0).nullable(),
    status: z.enum(["draft", "published"]),
    featured: z.boolean(),
  })
  .refine(
    (value) => value.salePrice === null || value.salePrice <= value.price,
    { path: ["salePrice"], message: "Sale price cannot exceed price." },
  )
  .refine(
    (value) =>
      !value.saleStartsAt ||
      !value.saleEndsAt ||
      value.saleEndsAt >= value.saleStartsAt,
    { path: ["saleEndsAt"], message: "Sale end must be after sale start." },
  );

export const createVariantSchema = variantDetailsSchema.and(
  z.object({
    attributeValueIds: z
      .array(z.string())
      .min(1, "Choose at least one attribute value."),
  }),
);

export type VariantDetailsValues = z.infer<typeof variantDetailsSchema>;
export type CreateVariantValues = z.infer<typeof createVariantSchema>;
