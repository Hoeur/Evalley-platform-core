"use server";

import type { SavePromotionInput } from "@platform/ecommerce-core";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { normalizeError } from "@/core/http/normalize-error";

export async function createPromotionAction(input: SavePromotionInput) {
  try {
    await requireModuleAccess("promotions", "promotions.manage");
    const promotion = await getEcommerceCore().promotions.create(input);
    return { ok: true as const, promotion };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function publishPromotionAction(id: string) {
  try {
    await requireModuleAccess("promotions", "promotions.manage");
    const promotion = await getEcommerceCore().promotions.publish(id);
    return { ok: true as const, promotion };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function pausePromotionAction(id: string) {
  try {
    await requireModuleAccess("promotions", "promotions.manage");
    const promotion = await getEcommerceCore().promotions.pause(id);
    return { ok: true as const, promotion };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function deletePromotionAction(id: string) {
  try {
    await requireModuleAccess("promotions", "promotions.manage");
    await getEcommerceCore().promotions.delete(id);
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}
