/**
 * Role view models for the roles management screen. Framework-free and safe to
 * import from both server and client. Mirrors core-ecommerce-api's
 * App\Domains\Auth RoleResource and the `GET /me/permissions` groups tree.
 */

export type AdminRoleDetail = {
  id: number;
  name: string;
  slug: string;
  type: string | null;
  description: string | null;
  isDefault: boolean;
  syncsAllPermissions: boolean;
  /** Flat list of permission flags/wildcards granted to the role. */
  permissions: readonly string[];
  createdAt: string;
};

/** One assignable permission leaf from the registry catalog. */
export type PermissionLeaf = {
  permission: string;
  name: string;
  description: string | null;
};

export type PermissionModule = {
  module: string;
  permissions: readonly PermissionLeaf[];
};

export type PermissionGroup = {
  group: string;
  modules: readonly PermissionModule[];
};

export type RoleInput = {
  name: string;
  slug?: string;
  description?: string;
  isDefault?: boolean;
  permissions: readonly string[];
};
