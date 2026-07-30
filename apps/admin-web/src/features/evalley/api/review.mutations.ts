"use server";

import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { normalizeError } from "@/core/http/normalize-error";

export async function moderateReviewAction(
  reviewId: string,
  decision: "approve" | "reject",
) {
  try {
    await requireModuleAccess("reviews", "reviews.manage");
    const reviews = getEcommerceCore().reviews;
    const review =
      decision === "approve"
        ? await reviews.approve(reviewId)
        : await reviews.reject(reviewId);
    return { ok: true as const, status: review.status };
  } catch (error) {
    return { ok: false as const, error: normalizeError(error).message };
  }
}
