import type { Id } from "@platform/shared";
import type { CrmRecord, Priority } from "../common.js";

/** Lifecycle status of a lead. Backed by a configurable LeadStatus record. */
export type LeadStatusKey = "new" | "contacted" | "qualified" | "unqualified" | "converted";

/**
 * A lead: an unqualified or in-progress prospect that has not yet become a customer.
 * Converting a lead is a transactional use case (see application/services).
 */
export interface Lead extends CrmRecord {
  readonly sourceId?: Id;
  readonly statusId: Id;
  readonly pipelineId?: Id;
  readonly stageId?: Id;
  readonly assignedUserId?: Id;
  readonly companyName?: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email?: string;
  readonly phone?: string;
  readonly website?: string;
  readonly estimatedValue?: number;
  readonly currency: string;
  readonly priority: Priority;
  readonly description?: string;
  readonly lastContactAt?: string | null;
  readonly nextFollowUpAt?: string | null;
  readonly convertedAt?: string | null;
  readonly convertedCustomerId?: Id | null;
  readonly createdBy: Id;
}

/** Configurable lead source (e.g. website, referral, campaign). */
export interface LeadSource extends CrmRecord {
  readonly name: string;
  readonly isActive: boolean;
}

/** Configurable lead status with pipeline semantics. */
export interface LeadStatus extends CrmRecord {
  readonly name: string;
  readonly key: LeadStatusKey;
  readonly position: number;
  readonly isDefault: boolean;
}
