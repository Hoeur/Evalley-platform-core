"use server";

import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { normalizeError } from "@/core/http/normalize-error";

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    await requireModuleAccess("orders", "orders.update");
    const order = await getEcommerceCore().orders.updateStatus(orderId, status);
    return { ok: true as const, order };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function cancelOrderAction(orderId: string) {
  return updateOrderStatusAction(orderId, "cancelled");
}

export async function markOrderPaidAction(orderId: string) {
  try {
    await requireModuleAccess("orders", "orders.update");
    const order = await getEcommerceCore().orders.markPaid(orderId);
    return { ok: true as const, order };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}
