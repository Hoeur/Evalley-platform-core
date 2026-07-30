import { z } from "zod";

export const inventorySettingsSchema = z.object({
  productId: z.string().min(1),
  manageStock: z.boolean(),
  allowBackorder: z.boolean(),
  lowStockThreshold: z.number().int().min(0).nullable(),
  expectedVersion: z.number().int().min(0),
});

export const stockMovementSchema = z.object({
  productId: z.string().min(1),
  delta: z
    .number()
    .int()
    .refine((value) => value !== 0, {
      message: "Quantity change cannot be zero.",
    }),
  reason: z.enum([
    "stock_in",
    "stock_out",
    "manual_adjustment",
    "return",
    "damage",
    "inventory_count",
  ]),
  note: z.string().trim().max(1000).optional(),
  referenceKey: z.string().trim().max(255).optional(),
});

export type InventorySettingsValues = z.infer<typeof inventorySettingsSchema>;
export type StockMovementValues = z.infer<typeof stockMovementSchema>;
