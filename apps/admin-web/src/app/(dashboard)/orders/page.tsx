import { hasPermission } from "@/core/auth/permissions";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { OrdersWorkspace } from "@/features/evalley";
import { getOrdersData } from "@/features/evalley/api/ecommerce-workspaces.server";

export default async function OrdersPage() {
  const { user } = await requireModuleAccess("orders", "orders.read");
  const view = await getOrdersData();
  return (
    <OrdersWorkspace
      view={view}
      canManage={hasPermission(user.permissions, "orders.update")}
    />
  );
}
