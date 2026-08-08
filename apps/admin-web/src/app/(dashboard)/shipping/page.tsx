import { hasPermission } from "@/core/auth/permissions";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { ShippingWorkspace } from "@/features/shipping/components/shipping-workspace";
import { getShippingData } from "@/features/shipping/api/shipping.server";

export default async function ShippingPage() {
  const { user } = await requireModuleAccess("shipping", "shipping.read");
  const data = await getShippingData();
  return (
    <ShippingWorkspace
      data={data}
      canManage={hasPermission(user.permissions, "shipping.manage")}
    />
  );
}
