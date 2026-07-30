import { z } from "zod";

const optionalNumber = z.number().min(0).nullable();
const optionalText = z.string().trim().max(255);

export const productSchema = z
  .object({
    name: z.string().trim().min(1, "English name is required.").max(255),
    description: z.string().trim().max(10000).optional(),
    nameKm: z.string().trim().max(255).optional(),
    descriptionKm: z.string().trim().max(10000).optional(),
    sku: optionalText,
    barcode: optionalText,
    slug: z
      .string()
      .trim()
      .max(255)
      .regex(
        /^[A-Za-z0-9_-]*$/,
        "Use letters, numbers, dashes, or underscores.",
      )
      .optional(),
    brandId: z.string().nullable(),
    categoryIds: z.array(z.string()),
    price: z.number().min(0, "Price cannot be negative."),
    salePrice: optionalNumber,
    saleStartsAt: z.string().nullable(),
    saleEndsAt: z.string().nullable(),
    weight: optionalNumber,
    length: optionalNumber,
    width: optionalNumber,
    height: optionalNumber,
    stock: z.number().int().min(0, "Stock cannot be negative."),
    status: z.enum(["draft", "active"]),
    featured: z.boolean(),
    order: z.number().int().min(0),
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
export type ProductFormValues = z.infer<typeof productSchema>;
