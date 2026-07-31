import "server-only";
import { getClientAccessToken } from "@/core/auth/session-cookie.server";
import { serverApiRequest } from "@/core/http/api-client.server";
import type { AdminRole, AdminUser } from "./user.types";

/**
 * Live admin-user repository backed by core-ecommerce-api `GET /admin-users`
 * (permission: admins.view). The route sits under API_BASE_URL, which already
 * ends in `/api/v1/admin`, so the path is relative. Response goes through the
 * project envelope: { data: { items, meta } }.
 */

type RoleDto = {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
};

type AdminDto = {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly super_user: boolean;
  readonly manage_supers: boolean;
  readonly roles?: readonly RoleDto[] | null;
  readonly created_at: string | null;
};

type AdminListEnvelope = {
  readonly data: {
    readonly items: readonly AdminDto[] | null;
    readonly meta: {
      readonly current_page: number;
      readonly per_page: number;
      readonly total: number;
      readonly last_page: number;
    } | null;
  };
};

function toRole(dto: RoleDto): AdminRole {
  return { id: dto.id, name: dto.name, slug: dto.slug };
}

function toAdminUser(dto: AdminDto): AdminUser {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    roles: (dto.roles ?? []).map(toRole),
    superUser: Boolean(dto.super_user),
    manageSupers: Boolean(dto.manage_supers),
    createdAt: dto.created_at ?? new Date(0).toISOString(),
  };
}

export type AdminUserPage = {
  readonly users: readonly AdminUser[];
  readonly total: number;
};

/**
 * Fetch a page of admin users. Throws {@link ApiClientError} on transport or
 * authorization failure so the caller (the page) decides how to surface it.
 */
export async function listAdminUsers(
  options: { page?: number; perPage?: number } = {},
): Promise<AdminUserPage> {
  const accessToken = await getClientAccessToken();
  const params = new URLSearchParams();
  if (options.page !== undefined) params.set("page", String(options.page));
  if (options.perPage !== undefined) params.set("per_page", String(options.perPage));
  const query = params.toString();

  const response = await serverApiRequest<AdminListEnvelope>(
    `/admin-users${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  );

  const items = response.data.items ?? [];
  return {
    users: items.map(toAdminUser),
    total: response.data.meta?.total ?? items.length,
  };
}
