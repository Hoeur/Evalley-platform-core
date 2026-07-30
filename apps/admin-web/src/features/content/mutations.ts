"use server";

import { revalidatePath } from "next/cache";
import type {
  SaveBannerInput,
  SaveFooterLinkInput,
  SaveFooterSettingsInput,
  SaveFooterSocialInput,
  SaveStaticPageInput,
} from "@platform/ecommerce-core";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { normalizeError } from "@/core/http/normalize-error";

function fail(error: unknown) {
  return { ok: false as const, error: normalizeError(error).message };
}

function cms() {
  return getEcommerceCore().cms;
}

async function guard() {
  await requireModuleAccess("content", "content.manage");
}

export async function saveStaticPageAction(
  input: SaveStaticPageInput,
  id?: string,
) {
  try {
    await guard();
    const item = id
      ? await cms().updateStaticPage(id, input)
      : await cms().createStaticPage(input);
    revalidatePath("/content");
    return { ok: true as const, item };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteStaticPageAction(id: string) {
  try {
    await guard();
    await cms().deleteStaticPage(id);
    revalidatePath("/content");
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function saveBannerAction(input: SaveBannerInput, id?: string) {
  try {
    await guard();
    const item = id
      ? await cms().updateBanner(id, input)
      : await cms().createBanner(input);
    revalidatePath("/content");
    return { ok: true as const, item };
  } catch (error) {
    return fail(error);
  }
}

export async function uploadBannerImageAction(id: string, formData: FormData) {
  try {
    await guard();
    const file = formData.get("image");
    if (!(file instanceof Blob) || file.size === 0) {
      return { ok: false as const, error: "Choose an image to upload." };
    }
    await cms().uploadBannerImage(id, file);
    revalidatePath("/content");
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteBannerAction(id: string) {
  try {
    await guard();
    await cms().deleteBanner(id);
    revalidatePath("/content");
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function saveFooterSettingsAction(input: SaveFooterSettingsInput) {
  try {
    await guard();
    const item = await cms().updateFooterSettings(input);
    revalidatePath("/content");
    return { ok: true as const, item };
  } catch (error) {
    return fail(error);
  }
}

export async function saveFooterLinkAction(
  input: SaveFooterLinkInput,
  id?: string,
) {
  try {
    await guard();
    const item = id
      ? await cms().updateFooterLink(id, input)
      : await cms().createFooterLink(input);
    revalidatePath("/content");
    return { ok: true as const, item };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteFooterLinkAction(id: string) {
  try {
    await guard();
    await cms().deleteFooterLink(id);
    revalidatePath("/content");
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function saveFooterSocialAction(
  input: SaveFooterSocialInput,
  id?: string,
) {
  try {
    await guard();
    const item = id
      ? await cms().updateFooterSocial(id, input)
      : await cms().createFooterSocial(input);
    revalidatePath("/content");
    return { ok: true as const, item };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteFooterSocialAction(id: string) {
  try {
    await guard();
    await cms().deleteFooterSocial(id);
    revalidatePath("/content");
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}
