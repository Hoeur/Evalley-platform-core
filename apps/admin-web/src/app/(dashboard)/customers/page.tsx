import { hasPermission } from "@/core/auth/permissions";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { CustomersWorkspace } from "@/features/customers/components/customers-workspace";
import { getCustomersData } from "@/features/customers/api/customers.server";

export default async function CustomersPage() {
  const { user } = await requireModuleAccess("customers", "customers.read");
  const view = await getCustomersData();
  return (
    <CustomersWorkspace
      view={view}
      canManage={hasPermission(user.permissions, "customers.update")}
    />
  );
}
