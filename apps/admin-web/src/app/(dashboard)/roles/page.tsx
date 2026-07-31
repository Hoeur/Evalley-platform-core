import { hasPermission } from "@/core/auth/permissions";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { RolesWorkspace } from "@/features/roles/components/roles-workspace";
import {
  getPermissionCatalog,
  listRoles,
} from "@/features/roles/roles.repo.server";
import type { AdminRoleDetail, PermissionGroup } from "@/features/roles/role.types";

export default async function RolesPage() {
  // Gate on roles.read — the ecommerce permission map bridges the API's
  // roles.view flag to this key (see ecommerce-permission-map.ts).
  const { user } = await requireModuleAccess("roles", "roles.read");

  let roles: readonly AdminRoleDetail[] = [];
  let catalog: readonly PermissionGroup[] = [];
  try {
    [{ roles }, catalog] = await Promise.all([
      listRoles({ perPage: 100 }),
      getPermissionCatalog(),
    ]);
  } catch {
    // A transport/authorization failure renders an empty table rather than
    // crashing the dashboard.
    roles = [];
    catalog = [];
  }

  return (
    <RolesWorkspace
      roles={roles}
      catalog={catalog}
      canManage={hasPermission(user.permissions, "roles.manage")}
    />
  );
}
