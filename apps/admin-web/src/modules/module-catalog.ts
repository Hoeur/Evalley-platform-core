import type { ModuleKey } from "@/clients/client.types";

export type ModuleRule = {
  dependencies: ModuleKey[];
  locked?: boolean;
};

export const moduleRules: Record<ModuleKey, ModuleRule> = {
  dashboard: { dependencies: [], locked: true },
  analytics: { dependencies: ["dashboard"] },
  products: { dependencies: [] },
  variants: { dependencies: ["products"] },
  attributes: { dependencies: ["products"] },
  inventory: { dependencies: ["products"] },
  categories: { dependencies: ["products"] },
  promotions: { dependencies: ["products", "customers"] },
  reviews: { dependencies: ["products"] },
  content: { dependencies: [] },
  orders: { dependencies: [] },
  returns: { dependencies: ["orders"] },
  shipments: { dependencies: ["orders"] },
  customers: { dependencies: [] },
  vendors: { dependencies: [] },
  withdrawals: { dependencies: ["vendors"] },
  ledger: { dependencies: ["vendors", "orders"] },
  marketing: { dependencies: ["customers"] },
  shipping: { dependencies: ["orders"] },
  reports: { dependencies: ["dashboard"] },
  properties: { dependencies: [] },
  bookings: { dependencies: ["properties"] },
  tenants: { dependencies: ["properties"] },
  leases: { dependencies: ["properties", "tenants"] },
  payments: { dependencies: ["leases"] },
  maintenance: { dependencies: ["properties"] },
  users: { dependencies: [] },
  roles: { dependencies: [] },
  crm: { dependencies: [] },
  crmLeads: { dependencies: ["crm"] },
  crmCustomers: { dependencies: ["crm"] },
  support: { dependencies: [] },
  notifications: { dependencies: ["customers"] },
  modules: { dependencies: [], locked: true },
  settings: { dependencies: [], locked: true },
};

export function collectDependencies(module: ModuleKey, available: readonly ModuleKey[]) {
  const collected = new Set<ModuleKey>();

  function visit(key: ModuleKey) {
    for (const dependency of moduleRules[key].dependencies) {
      if (!available.includes(dependency) || collected.has(dependency)) continue;
      collected.add(dependency);
      visit(dependency);
    }
  }

  visit(module);
  return [...collected];
}

export function findEnabledDependents(module: ModuleKey, enabled: readonly ModuleKey[]) {
  return enabled.filter((key) => moduleRules[key].dependencies.includes(module));
}
