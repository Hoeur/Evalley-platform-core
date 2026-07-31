import { hasPermission } from "@/core/auth/permissions";
import { requireModuleAccess } from "@/core/auth/authorize.server";
import { UsersWorkspace } from "@/features/users/components/users-workspace";
import { listAdminUsers } from "@/features/users/users.repo.server";
import { listRoles } from "@/features/roles/roles.repo.server";
import type { AdminRole, AdminUser } from "@/features/users/user.types";

export default async function UsersPage() {
  // Gate on users.read — the ecommerce permission map bridges the API's
  // admins.view flag to this key (see ecommerce-permission-map.ts).
  const { user } = await requireModuleAccess("users", "users.read");
  const canManage = hasPermission(user.permissions, "users.manage");

  let users: readonly AdminUser[] = [];
  let roles: readonly AdminRole[] = [];
  try {
    const [userPage, rolePage] = await Promise.all([
      listAdminUsers({ perPage: 100 }),
      // Roles feed the create/edit dialog; only needed when the admin can manage.
      canManage ? listRoles({ perPage: 100 }) : Promise.resolve({ roles: [], total: 0 }),
    ]);
    users = userPage.users;
    roles = rolePage.roles.map((r) => ({ id: r.id, name: r.name, slug: r.slug }));
  } catch {
    // A transport/authorization failure renders an empty table rather than
    // crashing the dashboard; the workspace shows the empty state.
    users = [];
    roles = [];
  }

  return <UsersWorkspace users={users} roles={roles} canManage={canManage} />;
}
