"use server";

import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { normalizeError } from "@/core/http/normalize-error";

export async function resetCustomerPasswordAction(id: string, password: string) {
  try {
    await requireModuleAccess("customers", "customers.update");
    await getEcommerceCore().customers.resetPassword(id, password);
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}
