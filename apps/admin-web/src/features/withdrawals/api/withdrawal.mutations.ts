"use server";

import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { normalizeError } from "@/core/http/normalize-error";

type ProcessStatus = "approved" | "rejected" | "paid";

export async function processWithdrawalAction(
  id: string,
  status: ProcessStatus,
  reason?: string,
) {
  try {
    await requireModuleAccess("withdrawals", "withdrawals.manage");
    const withdrawal = await getEcommerceCore().vendors.processWithdrawal(id, {
      status,
      reason: reason ?? null,
    });
    return { ok: true as const, withdrawal };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}
