import "server-only";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import type { PromotionsView } from "../promotion-status";

export async function getPromotionsData(): Promise<PromotionsView> {
  const page = await getEcommerceCore().promotions.list({ perPage: 100 });
  return { promotions: page.items, total: page.total };
}
