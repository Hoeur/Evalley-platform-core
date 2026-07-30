import type { Id } from "@platform/shared";
import type { Priority } from "../../domain/index.js";
import type { AddressInput, LineItemInput } from "../dto/index.js";

/**
 * Write-side command inputs (the "C" in CQRS). These are validated at the boundary
 * (Zod, added in Phase 2) before a service executes them. tenantId is never part of a
 * command — it is resolved from the authenticated context (spec §5).
 */

export interface CreateLeadInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly companyName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly website?: string;
  readonly sourceId?: Id;
  readonly pipelineId?: Id;
  readonly stageId?: Id;
  readonly assignedUserId?: Id;
  readonly estimatedValue?: number;
  readonly currency?: string;
  readonly priority?: Priority;
  readonly description?: string;
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {
  readonly statusId?: Id;
  readonly nextFollowUpAt?: string | null;
}

/** Convert a lead into a customer (+ primary contact, + optional opportunity). */
export interface ConvertLeadInput {
  readonly leadId: Id;
  readonly createOpportunity?: boolean;
  readonly opportunityTitle?: string;
  readonly opportunityAmount?: number;
  readonly pipelineId?: Id;
  readonly stageId?: Id;
}

export interface CreateCustomerInput {
  readonly customerType: "individual" | "company";
  readonly displayName: string;
  readonly companyName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly billingAddress?: AddressInput;
  readonly shippingAddress?: AddressInput;
  readonly accountManagerId?: Id;
  readonly currency?: string;
  readonly source?: string;
}

export interface CreateOpportunityInput {
  readonly customerId?: Id;
  readonly leadId?: Id;
  readonly pipelineId: Id;
  readonly stageId: Id;
  readonly title: string;
  readonly amount: number;
  readonly currency?: string;
  readonly assignedUserId?: Id;
  readonly expectedCloseDate?: string | null;
}

export interface MoveOpportunityStageInput {
  readonly opportunityId: Id;
  readonly stageId: Id;
}

export interface CloseOpportunityInput {
  readonly opportunityId: Id;
  readonly outcome: "won" | "lost";
  readonly lostReason?: string;
}

export interface CreateProposalInput {
  readonly customerId: Id;
  readonly contactId?: Id;
  readonly opportunityId?: Id;
  readonly currency?: string;
  readonly issueDate?: string;
  readonly expiryDate?: string | null;
  readonly items: readonly LineItemInput[];
  readonly notes?: string;
  readonly terms?: string;
}

export interface RecordPaymentInput {
  readonly invoiceId: Id;
  readonly amount: number;
  readonly currency?: string;
  readonly paymentMethod: string;
  readonly transactionReference?: string;
  readonly paidAt?: string;
}

export interface CreateTicketInput {
  readonly customerId?: Id;
  readonly contactId?: Id;
  readonly subject: string;
  readonly description?: string;
  readonly departmentId?: Id;
  readonly priority?: Priority;
  readonly source?: "email" | "portal" | "phone" | "chat" | "manual";
}
