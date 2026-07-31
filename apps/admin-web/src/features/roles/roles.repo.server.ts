import "server-only";
import { getClientAccessToken } from "@/core/auth/session-cookie.server";
import { serverApiRequest } from "@/core/http/api-client.server";
import type {
  AdminRoleDetail,
  PermissionGroup,
  PermissionLeaf,
  PermissionModule,
} from "./role.types";

/**
 * Live role repository backed by core-ecommerce-api `GET /roles` (permission:
 * roles.view) and `GET /me/permissions` (for the assignable-permission
 * catalog). Both sit under API_BASE_URL and return the project envelope.
 */

type RoleDto = {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly type: string | null;
  readonly description: string | null;
  readonly is_default: boolean;
  readonly syncs_all_permissions: boolean;
  readonly permissions?: readonly string[] | null;
  readonly created_at: string | null;
};

type RoleListEnvelope = {
  readonly data: {
    readonly items: readonly RoleDto[] | null;
    readonly meta: { readonly total: number } | null;
  };
};

type PermissionLeafDto = {
  readonly permission: string;
  readonly name: string;
  readonly description: string | null;
};

type PermissionsEnvelope = {
  readonly data: {
    readonly item: {
      readonly groups?: readonly {
        readonly group: string;
        readonly modules?: readonly {
          readonly module: string;
          readonly permissions?: readonly PermissionLeafDto[] | null;
        }[] | null;
      }[] | null;
    } | null;
  };
};

function toRole(dto: RoleDto): AdminRoleDetail {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    type: dto.type,
    description: dto.description,
    isDefault: Boolean(dto.is_default),
    syncsAllPermissions: Boolean(dto.syncs_all_permissions),
    permissions: dto.permissions ?? [],
    createdAt: dto.created_at ?? new Date(0).toISOString(),
  };
}

async function authHeaders(): Promise<Record<string, string>> {
  const accessToken = await getClientAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export type RolePage = {
  readonly roles: readonly AdminRoleDetail[];
  readonly total: number;
};

export async function listRoles(
  options: { page?: number; perPage?: number } = {},
): Promise<RolePage> {
  const params = new URLSearchParams();
  if (options.page !== undefined) params.set("page", String(options.page));
  if (options.perPage !== undefined) params.set("per_page", String(options.perPage));
  const query = params.toString();

  const response = await serverApiRequest<RoleListEnvelope>(
    `/roles${query ? `?${query}` : ""}`,
    { method: "GET", headers: await authHeaders() },
  );
  const items = response.data.items ?? [];
  return { roles: items.map(toRole), total: response.data.meta?.total ?? items.length };
}

/**
 * The assignable-permission catalog. `GET /me/permissions` returns the full
 * registry tree (every group/module/permission that exists), which is exactly
 * what the role editor needs to render checkboxes.
 */
export async function getPermissionCatalog(): Promise<readonly PermissionGroup[]> {
  const response = await serverApiRequest<PermissionsEnvelope>("/me/permissions", {
    method: "GET",
    headers: await authHeaders(),
  });
  const groups = response.data.item?.groups ?? [];
  return groups.map((group): PermissionGroup => ({
    group: group.group,
    modules: (group.modules ?? []).map((module): PermissionModule => ({
      module: module.module,
      permissions: (module.permissions ?? []).map((leaf): PermissionLeaf => ({
        permission: leaf.permission,
        name: leaf.name,
        description: leaf.description,
      })),
    })),
  }));
}
