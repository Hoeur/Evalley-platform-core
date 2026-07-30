import { requireModuleAccess } from "@/core/auth/authorize.server";
import { DataWorkspace } from "@/features/evalley";
import { getOrdersWorkspace } from "@/features/evalley/api/ecommerce-workspaces.server";

export default async function OrdersPage() { await requireModuleAccess("orders", "orders.read"); return <DataWorkspace config={await getOrdersWorkspace()} />; }
