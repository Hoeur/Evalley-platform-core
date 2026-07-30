import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { OrderDetailWorkspace } from "@/features/evalley";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) { await requireModuleAccess("orders", "orders.read"); const { orderId } = await params; const order = await getEcommerceCore().orders.get(orderId); return <OrderDetailWorkspace order={order} />; }
