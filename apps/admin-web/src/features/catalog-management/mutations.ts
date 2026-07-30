"use server";

import { revalidatePath } from "next/cache";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { normalizeError } from "@/core/http/normalize-error";
import { brandFormSchema, categoryFormSchema } from "./schemas";

function failure(error: unknown) {
  return { ok: false as const, error: normalizeError(error).message };
}

export async function saveCategoryAction(input: unknown, id?: string) {
  try {
    await requireModuleAccess("categories", "categories.manage");
    const values = categoryFormSchema.parse(input);
    const payload = {
      ...values,
      description: values.description || null,
      translations: {
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
      },
    };
    const category = id
      ? await getEcommerceCore().catalog.updateCategory(id, payload)
      : await getEcommerceCore().catalog.createCategory(payload);
    revalidatePath("/categories");
    revalidatePath("/products");
    return { ok: true as const, item: category };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await requireModuleAccess("categories", "categories.manage");
    await getEcommerceCore().catalog.deleteCategory(id);
    revalidatePath("/categories");
    revalidatePath("/products");
    return { ok: true as const };
  } catch (error) {
    return failure(error);
  }
}

export async function saveBrandAction(input: unknown, id?: string) {
  try {
    await requireModuleAccess("categories", "categories.manage");
    const values = brandFormSchema.parse(input);
    const payload = {
      ...values,
      description: values.description || null,
      translations: {
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
      },
    };
    const brand = id
      ? await getEcommerceCore().catalog.updateBrand(id, payload)
      : await getEcommerceCore().catalog.createBrand(payload);
    revalidatePath("/categories");
    revalidatePath("/products");
    return { ok: true as const, item: brand };
  } catch (error) {
    return failure(error);
  }
}

export async function uploadCategoryImageAction(
  id: string,
  formData: FormData,
) {
  try {
    await requireModuleAccess("categories", "categories.manage");
    const file = formData.get("image");
    if (!(file instanceof Blob) || file.size === 0) {
      return { ok: false as const, error: "Choose an image to upload." };
    }
    await getEcommerceCore().catalog.uploadCategoryImage(id, file);
    revalidatePath("/categories");
    return { ok: true as const };
  } catch (error) {
    return failure(error);
  }
}

export async function uploadBrandLogoAction(id: string, formData: FormData) {
  try {
    await requireModuleAccess("categories", "categories.manage");
    const file = formData.get("logo");
    if (!(file instanceof Blob) || file.size === 0) {
      return { ok: false as const, error: "Choose a logo to upload." };
    }
    await getEcommerceCore().catalog.uploadBrandLogo(id, file);
    revalidatePath("/categories");
    return { ok: true as const };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteBrandAction(id: string) {
  try {
    await requireModuleAccess("categories", "categories.manage");
    await getEcommerceCore().catalog.deleteBrand(id);
    revalidatePath("/categories");
    revalidatePath("/products");
    return { ok: true as const };
  } catch (error) {
    return failure(error);
  }
}
