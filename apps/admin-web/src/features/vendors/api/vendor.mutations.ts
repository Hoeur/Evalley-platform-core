"use server";

import type { CommissionType, StoreStatus } from "@platform/ecommerce-core";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { normalizeError } from "@/core/http/normalize-error";

export async function updateVendorStatusAction(
  id: string,
  status: StoreStatus,
  reason?: string,
) {
  try {
    await requireModuleAccess("vendors", "vendors.manage");
    const store = await getEcommerceCore().vendors.updateStoreStatus(id, {
      status,
      reason: reason ?? null,
    });
    return { ok: true as const, store };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function updateVendorCommissionAction(
  id: string,
  commissionType: CommissionType,
  commissionValue: number,
) {
  try {
    await requireModuleAccess("vendors", "vendors.manage");
    const store = await getEcommerceCore().vendors.updateStoreCommission(id, {
      commissionType,
      commissionValue,
    });
    return { ok: true as const, store };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function adjustVendorBalanceAction(
  id: string,
  amount: number,
  note: string,
) {
  try {
    await requireModuleAccess("vendors", "vendors.manage");
    const entry = await getEcommerceCore().vendors.adjustStoreBalance(id, {
      amount,
      note,
    });
    return { ok: true as const, entry };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}
