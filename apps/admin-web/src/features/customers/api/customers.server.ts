import "server-only";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import type { CustomersView } from "../customer-utils";

export async function getCustomersData(): Promise<CustomersView> {
  const page = await getEcommerceCore().customers.list({ perPage: 100 });
  return { customers: page.items, total: page.total };
}
