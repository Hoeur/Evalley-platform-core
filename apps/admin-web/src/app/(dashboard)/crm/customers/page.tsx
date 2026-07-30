import { hasPermission } from "@/core/auth/permissions";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { CrmCustomersWorkspace, getCustomersWorkspace } from "@/features/crm";

export default async function CrmCustomersPage() {
  const { user } = await requireModuleAccess(
    "crmCustomers",
    "crm.customers.view",
  );
  const workspace = await getCustomersWorkspace();
  return (
    <CrmCustomersWorkspace
      customers={workspace.customers}
      contacts={workspace.contacts}
      canManage={hasPermission(user.permissions, "crm.customers.update")}
    />
  );
}
