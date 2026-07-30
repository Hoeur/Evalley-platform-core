import { hasPermission } from "@/core/auth/permissions";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { OrderDetailWorkspace } from "@/features/evalley";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { user } = await requireModuleAccess("orders", "orders.read");
  const { orderId } = await params;
  const orders = getEcommerceCore().orders;
  const [order, refunds] = await Promise.all([
    orders.get(orderId),
    orders.listRefunds(orderId),
  ]);
  return (
    <OrderDetailWorkspace
      order={order}
      refunds={refunds}
      canManageRefunds={hasPermission(user.permissions, "orders.update")}
    />
  );
}
