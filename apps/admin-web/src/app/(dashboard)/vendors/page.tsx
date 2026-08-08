import { hasPermission } from "@/core/auth/permissions";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { VendorsWorkspace } from "@/features/vendors/components/vendors-workspace";
import { getVendorsList } from "@/features/vendors/api/vendors.server";

export default async function VendorsPage() {
  const { user } = await requireModuleAccess("vendors", "vendors.read");
  const page = await getVendorsList();
  return (
    <VendorsWorkspace
      vendors={page.items}
      total={page.total}
      canManage={hasPermission(user.permissions, "vendors.manage")}
    />
  );
}
