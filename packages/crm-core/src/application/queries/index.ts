import type { Id, PaginationParams, SortParams } from "@platform/shared";
import type { Priority } from "../../domain/index.js";

/**
 * Read-side query inputs (the "Q" in CQRS). Filters map to indexed columns (spec §15) so
 * list endpoints never scan or load everything into memory.
 */

/** Generic list query: pagination + optional sort + typed filters + free-text search. */
export interface ListQuery<TFilters> {
  readonly pagination: PaginationParams;
  readonly sort?: SortParams;
  readonly search?: string;
  readonly filters?: TFilters;
}

export interface LeadListFilters {
  readonly statusId?: Id;
  readonly sourceId?: Id;
  readonly pipelineId?: Id;
  readonly stageId?: Id;
  readonly assignedUserId?: Id;
  readonly priority?: Priority;
  readonly tag?: string;
  readonly createdFrom?: string;
  readonly createdTo?: string;
  readonly nextFollowUpFrom?: string;
  readonly nextFollowUpTo?: string;
  readonly hasOverdueActivity?: boolean;
}

export interface CustomerListFilters {
  readonly status?: string;
  readonly accountManagerId?: Id;
  readonly tag?: string;
  readonly createdFrom?: string;
  readonly createdTo?: string;
  readonly hasOutstandingInvoice?: boolean;
  readonly hasOpenTicket?: boolean;
  readonly sourceModule?: "ecommerce" | "rental" | "booking";
}

export interface OpportunityListFilters {
  readonly pipelineId?: Id;
  readonly stageId?: Id;
  readonly assignedUserId?: Id;
  readonly status?: "open" | "won" | "lost";
  readonly expectedCloseFrom?: string;
  readonly expectedCloseTo?: string;
}

/** Targets for the CRM global search (spec §15). */
export interface GlobalSearchQuery {
  readonly term: string;
  readonly limit?: number;
}
