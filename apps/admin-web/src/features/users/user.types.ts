/**
 * Admin user view models for the users management screen. Framework-free and safe to
 * import from both server and client. Mirrors the shape core-ecommerce-api's
 * `GET /admin-users` endpoint returns (App\Domains\Auth AdminResource / RoleResource),
 * so the repository mapper is the only place that touches the transport envelope.
 */

export type AdminRole = {
  id: number;
  name: string;
  slug: string;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  /** Every role assigned to the admin — the API returns a list, not a single role. */
  roles: readonly AdminRole[];
  /** Platform super user: bypasses per-permission checks. */
  superUser: boolean;
  /** May grant/revoke other super users. */
  manageSupers: boolean;
  createdAt: string;
};

export function roleLabel(role: AdminRole): string {
  return role.name;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
