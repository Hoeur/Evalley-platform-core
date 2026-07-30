import type { Brand, Id } from "./ids.js";

/**
 * Tenant primitives.
 *
 * The platform is operationally single-tenant today, but every business record and
 * repository is shaped to carry a tenant so multi-tenant can be switched on without a
 * data-model rewrite. Tenant identity is NEVER read from a request body — it is resolved
 * from the authenticated principal into a {@link TenantContext} and threaded through
 * services, repositories, cache keys, jobs and events.
 */

/** A tenant identifier. Distinct brand from generic Id to prevent accidental mixing. */
export type TenantId = Brand<string, "TenantId">;

/** Resolved, trusted tenant context for a unit of work. */
export interface TenantContext {
  readonly tenantId: TenantId;
  /** The principal acting within this tenant, when there is one. */
  readonly actor?: Actor;
}

/** Who performed an action — used by audit logs and event envelopes. */
export interface Actor {
  readonly actorType: "user" | "system" | "integration" | "job";
  readonly actorId: Id;
  readonly displayName?: string;
}

/** Mixin applied to every persisted CRM entity. */
export interface TenantScoped {
  readonly tenantId: TenantId;
}

/** Soft-delete + audit timestamps shared by most aggregates. */
export interface Timestamped {
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt?: string | null;
}

/**
 * Build a tenant-scoped cache key.
 * @example cacheKey(ctx, "crm", "customers", queryHash) // tenant:{id}:crm:customers:{hash}
 */
export function cacheKey(
  tenant: TenantContext | TenantId,
  ...segments: string[]
): string {
  const tenantId = typeof tenant === "string" ? tenant : tenant.tenantId;
  return ["tenant", tenantId, ...segments].join(":");
}

/** Brand a string as a TenantId without validation (fixtures/seeds/tests). */
export function unsafeTenantId(value: string): TenantId {
  return value as TenantId;
}
