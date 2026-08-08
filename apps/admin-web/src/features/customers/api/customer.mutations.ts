"use server";

import type { SaveCustomerInput } from "@platform/ecommerce-core";
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

export async function updateCustomerAction(id: string, input: SaveCustomerInput) {
  try {
    await requireModuleAccess("customers", "customers.update");
    const customer = await getEcommerceCore().customers.update(id, input);
    return { ok: true as const, customer };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function suspendCustomerAction(id: string, reason?: string) {
  try {
    await requireModuleAccess("customers", "customers.update");
    const customer = await getEcommerceCore().customers.suspend(id, reason);
    return { ok: true as const, customer };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function activateCustomerAction(id: string) {
  try {
    await requireModuleAccess("customers", "customers.update");
    const customer = await getEcommerceCore().customers.activate(id);
    return { ok: true as const, customer };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    await requireModuleAccess("customers", "customers.update");
    await getEcommerceCore().customers.delete(id);
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}
