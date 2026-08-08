import "server-only";
import type {
  CommissionEntry,
  CommissionSummary,
  Page,
  VendorBalance,
  VendorStore,
} from "@platform/ecommerce-core";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";

export async function getVendorsList(): Promise<Page<VendorStore>> {
  return getEcommerceCore().vendors.listStores({ perPage: 100 });
}

export type VendorDetail = {
  store: VendorStore;
  balance: VendorBalance;
  summary: CommissionSummary;
  commissions: readonly CommissionEntry[];
};

export async function getVendorDetail(storeId: string): Promise<VendorDetail> {
  const core = getEcommerceCore();
  const [store, balance, summary, commissions] = await Promise.all([
    core.vendors.getStore(storeId),
    core.vendors.storeBalance(storeId),
    core.vendors.storeCommissionSummary(storeId),
    core.vendors.listStoreCommissions(storeId, { perPage: 50 }),
  ]);
  return { store, balance, summary, commissions: commissions.items };
}
