import type { Id } from "@platform/shared";
import type { CrmEntityType, CrmRecord } from "../common.js";

export type CustomFieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency"
  | "date"
  | "datetime"
  | "boolean"
  | "select"
  | "multi_select"
  | "email"
  | "phone"
  | "url"
  | "user"
  | "customer";

/**
 * A client-defined field on a CRM entity. Definitions and values live in their own tables
 * (EAV-style) so a client never alters core entity schemas to add fields (spec §10).
 */
export interface CustomFieldDefinition extends CrmRecord {
  readonly entityType: CrmEntityType;
  /** Stable machine key, unique per (tenant, entityType). */
  readonly key: string;
  readonly label: string;
  readonly fieldType: CustomFieldType;
  /** Options for select / multi_select. */
  readonly options?: readonly { readonly value: string; readonly label: string }[];
  readonly isRequired: boolean;
  readonly isSearchable: boolean;
  readonly isFilterable: boolean;
  readonly defaultValue?: unknown;
  readonly validationRules?: Record<string, unknown>;
  readonly position: number;
  readonly isActive: boolean;
}

/** A stored value for a custom field definition against a specific entity. */
export interface CustomFieldValue {
  readonly id: Id;
  readonly tenantId: CrmRecord["tenantId"];
  readonly definitionId: Id;
  readonly entityType: CrmEntityType;
  readonly entityId: Id;
  readonly value: unknown;
}
