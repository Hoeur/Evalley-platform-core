"use server";

import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { normalizeError } from "@/core/http/normalize-error";

export async function createRefundAction(
  orderId: string,
  amount: number,
  reason: string,
) {
  try {
    await requireModuleAccess("orders", "orders.update");
    const refund = await getEcommerceCore().orders.createRefund(
      orderId,
      amount,
      reason || null,
    );
    return { ok: true as const, refund };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}
