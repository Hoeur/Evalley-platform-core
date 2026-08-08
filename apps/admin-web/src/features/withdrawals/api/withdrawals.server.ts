import "server-only";
import type { Page, Withdrawal } from "@platform/ecommerce-core";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";

export async function getWithdrawals(): Promise<Page<Withdrawal>> {
  return getEcommerceCore().vendors.listWithdrawals({ perPage: 100 });
}
