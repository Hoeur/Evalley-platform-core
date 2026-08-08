"use server";

import type {
  SaveShippingCarrierInput,
  SaveShippingZoneInput,
} from "@platform/ecommerce-core";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { normalizeError } from "@/core/http/normalize-error";

export async function createCarrierAction(input: SaveShippingCarrierInput) {
  try {
    await requireModuleAccess("shipping", "shipping.manage");
    const carrier = await getEcommerceCore().shipping.createCarrier(input);
    return { ok: true as const, carrier };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function updateCarrierAction(
  id: string,
  input: Partial<SaveShippingCarrierInput>,
) {
  try {
    await requireModuleAccess("shipping", "shipping.manage");
    const carrier = await getEcommerceCore().shipping.updateCarrier(id, input);
    return { ok: true as const, carrier };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function deleteCarrierAction(id: string) {
  try {
    await requireModuleAccess("shipping", "shipping.manage");
    await getEcommerceCore().shipping.deleteCarrier(id);
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function createZoneAction(input: SaveShippingZoneInput) {
  try {
    await requireModuleAccess("shipping", "shipping.manage");
    const zone = await getEcommerceCore().shipping.createZone(input);
    return { ok: true as const, zone };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function updateZoneAction(
  id: string,
  input: Partial<SaveShippingZoneInput>,
) {
  try {
    await requireModuleAccess("shipping", "shipping.manage");
    const zone = await getEcommerceCore().shipping.updateZone(id, input);
    return { ok: true as const, zone };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function deleteZoneAction(id: string) {
  try {
    await requireModuleAccess("shipping", "shipping.manage");
    await getEcommerceCore().shipping.deleteZone(id);
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function deleteMethodAction(id: string) {
  try {
    await requireModuleAccess("shipping", "shipping.manage");
    await getEcommerceCore().shipping.deleteMethod(id);
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}
