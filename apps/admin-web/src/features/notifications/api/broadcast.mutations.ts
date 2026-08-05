"use server";

import type { SendBroadcastInput } from "@platform/ecommerce-core";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { normalizeError } from "@/core/http/normalize-error";

export async function sendBroadcastAction(input: SendBroadcastInput) {
  try {
    await requireModuleAccess("notifications", "notifications.manage");
    const broadcast = await getEcommerceCore().notifications.sendBroadcast(
      input,
    );
    return { ok: true as const, broadcast };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}
