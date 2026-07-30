import type { Id, TenantScoped, Timestamped } from "@platform/shared";

/**
 * Shared domain primitives used across CRM aggregates. Kept small and framework-free:
 * the domain layer knows nothing about React, HTTP or the database.
 */

/** Base fields every persisted CRM record carries (tenant + timestamps). */
export interface CrmRecord extends TenantScoped, Timestamped {
  readonly id: Id;
}

/** A monetary amount plus its ISO-4217 currency. Money is never a bare number. */
export interface Money {
  readonly amount: number;
  readonly currency: string;
}

export type Priority = "low" | "medium" | "high" | "urgent";

/**
 * CRM entities that can be the polymorphic target of an activity, task, note, tag,
 * attachment, comment or custom-field value.
 */
export type CrmEntityType =
  | "lead"
  | "customer"
  | "contact"
  | "company"
  | "opportunity"
  | "proposal"
  | "estimate"
  | "invoice"
  | "contract"
  | "ticket";

/** A polymorphic reference to a CRM entity. */
export interface EntityRef {
  readonly entityType: CrmEntityType;
  readonly entityId: Id;
}

export interface Address {
  readonly line1: string;
  readonly line2?: string;
  readonly city: string;
  readonly state?: string;
  readonly postalCode?: string;
  readonly country: string;
}
