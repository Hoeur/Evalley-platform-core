import { z } from "zod";

export const attributeSetSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(255),
  nameKm: z.string().trim().max(255).optional(),
  code: z
    .string()
    .trim()
    .min(1, "Code is required.")
    .max(255)
    .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, dashes, or underscores."),
  order: z.number().int().min(0),
});

export const attributeValueSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(255),
  nameKm: z.string().trim().max(255).optional(),
  order: z.number().int().min(0),
});

export type AttributeSetFormValues = z.infer<typeof attributeSetSchema>;
export type AttributeValueFormValues = z.infer<typeof attributeValueSchema>;
