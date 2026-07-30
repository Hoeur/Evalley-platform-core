import type { Id } from "@platform/shared";
import type { CrmRecord } from "../common.js";

export type OpportunityStatus = "open" | "won" | "lost";

/**
 * A revenue opportunity moving through a sales pipeline. Stage changes and won/lost
 * transitions are authorized, server-validated use cases — never blind UI writes.
 */
export interface Opportunity extends CrmRecord {
  readonly customerId?: Id;
  readonly leadId?: Id;
  readonly pipelineId: Id;
  readonly stageId: Id;
  readonly assignedUserId?: Id;
  readonly title: string;
  readonly description?: string;
  readonly amount: number;
  readonly currency: string;
  /** 0–100; defaults from the stage but can be overridden. */
  readonly probability: number;
  readonly expectedCloseDate?: string | null;
  readonly status: OpportunityStatus;
  readonly wonAt?: string | null;
  readonly lostAt?: string | null;
  readonly lostReason?: string | null;
}
