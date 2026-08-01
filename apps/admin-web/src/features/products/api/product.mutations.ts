"use server";

import { revalidatePath } from "next/cache";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { normalizeError } from "@/core/http/normalize-error";
import {
  productSchema,
  type ProductFormValues,
} from "../schemas/product.schema";
import { getProductRepository } from "./product.repository.server";

const apiFieldMap: Record<string, keyof ProductFormValues> = {
  sku: "sku",
  price: "price",
  status: "status",
  barcode: "barcode",
  slug: "slug",
  brand_id: "brandId",
  sale_price: "salePrice",
  sale_starts_at: "saleStartsAt",
  sale_ends_at: "saleEndsAt",
  category_ids: "categoryIds",
  "category_ids.0": "categoryIds",
  translations: "name",
  "translations.en.name": "name",
};

function productFieldErrors(fieldErrors?: Record<string, string[]>) {
  if (!fieldErrors) return undefined;
  const mapped: Partial<Record<keyof ProductFormValues, string>> = {};
  for (const [apiField, messages] of Object.entries(fieldErrors)) {
    const field = apiFieldMap[apiField];
    const message = messages[0];
    if (field && message && !mapped[field]) mapped[field] = message;
  }
  return Object.keys(mapped).length ? mapped : undefined;
}

export async function saveProductAction(input: unknown, productId?: string) {
  try {
    await requireModuleAccess(
      "products",
      productId ? "products.update" : "products.create",
    );
    const values = productSchema.parse(input);
    const translations = {
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
    };
    const repository = getProductRepository();
    const product = productId
      ? await repository.update(productId, {
          ...values,
          status: values.status,
          translations,
        })
      : await repository.create({
          ...values,
          status: values.status,
          translations,
        });
    revalidatePath("/products");
    revalidatePath(`/products/${product.id}`);
    return { ok: true as const, productId: product.id };
  } catch (error) {
    const normalized = normalizeError(error);
    return {
      ok: false as const,
      error: normalized.message,
      fieldErrors: productFieldErrors(normalized.fieldErrors),
    };
  }
}

export async function uploadProductImageAction(
  productId: string,
  formData: FormData,
) {
  try {
    await requireModuleAccess("products", "products.update");
    const file = formData.get("image");
    if (!(file instanceof Blob) || file.size === 0) {
      return { ok: false as const, error: "Choose an image to upload." };
    }
    await getEcommerceCore().catalog.uploadProductImage(productId, file);
    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}
export async function deleteProductImageAction(
  productId: string,
  mediaId: string,
) {
  try {
    await requireModuleAccess("products", "products.update");
    await getEcommerceCore().catalog.deleteProductImage(productId, mediaId);
    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}
export async function deleteProductAction(productId: string) {
  try {
    await requireModuleAccess("products", "products.delete");
    await getProductRepository().remove(productId);
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}
export async function deleteProductsAction(productIds: string[]) {
  try {
    await requireModuleAccess("products", "products.delete");
    const repository = getProductRepository();
    await Promise.all(
      productIds.map((productId) => repository.remove(productId)),
    );
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}
