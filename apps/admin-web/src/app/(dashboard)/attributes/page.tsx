import { requireModuleAccess } from "@/core/auth/authorize.server";
import { getEcommerceCore } from "@/core/ecommerce/ecommerce-core.server";
import { hasPermission } from "@/core/auth/permissions";
import { AttributeManagementWorkspace } from "@/features/attribute-management/attribute-management-workspace";

export default async function AttributesPage() {
  const { user } = await requireModuleAccess("attributes", "attributes.read");
  const page = await getEcommerceCore().catalog.listAttributeSets({
    perPage: 100,
  });

  return (
    <AttributeManagementWorkspace
      attributeSets={page.items}
      canManage={hasPermission(user.permissions, "attributes.manage")}
    />
  );
}
