"use server";

import { revalidatePath } from "next/cache";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { normalizeError } from "@/core/http/normalize-error";
import { attributeSetSchema, attributeValueSchema } from "./schemas";

function failure(error: unknown) {
  return { ok: false as const, error: normalizeError(error).message };
}

function revalidateCatalog() {
  revalidatePath("/attributes");
  revalidatePath("/variants");
  revalidatePath("/products");
}

export async function saveAttributeSetAction(input: unknown, id?: string) {
  try {
    await requireModuleAccess("attributes", "attributes.manage");
    const values = attributeSetSchema.parse(input);
    const payload = {
      ...values,
      translations: {
        en: { name: values.name },
        ...(values.nameKm ? { km: { name: values.nameKm } } : {}),
      },
    };
    const item = id
      ? await getEcommerceCore().catalog.updateAttributeSet(id, payload)
      : await getEcommerceCore().catalog.createAttributeSet(payload);
    revalidateCatalog();
    return { ok: true as const, item };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteAttributeSetAction(id: string) {
  try {
    await requireModuleAccess("attributes", "attributes.manage");
    await getEcommerceCore().catalog.deleteAttributeSet(id);
    revalidateCatalog();
    return { ok: true as const };
  } catch (error) {
    return failure(error);
  }
}

export async function saveAttributeValueAction(
  attributeSetId: string,
  input: unknown,
  valueId?: string,
) {
  try {
    await requireModuleAccess("attributes", "attributes.manage");
    const values = attributeValueSchema.parse(input);
    const payload = {
      ...values,
      translations: {
        en: { name: values.name },
        ...(values.nameKm ? { km: { name: values.nameKm } } : {}),
      },
    };
    const item = valueId
      ? await getEcommerceCore().catalog.updateAttributeValue(
          attributeSetId,
          valueId,
          payload,
        )
      : await getEcommerceCore().catalog.createAttributeValue(
          attributeSetId,
          payload,
        );
    revalidateCatalog();
    return { ok: true as const, item };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteAttributeValueAction(
  attributeSetId: string,
  valueId: string,
) {
  try {
    await requireModuleAccess("attributes", "attributes.manage");
    await getEcommerceCore().catalog.deleteAttributeValue(
      attributeSetId,
      valueId,
    );
    revalidateCatalog();
    return { ok: true as const };
  } catch (error) {
    return failure(error);
  }
}
