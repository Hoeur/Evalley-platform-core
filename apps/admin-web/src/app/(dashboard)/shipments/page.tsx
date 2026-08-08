import { hasPermission } from "@/core/auth/permissions";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { ShipmentsWorkspace } from "@/features/shipments/components/shipments-workspace";
import { getShipments } from "@/features/shipments/api/shipments.server";

export default async function ShipmentsPage() {
  const { user } = await requireModuleAccess("shipments", "shipments.read");
  const page = await getShipments();
  return (
    <ShipmentsWorkspace
      shipments={page.items}
      total={page.total}
      canManage={hasPermission(user.permissions, "shipments.manage")}
    />
  );
}
