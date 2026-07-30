"use server";

import { revalidatePath } from "next/cache";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { normalizeError } from "@/core/http/normalize-error";
import { inventorySettingsSchema, stockMovementSchema } from "./schemas";

function failure(error: unknown) {
  return { ok: false as const, error: normalizeError(error).message };
}

export async function updateInventorySettingsAction(input: unknown) {
  try {
    await requireModuleAccess("inventory", "inventory.manage");
    const values = inventorySettingsSchema.parse(input);
    const item = await getEcommerceCore().inventory.updateSettings(
      values.productId,
      values,
    );
    revalidatePath("/inventory");
    revalidatePath("/products");
    return { ok: true as const, item };
  } catch (error) {
    return failure(error);
  }
}

export async function applyStockMovementAction(input: unknown) {
  try {
    await requireModuleAccess("inventory", "inventory.manage");
    const values = stockMovementSchema.parse(input);
    const item = await getEcommerceCore().inventory.applyMovement(
      values.productId,
      {
        delta: values.delta,
        reason: values.reason,
        note: values.note || null,
        referenceKey: values.referenceKey || null,
      },
    );
    revalidatePath("/inventory");
    revalidatePath("/products");
    return { ok: true as const, item };
  } catch (error) {
    return failure(error);
  }
}

export async function getStockMovementsAction(productId: string) {
  try {
    await requireModuleAccess("inventory", "inventory.read");
    const page = await getEcommerceCore().inventory.movements(productId, {
      perPage: 100,
    });
    return { ok: true as const, items: page.items };
  } catch (error) {
    return failure(error);
  }
}
