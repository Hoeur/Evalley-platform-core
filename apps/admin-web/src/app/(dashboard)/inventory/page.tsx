import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { hasPermission } from "@/core/auth/permissions";
import { InventoryManagementWorkspace } from "@/features/inventory-management/inventory-management-workspace";

export default async function InventoryPage() {
  const { user } = await requireModuleAccess("inventory", "inventory.read");
  const core = getEcommerceCore();
  const [items, metrics] = await Promise.all([
    core.inventory.list({ perPage: 100 }),
    core.inventory.metrics(),
  ]);

  return (
    <InventoryManagementWorkspace
      items={items.items}
      metrics={metrics}
      canManage={hasPermission(user.permissions, "inventory.manage")}
    />
  );
}
