"use server";

import { revalidatePath } from "next/cache";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { normalizeError } from "@/core/http/normalize-error";
import { createVariantSchema, variantDetailsSchema } from "./schemas";

function failure(error: unknown) {
  return { ok: false as const, error: normalizeError(error).message };
}

function refreshVariantPages(parentId: string) {
  revalidatePath("/variants");
  revalidatePath(`/products/${parentId}`);
  revalidatePath("/products");
  revalidatePath("/inventory");
}

export async function createVariantAction(parentId: string, input: unknown) {
  try {
    await requireModuleAccess("variants", "variants.manage");
    const values = createVariantSchema.parse(input);
    const translations = values.name
      ? {
          en: {
            name: values.name,
            description: values.description || null,
          },
          ...(values.nameKm
            ? {
                km: {
                  name: values.nameKm,
                  description: values.descriptionKm || null,
                },
              }
            : {}),
        }
      : undefined;
    const [variant] = await getEcommerceCore().catalog.createVariations(
      parentId,
      [
        {
          ...values,
          name: values.name || undefined,
          sku: values.sku || null,
          barcode: values.barcode || null,
          translations,
        },
      ],
    );
    refreshVariantPages(parentId);
    return { ok: true as const, item: variant };
  } catch (error) {
    return failure(error);
  }
}

export async function updateVariantAction(
  parentId: string,
  variantId: string,
  input: unknown,
) {
  try {
    await requireModuleAccess("variants", "variants.manage");
    const values = variantDetailsSchema.parse(input);
    const translations = values.name
      ? {
          en: {
            name: values.name,
            description: values.description || null,
          },
          ...(values.nameKm
            ? {
                km: {
                  name: values.nameKm,
                  description: values.descriptionKm || null,
                },
              }
            : {}),
        }
      : undefined;
    const variant = await getEcommerceCore().catalog.updateProduct(variantId, {
      name: values.name || undefined,
      sku: values.sku || null,
      barcode: values.barcode || null,
      price: values.price,
      salePrice: values.salePrice,
      saleStartsAt: values.saleStartsAt,
      saleEndsAt: values.saleEndsAt,
      weight: values.weight,
      length: values.length,
      width: values.width,
      height: values.height,
      status: values.status,
      featured: values.featured,
      translations,
    });
    refreshVariantPages(parentId);
    return { ok: true as const, item: variant };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteVariantAction(parentId: string, variantId: string) {
  try {
    await requireModuleAccess("variants", "variants.manage");
    await getEcommerceCore().catalog.deleteVariation(parentId, variantId);
    refreshVariantPages(parentId);
    return { ok: true as const };
  } catch (error) {
    return failure(error);
  }
}

// A variation is itself a full product row, so its images go through the very
// same catalog media endpoints a top-level product uses — only the id differs
// (the variant's own product id, not the parent's). No new API surface is
// needed; this just exposes it to the variant workspace under variants.manage.
export async function uploadVariantImageAction(
  variantId: string,
  parentId: string,
  formData: FormData,
) {
  try {
    await requireModuleAccess("variants", "variants.manage");
    const file = formData.get("image");
    if (!(file instanceof Blob) || file.size === 0) {
      return { ok: false as const, error: "Choose an image to upload." };
    }
    await getEcommerceCore().catalog.uploadProductImage(variantId, file);
    refreshVariantPages(parentId);
    return { ok: true as const };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteVariantImageAction(
  variantId: string,
  parentId: string,
  mediaId: string,
) {
  try {
    await requireModuleAccess("variants", "variants.manage");
    await getEcommerceCore().catalog.deleteProductImage(variantId, mediaId);
    refreshVariantPages(parentId);
    return { ok: true as const };
  } catch (error) {
    return failure(error);
  }
}
