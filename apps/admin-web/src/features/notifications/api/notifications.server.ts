import "server-only";
import type { Page } from "@platform/ecommerce-core";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import type { BroadcastsView } from "../notification-utils";

function emptyPage<T>(): Page<T> {
  return { items: [], page: 1, perPage: 0, total: 0, lastPage: 1 };
}

/**
 * The broadcast composer needs the audience it can target. Groups and the
 * customer list are governed by their own commerce-API permissions, so an
 * admin allowed to send but not to browse customers still gets a working
 * "all customers" composer — the pickers just come back empty rather than
 * failing the whole page.
 */
export async function getBroadcastsData(): Promise<BroadcastsView> {
  const core = getEcommerceCore();
  const [broadcasts, groups, customers] = await Promise.all([
    core.notifications.listBroadcasts({ perPage: 50 }),
    core.notifications
      .listCustomerGroups({ activeOnly: true, perPage: 100 })
      .catch(() => emptyPage<never>()),
    core.customers.list({ perPage: 100 }).catch(() => emptyPage<never>()),
  ]);

  return {
    broadcasts: broadcasts.items,
    total: broadcasts.total,
    groups: groups.items,
    customers: customers.items.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
    })),
  };
}
