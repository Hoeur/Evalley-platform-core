import type { TenantId } from "../tenant.js";

/**
 * Cross-module reference contracts.
 *
 * Modules integrate by exchanging these lightweight references, never by importing each
 * other's internal models or sharing database tables. A reference is enough to link,
 * display and reconcile without duplicating the source module's business logic.
 */

/** Modules that can be a source of external references. */
export type ModuleId =
  | "ecommerce"
  | "rental"
  | "booking"
  | "crm"
  | "notification"
  | "audit";

export interface CustomerReference {
  readonly id: string;
  readonly tenantId: TenantId;
  readonly displayName: string;
  readonly email?: string;
  readonly phone?: string;
}

export interface ProductReference {
  readonly module: Extract<ModuleId, "ecommerce" | "rental" | "booking">;
  readonly id: string;
  readonly name: string;
  readonly sku?: string;
  readonly unitPrice?: number;
  readonly currency?: string;
}

export type OrderKind = "ecommerce_order" | "rental_contract" | "booking";

export interface OrderReference {
  readonly module: Extract<ModuleId, "ecommerce" | "rental" | "booking">;
  readonly kind: OrderKind;
  readonly id: string;
  readonly total?: number;
  readonly currency?: string;
  readonly placedAt?: string;
}

/**
 * The generic external reference record (spec §8). Lets CRM map any external entity to a
 * CRM entity without sharing schemas. Persisted in a later phase; the shape is fixed now.
 */
export interface ExternalReference {
  readonly id: string;
  readonly tenantId: TenantId;
  readonly moduleId: ModuleId;
  readonly entityType: string;
  readonly entityId: string;
  readonly crmEntityType: string;
  readonly crmEntityId: string;
  readonly externalReference?: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: string;
  readonly updatedAt: string;
}
