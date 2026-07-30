import type { Id } from "@platform/shared";
import type {
  Address,
  CrmEntityType,
  LineReferenceType,
} from "../../domain/index.js";

/**
 * Data-transfer shapes shared across commands, queries and the API layer. DTOs are plain
 * serializable value objects — no domain behavior, no persistence concerns.
 */

export interface AddressInput extends Address {}

export interface LineItemInput {
  readonly referenceType: LineReferenceType;
  readonly referenceId?: Id;
  readonly name: string;
  readonly description?: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly discount?: number;
  readonly taxRate?: number;
  readonly position?: number;
}

/** A single, source-tagged entry in a customer's unified timeline (spec §6). */
export interface TimelineEntry {
  readonly id: string;
  /** Which module produced this entry. */
  readonly module: "crm" | "ecommerce" | "rental" | "booking";
  readonly kind: string;
  readonly title: string;
  readonly description?: string;
  readonly occurredAt: string;
  readonly entityType?: CrmEntityType;
  readonly entityId?: Id;
}

/** Result of a lead-conversion use case. */
export interface LeadConversionResult {
  readonly customerId: Id;
  readonly primaryContactId: Id;
  readonly opportunityId?: Id;
}
