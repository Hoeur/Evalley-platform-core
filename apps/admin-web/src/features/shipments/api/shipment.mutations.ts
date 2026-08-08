"use server";

import type { ShipmentStatus, UpdateShipmentInput } from "@platform/ecommerce-core";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { normalizeError } from "@/core/http/normalize-error";

export async function updateShipmentStatusAction(
  id: string,
  status: ShipmentStatus,
) {
  try {
    await requireModuleAccess("shipments", "shipments.manage");
    const shipment = await getEcommerceCore().shipments.updateStatus(id, status);
    return { ok: true as const, shipment };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}

export async function updateShipmentAction(
  id: string,
  input: UpdateShipmentInput,
) {
  try {
    await requireModuleAccess("shipments", "shipments.manage");
    const shipment = await getEcommerceCore().shipments.update(id, input);
    return { ok: true as const, shipment };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}
